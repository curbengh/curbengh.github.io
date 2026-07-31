---
title: Capture dnsmasq DNS and DHCP logs in OpenWRT using rsyslog
excerpt: without using Pi-hole
date: 2026-07-30
updated: 2026-07-31
tags:
  - openwrt
---

I have several devices (e.g. [vacuum cleaner](/microblog/2026/07/30/xiaomi-mijia-mi-robot-vacuum-mop-2-mjst1s-network-requirements/), [home battery](/microblog/2026/07/31/goodwe-esa-ess-network-requirements/)) that I connect them to untrusted network separated from the main network. Recently, I was interested to know the internet domains that they use. In this setup, I log DNS queries to local rsyslog server which then save to an external USB drive. For NAT table, I use cron to copy filtered "/proc/net/nf_conntrack" to that drive every minute.

## Create a new network

Here is how I create a separate network without VLAN because I don't need the untrusted network to talk to the main network and vice versa. When referring to LuCI web, I will be using `/admin/network/network` to refer to `http://<router-address>/cgi-bin/luci/admin/network/network`.

1. Network > Interfaces ("/admin/network/network") > Interfaces tab > Add new interface.

    - Name: untrustedlan
    - Protocol: Static address
    - Device: unspecified

2. Edit the new interface. In this example, the untrusted network uses 192.168.100.1/24 subnet.

    - IPv4 address: 192.168.100.1
    - IPv4 network: 255.255.255.0 (/24)
    - DHCP Server tab > General Setup > untick "Ignore interface".
    - DHCP Server tab > IPv4 Settings > DHCPv4 Service > enabled.

3. Network > Firewall ("/admin/network/firewall") > General Settings tab > Add a new zone.

    - Name: untrustedfw
    - Input: accept
    - Output: accept
    - Intra zone forward: accept
    - Covered networks: untrustedlan
    - Allow forward to destination zones: wan

4. Network > Wireless ("/admin/network/wireless") > radio0 > Add.

    - ESSID: untrustedwifi
    - Network: untrustedlan
    - Wireless Security tab
        - Encryption: WPA2-PSK (some IoT devices are not compatible with WPA2+WPA3 mixed mode)
        - Key: *changeme*

Save & Apply

### Assign a LAN port to untrusted network

If an untrusted device needs wired connection, we can assigned a LAN port to the untrusted network created in the previous section.

1. Network > Interfaces ("/admin/network/network") > Devices tab > Configure "br-lan" > Bridge ports > untick the relevant switch port.
2. Network > Interfaces ("/admin/network/network") > Interfaces tab > Edit "untrustedlan" > Device row > select the relevant switch port.

Save & Apply

## Logging using rsyslog

Install rsyslog and logrorate packages.

Configure rsyslog to listen on 127.0.0.1:514 so only the router can syslog to it, accepts only Local4 facility (chosen simply based on [this guide](https://www.manageengine.com/products/eventlog/logging-guide/syslog/syslog-facilities.html#context-5)), message that contains DNS A record query and response, plus DHCP response. DNS response can be useful as an accurate way to reverse DNS the IP in the NAT table. DHCP response is to keep track client IP which may change due to MAC address randomisation. "/mnt/sda1/" is the location of external USB drive, update accordingly.

Remove content of "/etc/config/[rsyslog](https://github.com/openwrt/packages/blob/7afd539dbf720229fce8f783269e4e5a735cbb5d/admin/rsyslog/files/20_rsyslog#L7:L34)".

``` plain /etc/rsyslog.conf
module(load="imudp")
input(type="imudp" port="514" address="127.0.0.1")
$ActionFileDefaultTemplate RSYSLOG_TraditionalFileFormat
if $syslogfacility-text == 'local4' and ($msg contains 'query[A]' or $msg contains 'reply' or $msg contains ' DHCP ') and ($msg contains '192.168.100.') then /mnt/sda1/logs/dns
```

Verify config and restart rsyslog.

```
rsyslogd -f /etc/rsyslog.conf -N1
service rsyslog restart
```

Rotate the DNS and NAT log files daily with compression and keep it for 7 days.

``` plain /etc/logrotate.d/dns-conntrack.conf
/mnt/sda1/logs/dns /mnt/sda1/logs/conntrack {
    compress
    copytruncate
    delaycompress
    daily
    rotate 7
    missingok
    notifempty
    postrotate
        service log restart
        sleep 1
        logger -p warn -s "Log rotation complete"
    endscript
}
```

Store NAT table every minute filtered to specific subnet/IP. Rotate logs close to midnight (of router timezone).

Append these two lines.

``` plain /etc/crontabs/root
* * * * * grep -F '192.168.100.' /proc/net/nf_conntrack >> /mnt/sda1/logs/conntrack
58 23 * * * logrotate /etc/logrotate.conf
```

Append these two lines

``` plain /etc/sysupgrade.conf
/etc/rsyslog.conf
/etc/logrotate.d/
```

1. In LuCI, System > System ("/admin/system/system") > Logging tab

    - External system log server: 127.0.0.1
    - External system log server port: 514
    - External system log server protocol: UDP

2. Network > DNS ("/admin/network/dns") > Log tab, tick "Log queries" and select LOCAL4.
3. Go to some websites in that untrusted network.
4. Check "/mnt/sda1/logs/dns" and "/mnt/sda1/logs/conntrack".

``` plain /mnt/sda1/logs/dns
Jul 30 01:23:40 OpenWrt dnsmasq[1]: 86 127.0.0.1/57738 DHCP 192.168.100.101 is iotxxx.lan
Jul 30 01:23:45 OpenWrt dnsmasq[1]: 118 192.168.100.101/1431 query[A] example.com from 192.168.100.101
```

``` plain /mnt/sda1/logs/conntrack
ipv4     2 tcp      6 src=192.168.100.101 dst=104.20.23.154 sport=35058 dport=443 packets=3 bytes=123 src=104.20.23.154 dst=100.64.12.34 sport=443 dport=35058 packets=4 bytes=567 [HW_OFFLOAD] mark=0 zone=0 use=3
```

## List domains

Search all queries of A record from 192.168.100.101 excluding query for local ("lan") hostnames. Adjust accordingly if you use other local domain, Network > DNS ("/admin/network/dns") > General tab > Local domain

`grep -E '192\.168\.100\.101/\S+ query\[A\]' /mnt/sda1/logs/dns | cut -d' ' -f9 | grep -F -v '.lan from' | sort -u`
