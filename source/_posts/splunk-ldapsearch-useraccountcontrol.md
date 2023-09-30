---
title: Query LOCKOUT and PASSWORD_EXPIRED flags on Splunk SA-ldapsearch
excerpt: userAccountControl vs. msDS-User-Account-Control-Computed
date: 2023-10-01
tags:
  - splunk
---

[SA-ldapsearch](https://splunkbase.splunk.com/app/1151) (Splunk Supporting Add-on for Active Directory) has a useful feature that parses "userAccountControl" flags into a multivalue. For example, instead of showing "514", it shows `[ACCOUNTDISABLE, NORMAL_ACCOUNT]` instead. However, I noticed `LOCKOUT` and `PASSWORD_EXPIRED` flags are not shown even though I was sure the accounts I queried have either of those flags set. Those flags are indeed listed under documentations for "userAccountControl": [Windows Server](https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/useraccountcontrol-manipulate-account-properties#list-of-property-flags) and [Active Directory Schema](https://learn.microsoft.com/en-gb/windows/win32/adschema/a-useraccountcontrol).

Despite being mentioned in the documentations, in that Windows Server doc, there is a note that says those flags have been moved to "[msDS-User-Account-Control-Computed](https://learn.microsoft.com/en-gb/windows/win32/adschema/a-msds-user-account-control-computed)" attribute since Windows Server 2003. But when I queried that attribute, I got a decimal value which meant the parsing function was not applied.

To apply flag-parsing function on "msDS-User-Account-Control-Computed":

```python SA-ldapsearch/bin/packages/app/formatting_extensions.py
    '1.2.840.113556.1.4.8':             format_user_flag_enum,         # User-Account-Control
    '1.2.840.113556.1.4.1460':          format_user_flag_enum,         # ms-DS-User-Account-Control-Computed
```

First line is an existing one, the second line is the new one.

For the sake of completeness, that function can also be patched to parse other flags of "msDS-User-Account-Control-Computed". I created [a script](https://gitlab.com/curben/splunk-scripts/-/tree/main/SA-ldapsearch?ref_type=heads) to apply the following patch directly on "[splunk-supporting-add-on-for-active-directory\_\*.tgz](https://splunkbase.splunk.com/app/1151)" and save it to a new app package "SA-ldapsearch\_\*.tgz".

```patch
--- SA-ldapsearch/bin/packages/app/formatting_extensions.py	2023-09-06 00:00:00.000000000 +0000
+++ SA-ldapsearch/bin/packages/app/formatting_extensions.py	2023-09-06 00:00:00.000000001 +0000
@@ -721,6 +721,12 @@
         names.append('PASSWORD_EXPIRED')
     if flags & 0x1000000:
         names.append('TRUSTED_TO_AUTHENTICATE_FOR_DELEGATION')
+    if flags & 0x2000000:
+        names.append('NO_AUTH_DATA_REQUIRED')
+    if flags & 0x4000000:
+        names.append('PARTIAL_SECRETS_ACCOUNT')
+    if flags & 0x8000000:
+        names.append('USE_AES_KEYS')

     # Zero or one of these flags may be set

@@ -822,6 +828,7 @@
     '1.2.840.113556.1.4.1303':          format_sid,                    # Token-Groups-No-GC-Acceptable

     '1.2.840.113556.1.4.8':             format_user_flag_enum,         # User-Account-Control
+    '1.2.840.113556.1.4.1460':          format_user_flag_enum,         # ms-DS-User-Account-Control-Computed

     # formatter specially for msExchMailboxSecurityDescriptor
     '1.2.840.113556.1.4.7000.102.80' : format_security_descriptor,     # msExchMailboxSecurityDescriptor

```
