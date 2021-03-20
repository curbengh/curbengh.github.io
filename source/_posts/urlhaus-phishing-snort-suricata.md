---
title: urlhaus-filter and phishing-filter available as Snort and Suricata rules
excerpt: Tested on Snort 2, Snort 3 and Suricata 6
date: 2021-03-20
tags:
- security
---

[urlhaus-filter](https://gitlab.com/curben/urlhaus-filter) and [phishing-filter](https://gitlab.com/curben/phishing-filter) are blocklists that target malware and phishing websites respectively. The blocklists are available in many formats:

- uBlock Origin (urlhaus-filter is bundled by default)
- Pi-hole
- AdGuard Home
- AdGuard (browser extension)
- Vivaldi 3.3+
- Hosts file
- Dnsmasq
- BIND
- Unbound
- IE9+

In addition to the above formats/software, they are now also available as [Snort](https://www.snort.org/) and [Suricata](https://suricata-ids.org/) IDS rulesets. Both Snort 2 and 3 are supported; a vast majority of Linux distribution have not support v3 yet and there are no official v3 binaries. Note that Snort 2 ruleset is not compatible with Snort 3 and vice versa.

I planned to create these IDS rulesets for a long time, but held it off because upstream [URLhaus](https://urlhaus.abuse.ch) already support them and there was no user request. I finally decided to go for it after the product announcement of [AWS Firewall](https://aws.amazon.com/blogs/aws/aws-network-firewall-new-managed-firewall-service-in-vpc/) with its support of custom Suricata ruleset, plus incomplete support of URLhaus on Snort 2 ruleset.

Installation guide as follow.

## urlhaus-filter

### Snort2

```
# Download ruleset
curl -L "https://curben.gitlab.io/malware-filter/urlhaus-filter-snort2-online.rules" -o "/etc/snort/rules/urlhaus-filter-snort2-online.rules"

# Create a new cron job for daily update
printf '#!/bin/sh\ncurl -L "https://curben.gitlab.io/malware-filter/urlhaus-filter-snort2-online.rules" -o "/etc/snort/rules/urlhaus-filter-snort2-online.rules"\n' > /etc/cron.daily/urlhaus-filter

# cron job requires execution permission
chmod 755 /etc/cron.daily/urlhaus-filter

# Configure Snort to use the ruleset
printf "\ninclude \$RULE_PATH/urlhaus-filter-snort2-online.rules\n" >> /etc/snort/snort.conf
```

### Snort3

```
# Download ruleset
curl -L "https://curben.gitlab.io/malware-filter/urlhaus-filter-snort3-online.rules" -o "/etc/snort/rules/urlhaus-filter-snort3-online.rules"

# Create a new cron job for daily update
printf '#!/bin/sh\ncurl -L "https://curben.gitlab.io/malware-filter/urlhaus-filter-snort3-online.rules" -o "/etc/snort/rules/urlhaus-filter-snort3-online.rules"\n' > /etc/cron.daily/urlhaus-filter

# cron job requires execution permission
chmod 755 /etc/cron.daily/urlhaus-filter
```

Configure Snort to use the ruleset:

``` diff /etc/snort/snort.lua
ips =
{
  variables = default_variables,
+  include = 'rules/urlhaus-filter-snort3-online.rules'
}
```

### Suricata

```
# Download ruleset
curl -L "https://curben.gitlab.io/malware-filter/urlhaus-filter-suricata-online.rules" -o "/etc/suricata/rules/urlhaus-filter-suricata-online.rules"

# Create a new cron job for daily update
printf '#!/bin/sh\ncurl -L "https://curben.gitlab.io/malware-filter/urlhaus-filter-suricata-online.rules" -o "/etc/suricata/rules/urlhaus-filter-suricata-online.rules"\n' > /etc/cron.daily/urlhaus-filter

# cron job requires execution permission
chmod 755 /etc/cron.daily/urlhaus-filter
```

Configure Suricata to use the ruleset:

``` diff /etc/suricata/suricata.yaml
rule-files:
  - local.rules
+  - urlhaus-filter-suricata-online.rules
```

## phishing-filter

### Snort2

```
# Download ruleset
curl -L "https://curben.gitlab.io/phishing-filter-mirror/phishing-filter-snort2.rules" -o "/etc/snort/rules/phishing-filter-snort2.rules"

# Create a new cron job for daily update
printf '#!/bin/sh\ncurl -L "https://curben.gitlab.io/phishing-filter-mirror/phishing-filter-snort2.rules" -o "/etc/snort/rules/phishing-filter-snort2.rules"\n' > /etc/cron.daily/phishing-filter

# cron job requires execution permission
chmod 755 /etc/cron.daily/phishing-filter

# Configure Snort to use the ruleset
printf "\ninclude \$RULE_PATH/phishing-filter-snort2.rules\n" >> /etc/snort/snort.conf
```

### Snort3

```
# Download ruleset
curl -L "https://curben.gitlab.io/phishing-filter-mirror/phishing-filter-snort3.rules" -o "/etc/snort/rules/phishing-filter-snort3.rules"

# Create a new cron job for daily update
printf '#!/bin/sh\ncurl -L "https://curben.gitlab.io/phishing-filter-mirror/phishing-filter-snort3.rules" -o "/etc/snort/rules/phishing-filter-snort3.rules"\n' > /etc/cron.daily/phishing-filter

# cron job requires execution permission
chmod 755 /etc/cron.daily/phishing-filter
```

Configure Snort to use the ruleset:

``` diff /etc/snort/snort.lua
ips =
{
  variables = default_variables,
+  include = 'rules/phishing-filter-snort3-online.rules'
}
```

### Suricata

```
# Download ruleset
curl -L "https://curben.gitlab.io/phishing-filter-mirror/phishing-filter-suricata.rules" -o "/etc/suricata/rules/phishing-filter-suricata.rules"

# Create a new cron job for daily update
printf '#!/bin/sh\ncurl -L "https://curben.gitlab.io/phishing-filter-mirror/phishing-filter-suricata.rules" -o "/etc/suricata/rules/phishing-filter-suricata.rules"\n' > /etc/cron.daily/phishing-filter

# cron job requires execution permission
chmod 755 /etc/cron.daily/phishing-filter
```

Configure Suricata to use the ruleset:

``` diff /etc/suricata/suricata.yaml
rule-files:
  - local.rules
+  - phishing-filter-suricata.rules
```