---
title: Atlassian and Jira portal-only SSO
excerpt: SAML vs OAuth
date: 2025-02-02
updated: 2025-02-03
tags:
  - jira
  - sso
---

Single sign-on (SSO) enables users to use their existing enterprise account to logon to an Atlassian platform (e.g. Jira, Confluence, etc) seamlessly without entering credential. I write this post to clear up two points about configuring SSO in Atlassian platform: integration level and Atlassian account's involvement. First, there are two integration methods: [organisation-wide](https://support.atlassian.com/security-and-access-policies/docs/configure-saml-single-sign-on-with-an-identity-provider/) and [Jira portal-only customer](https://support.atlassian.com/security-and-access-policies/docs/configure-saml-single-sign-on-for-portal-only-customers/). Second, in Atlassian platform, logging onto an Atlassian account using a third-party account (i.e. Google, Microsoft, Apple and Slack) or OAuth is _not_ considered as SSO, the only supported SSO is through SAML.

## Third-party login is not SSO

Before I jump into [integration method](#integration-method), it is essential to distinct an enterprise account (as an SSO identity provider) and an Atlassian account. It is possible to sign up/in to Atlassian account without entering Atlassian password by going through an existing OAuth-powered third-party account such as Microsoft account. This can easily lead to a misconception thinking that this is SSO because OAuth is [often associated](https://www.cloudflare.com/en-gb/learning/access-management/what-is-oauth/) with SSO.

If I have an Entra ID account which means I also have a Microsoft account, I can head to id.atlassian.com, hit "Continue with Microsoft", enter my Microsoft account's credential (which is _also_ my Entra ID's), then enter email confirmation code, and I will get an Atlassian account without ever creating an Atlassian password.

Adding to the confusion is the fact that the previous process will also create an enterprise application called "Atlassian" in Entra ID to provide OAuth identity, the same place to configure SAML by creating another enterprise application.

In Atlassian environment, OAuth is not SSO as it only involves authorisation not authentication — user authorises Atlassian to use their email address. Whether I sign up/in using Atlassian password or OAuth, I will get the same Atlassian account because my email address is the same. This means if I sign up using OAuth, I can later create an Atlassian password through password reset email; conversely, I could also create an Atlassian password then login using OAuth.

Once SAML — the true SSO in this case — is configured, user will not be able to sign up an Atlassian account using enterprise email because the email address or domain would have already been claimed by the organisation that administers the enterprise account. Entering enterprise email address in id.atlassian.com would redirect users to SAML logon URL instead of OAuth's. Atlassian organisation admin can claim all users or a subset.

As a rule of thumb, if the logon process redirects user to id.atlassian.com, it is not SSO.

## Integration method

The main difference between organisation-wide and Jira portal-only customer SSO is that the former requires domain verification on the domain of the organisation's email address, which is also the tenancy domain of identity provider (IdP). Organisation just need to publish a TXT record "atlassian-domain-verification=xxx" on their domain to prove ownership. However, what if the organisation does not own that domain? Imagine a conglomerate with a centralised identity where all subsidiaries use the same email domain (`@example.com`) and each subsidiary is given a subdomain instead (`sub.example.com`).

In the conglomerate example, the central IT who administers the IdP tenancy would need to dedicate a resource to manage an Atlassian organisation, as in an enterprise subscription. This may not always be possible in situations such as low uptake of Atlassian product among subsidiaries, hence the central IT is reluctant to sponsor that resource. Even with [multi-org SSO](https://community.atlassian.com/t5/Articles/Multiple-orgs-can-verify-and-claim-users-from-the-same-domain/ba-p/2688009), where multiple organisations can share the same domain, the central IT may not be comfortable delegating claiming of users to subsidiaries, especially in a low uptake situation.

In that situation, an alternative is to configure portal-only customer SSO instead, applicable only to Jira. Portal-only customer SSO does not require domain verification, in fact domain ownership is not even relevant at all. Portal-only customer SSO mainly caters to IT vendors to enable their clients to raise support ticket using existing identity. An IT vendor's Jira portal is configured to accept identities provided and signed by client organisation's IdP. Then, Identifier and Reply URLs of the support portal are added to the client's IdP. Once configured, users of client organisation can then access the IT vendor's support portal through SSO.

A notable caveat of portal-only customer SSO is that only applies to _customers_. If organisation-wide SSO is not configured, service desk would logon using an Atlassian account to respond to tickets. When an agent access a portal (`xxx.atlassian.net/servicedesk/customer/portals`) and enter their email, the logon button is shown as "Continue with Atlassian account", instead of "Continue with single sign-on".

How does a Jira portal detect whether an email should login with Atlassian account or SSO? It checks whether that email exists as a _user_ in the Atlassian organisation of a portal who is also known as an _agent_ — paid user that counts toward Atlassian subscription. If an email exists as a user under the Directory tab of Atlassian Administration (admin.atlassian.com) — regardless whether that user is an organisation/Jira admin or not — then "Continue with Atlassian account" will always appear. For "Continue with single sign-on" to appear, that email can only exists as a Jira [portal-only customer](https://support.atlassian.com/user-management/docs/manage-jira-service-management-customer-accounts/), not an agent. The email does not even need to exist as a customer (portal-only account) if it has not been used to logon to that portal. User (or rather, _customer_) management will be mainly handled by the IdP under the enterprise application configuration. Jira admin can then choose whether to automatically or manually approve customer access.

What if organisation-wide SSO is configured? How does Jira portal logon look like if a customer is part of the same organisation? I'm not sure. I'd imagine "Continue with Atlassian account" will be shown and then redirect to SAML logon URL.

### Atlassian Guard

Both organisation-wide and Jira portal-only customer SSO require [Atlassian Guard](https://www.atlassian.com/software/guard/pricing), but portal-only customer accounts do not count toward Jira and Atlassian Guard subscriptions.

### Domain verification

Enterprise subscription requires domain verification even when organisation-wide SSO is not used. If a subsidiary or business unit does not have access to the central identity's domain (`@example.com`), it can verify its own (sub)domain instead (`sub.example.com`). [Multi-org domain](https://community.atlassian.com/t5/Articles/Multiple-orgs-can-verify-and-claim-users-from-the-same-domain/ba-p/2688009) is also an option.
