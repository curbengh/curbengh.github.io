---
title: Azure AD SSO integration with ServiceNow
excerpt: Difference of SAML and SCIM
date: 2023-08-27
tags:
  - sso
  - servicenow
  - azure-ad
---

Single sign-on (SSO) enables a user to access multiple systems using one login. Whenever a user wants to access a system, the system will redirect the user to an identity provider which has an existing account for that user; once the user authenticates with the identity provider successfully, the identity provider will redirect the user back to the system and the user can then access it. The system does not have the user's password and the identity provider does not share it either.

In an enterprise environment, SSO provides convenience to the staff and several benefits to the enterprise. Three benefits to the enterprise:

1. Less accounts to create (onboarding), maintain and disable/delete (offboarding).
2. During offboarding, disabling an account from the identity provider will also revoke access to SSO-enabled systems, thus providing better security.
3. Identity provider is much more likely to support multi-factor authentication (MFA), enabling more systems to be MFA-secured.

SSO does not necessarily provide better security all the time. Threat actor can utilise a compromised account to access any SSO-enabled system that the account has access prior, leading to wider blast radius. There are three mitigations to reduce such risk:

1. Enforce MFA to minimise the chance of accounts being compromised.
2. Limit access to SSO-enabled systems through access control list (ACL).
3. Enforce conditional access. For example, identity provider can be configured to prompt for second-factor authentication when accessing a sensitive system, even when the user is already logged in using MFA before. Identity provider could also enforce phish-resistant MFA for access to sensitive systems.

## SSO in Azure AD

