---
title: Monthly Inactive Accounts Report
layout: page
date: 2025-07-27
---

Description: List all inactive users have not logged on for 90 days or more.
SPL:

```spl
| inputlookup ad_users.csv
| eval last_logon=strptime(lastLogonTimestamp." +0000","%Y-%m-%dT%H:%M:%S.%QZ %z"), "Days Since Last Logon"=round((now()-last_logon)/86400), creation_time=strptime(whenCreated,"%Y-%m-%d %H:%M:%S%z"), "Days Since Account Created"=round((now()-creation_time)/86400)
| where 'Days Since Last Logon'>90 OR (lastLogonTimestamp=="(blank)" AND 'Days Since Account Created'>90)
| eval "Last Login Date"=strftime(last_logon, "%d/%m/%Y"), Created=strftime(creation_time, "%d/%m/%Y %I:%M:%S %p"), "Password Never Expires"=if(isnotnull(mvfind(userAccountControl, "DONT_EXPIRE_PASSWD")), "True", "False")
| rename domain AS Domain, displayName AS "Display Name", sAMAccountName AS UserName, mail AS eMail
| sort Domain, UserName
| table Domain, "Display Name", UserName, eMail, "Last Login Date", "Days Since Last Logon", Created, "Days Since Account Created", "Password Never Expires"
```
