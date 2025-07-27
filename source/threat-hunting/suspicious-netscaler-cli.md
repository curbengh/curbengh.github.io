---
title: Suspicious Netscaler CLI
layout: page
date: 2025-07-27
---

References: [1](https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-201a)
SPL:

```spl
index=netscaler (citrix_netscaler_event_name="CMD_EXECUTED" OR event_source="CLI") Command IN ("*database.php*", "*ns_gui/vpn*", "*/flash/nsconfig/keys/updated*", "*LDAPTLS_REQCERT*", "*ldapsearch*", "*openssl*", "*salt*")
| eval Time = strftime(_time, "%Y-%m-%d %H:%M:%S %z")
| table Time, user, host, Command
```