Configuring a system to utilise Azure Active Directory (AAD) involves setting up [SAML](https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language) and optionally [SCIM](https://en.wikipedia.org/wiki/System_for_Cross-domain_Identity_Management). SCIM is only used to provision users, SAML can supply the necessary information (email, name, phone, etc) to the SSO-enabled system to create users on-demand upon first login (of that user) and update the user information in subsequent logins. In ServiceNow SAML configuration, under "User Provisioning" tab, on-demand user provision can be enabled by ticking "Auto Provisioning User" and "Update User Record Upon Each Login".

During the initial SAML setup in ServiceNow, it requires a successful test login (using an AAD account, in this case) before SSO can be activated. This will fail if the user does not exist in ServiceNow yet. To pass it, simply create a new ServiceNow user that has the same email as the test AAD account. If you are confident the SAML setting is correct, the test login can be [made optional](https://docs.servicenow.com/en-US/bundle/vancouver-platform-security/page/integrate/single-sign-on/task/t_TestIdPConnections.html). It is easier to utilise the "[Automatically configure](https://learn.microsoft.com/en-us/azure/active-directory/saas-apps/servicenow-tutorial#configure-servicenow) ServiceNow" option because it will also configure the transform mapping in ServiceNow which enables it to map SAML attributes (emailaddress, name, etc) to the respective ServiceNow's sys_user table columns.

In SAML configuration, AAD uses the "user.userprincipalname" (UPN) attribute as the unique user identifier. UPN is _usually_ equivalent to the email address, so the [AAD guide](https://learn.microsoft.com/en-us/azure/active-directory/saas-apps/servicenow-tutorial#configure-servicenow) recommends to change the user identifier to "email" in ServiceNow's Multi-Provider SSO. However, it is possible for UPN to be different to email and will prevent affected users from accessing ServiceNow. UPN or email is also not immutable, a user may change their email to reflect a name change. This can results in duplicate users, if "Auto Provisioning User" is enabled in ServiceNow.

Even though [SCIM](#scim) can avoid duplicates, users with a recently changed email may still face access issue for a while because AAD SCIM is not real-time and each sync can take up to [30 minutes](https://learn.microsoft.com/en-us/azure/active-directory/app-provisioning/application-provisioning-when-will-provisioning-finish-specific-user#how-long-will-it-take-to-provision-users), longer if the attribute is sourced from on-premise AD (which will needs to be synced-up to AAD using AD Connect, and then to ServiceNow using SCIM).

To avoid this issue, there are three choices of source attribute that are immutable, each of them is suitable as a unique user identifier in SAML. They do not map with existing ServiceNow sys_user columns, so you will need a new column and a new mapping in the transform map.

1. `user.objectid`: for AAD-only environment.
2. `user.onpremisesimmutableid`: refers to GUID. AAD uses this attribute as the primary key to identify on-premise AD user.
3. `user.onpremisesecurityidentifier`: refers to SID, may not necessarily synced-up to AAD.

## SCIM

With on-demand user provision, it is possible to use SAML without SCIM. However, since a user is only created after the initial SSO login, user lookup will be limited. For example in ServiceNow, a support staff will not be able to enter the "this incident affects user X" field if that user has never login to ServiceNow before. SCIM can provision all users found in an identity provider into a target system. It is also possible to provision based on conditions, such as to exclude generic or service accounts.

Prior to configuring SCIM in ServiceNow, it is essential to disable SAML on-demand user provision "Auto Provisioning User" and "Update User Record Upon Each Login". This is to avoid SAML-sourced attribute from overwriting SCIM's in sys_user table, because SAML mapping does not necessarily match SCIM's.

In AAD SCIM, the default primary mapping is userPrincipalName -> user_name with user_name being set as the primary key (Show advanced options -> Edit attribute list for ServiceNow). A mapping is considered as primary when it has "[Match objects using this attribute](https://learn.microsoft.com/en-us/azure/active-directory/app-provisioning/customize-application-attributes)" enabled and has the lowest value in "Matching precedence". "Match objects..." is to configure SCIM to utilise a mapping to check existence of each user, i.e. provision a user in the target system if it does not exist. Multiple mappings can be used in different order, in case a source attribute is empty. At least one mapping must have "Match objects..." enabled.

| user | employeeId (AAD) | mail (AAD)    | employee_number (SNow) | email (SNow)  |
| ---- | ---------------- | ------------- | ---------------------- | ------------- |
| A    | 123              | _empty_       | 123                    | _empty_       |
| B    | _empty_          | b@example.com | _empty_                | b@example.com |

What if user B has employeeId later on? There is a (unconfirmed) possibility that it can results in duplicate user B in the target system.

| user                    | employeeId (AAD) | mail (AAD)    | employee_number (SNow) | email (SNow)  |
| ----------------------- | ---------------- | ------------- | ---------------------- | ------------- |
| A                       | 123              | _empty_       | 123                    | _empty_       |
| B                       | 456              | b@example.com | _empty_                | b@example.com |
| B (_duplicate in SNow_) | 456              | b@example.com | 456                    | b@example.com |

This can be avoided by using a **mandatory** and **immutable** AAD attribute. Similar to the three options mentioned in the previous section, they are:

1. `objectId`
2. `immutableId`
3. `onPremisesSecurityIdentifier`

Steps to configure:

1. In ServiceNow, add a new column in sys_user ServiceNow table.
2. In AAD SCIM, Show advanced options -> Edit attribute list for ServiceNow, add a new attribute with the same name as configured in previous step. Tick "Required" and "Primary", untick "Primary" in existing attribute (usually "user_name").
3. Add a new mapping with "Match objects" enabled.
4. Disable it in existing mapping (usually "userPrincipalName -> user_name").
5. Save

## Single-space value

An interesting issue I encountered which was ultimately caused by an AAD attribute that had a value of just a single space. I initially configured a SCIM mapping as follow: Coalesce([attributeA], [attributeB]) -> u*column_z. Coalesce() returns the first non-empty value. I knew attributeB is never empty, however somehow some users had *(blank)\_ value in their u_column_z.

I fired up the Expression Builder in AAD SCIM and tried "Coalesce([attributeA], [attributeB])" on one of the affected users. It returned "Your expression is valid, but your expression evaluated to an empty string". Tried "ToUpper([attributeA])", same. Tried "IsNullorEmpty([attributeA])", got "false". If an attribute has empty value, it will return "null". So, this meant attributeA is not empty. But what could it be?

```
IIF([attributeA]=" ", "space", "no space")

space
```

AAD SCIM trims any leading and trailing whitespaces in the output, similar to [`trim()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim) JavaScript method.

Aside from an obvious fix by removing that space in AAD, a workaround like "Coalesce(Trim([attributeA]), [attributeB])" works too.
