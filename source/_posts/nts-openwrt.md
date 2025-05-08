---
title: Configuring NTS in OpenWRT
excerpt: Obtain time in an authenticated manner
date: 2024-10-12
updated: 2025-05-08
tags:
  - openwrt
---

Network Time Security (NTS) is a security extension to the Network Time Protocol (NTP) to provide integrity and authenticity using TLS, and [other features](https://datatracker.ietf.org/doc/html/rfc8915#name-objectives). Despite the use of TLS, NTS does not provide confidentiality as the NTP data itself is not encrypted. Other security extension (unrelated to NTP) like DNSSEC also does not provide confidentiality because the DNS data is not encrypted. Even TLS itself is not fully encrypted because Client Hello is still sent in the clear, at least until [Encrypted Client Hello](https://blog.cloudflare.com/announcing-encrypted-client-hello/) is standardised.

Back to OpenWRT, first SSH into the device.

Disable `sysntpd` so that there is only one NTP client.

```
service sysntpd stop
service sysntpd disable
```

Install `chrony-nts` package, `chrony` package does not support NTS.

```
opkg update
opkg install chrony-nts
```

Disable NTP in chrony.

```
uci set chrony.@pool[0].disabled='1'
uci set chrony.@dhcp_ntp_server[0].disabled='1'
```

Add [NTS servers](https://github.com/jauderho/nts-servers), preferably at least two and they are geographically close.

```
uci set chrony.cloudflare='server'
uci set chrony.cloudflare.hostname='time.cloudflare.com'
uci set chrony.cloudflare.iburst='yes'
uci set chrony.cloudflare.nts='yes'
uci set chrony.netnod='server'
uci set chrony.netnod.hostname='nts.netnod.se'
uci set chrony.netnod.iburst='yes'
uci set chrony.netnod.nts='yes'
```

Use NTS only.

```plain /etc/chrony.d/20-nts.conf
# Require at least 2 reachable sources
minsources 2

# Use NTS sources only
authselectmode require

# Disable chronyc remote access
cmdport 0
```

The actual config is actually in "/var/etc/chrony.d/", but the "/var" folder is not persistent across reboot.
So, a workaround is to save it into "/etc/chrony.d/", then copy to "/var" after boot.

Append these lines to "/etc/rc.local" before `exit 0`.

```sh /etc/rc.local
sleep 60
mkdir -p "/var/etc/chrony.d/"
cp "/etc/chrony.d/20-nts.conf" "/var/etc/chrony.d/20-nts.conf"
service chronyd restart
```

Preserve the config during upgrade.

```
echo "/etc/chrony.d/" >> /etc/sysupgrade.conf
```

Commit the changes and restart the daemon.

```
uci commit chrony
service chronyd restart
```

Verify the config.

```
cat /etc/config/chrony

config pool
	option hostname '2.openwrt.pool.ntp.org'
	option maxpoll '12'
	option iburst 'yes'
  option disabled 'yes'

config dhcp_ntp_server
	option iburst 'yes'
	option disabled 'yes'

config server cloudflare
	option hostname 'time.cloudflare.com'
	option iburst 'yes'
	option nts 'yes'

config server netnod
	option hostname 'nts.netnod.se'
	option iburst 'yes'
	option nts 'yes'

config allow
	option interface 'lan'

config makestep
	option threshold '1.0'
	option limit '3'

config nts
	option rtccheck 'yes'
	option systemcerts 'yes'
```

```
cat /var/etc/chrony.d/10-uci.conf

server time.cloudflare.com iburst nts
server nts.netnod.se iburst nts
allow 192.168.1.1/24
makestep 1.0 3
nocerttimecheck 1
```

```
chronyc sources

MS Name/IP address         Stratum Poll Reach LastRx Last sample
===============================================================================
^* time.cloudflare.com           3   6    17    13  -1188us[-1395us] +/-   11ms
^- nts.netnod.se                 2   6    17    13   +229us[  +22us] +/-   85ms
```

Lastly, highly recommend to hardcode the IP address of the chosen NTP servers into "/etc/hosts", especially when using DNSSEC-validating DNS client, to avoid unresolvable NTS domains when the time is not correct.
