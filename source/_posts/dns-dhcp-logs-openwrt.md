---
title: Monitor traffic in OpenWRT using rsyslog
excerpt: Store dnsmasq (DHCP & DNS) and conntrack logs using rsyslog
date: 2026-07-30
updated: 2026-08-02
tags:
  - openwrt
---

I have several devices (e.g. [vacuum cleaner](/microblog/2026/07/30/xiaomi-mijia-mi-robot-vacuum-mop-2-mjst1s-network-requirements/), [home battery](/microblog/2026/07/31/goodwe-esa-ess-network-requirements/)) that I connect them to untrusted network separated from the main network. Recently, I was interested to know the internet domains and ports that they use. In this setup, I log DNS queries to local rsyslog server which then save to an external USB drive. From NAT table I can track the destination ports, so I use cron to take a copy of filtered "/proc/net/nf_conntrack". From the logs, I use [scripts](#monitor-outgoing-connections) to create a summary of internet connections.

## Create a new network and link to wifi ssid

Here is how I create a separate network without VLAN because I don't need the untrusted network to talk to the main network and vice versa. When referring to LuCI web, I will be using `/admin/network/network` to refer to `http://<router-address>/cgi-bin/luci/admin/network/network`.

Save & Apply in each step.

1. In LuCI, Network > Interfaces ("/admin/network/network") > Interfaces tab > Add new interface.
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

4. Network > Firewall > Port Forwards tab ("/admin/network/firewall/forwards") > Add. This ensure devices always use the router's DNS, though only applies to plain DNS (port 53) not DoH/DoT/DoQ/DNSCrypt.
   - Name: Intercept-DNS-Untrusted
   - Restrict to address family: IPv4 and IPv6
   - Protocol: TCP and UDP
   - Source zone: untrustedlan
   - External port: 53
   - Destination zone: _unspecified_

5. Network > Wireless ("/admin/network/wireless") > radio0 > Add. radio0 is usually associated with 2.4GHz wifi. Skip radio1/5Ghz since many IoT devices don't support it, they also can't connect to SSID with both 2.4G and 5Ghz.
   - ESSID: untrustedwifi
   - Network: untrustedlan
   - Wireless Security tab
     - Encryption: WPA2-PSK (some IoT devices are not compatible with WPA2+WPA3 mixed mode)
     - Key: _changeme_

### Assign a LAN port to untrusted network (if applicable)

If an untrusted device needs wired connection, we can assign a LAN port to the untrusted network created in the previous section.

1. Network > Interfaces ("/admin/network/network") > Devices tab > Configure "br-lan" > Bridge ports > untick the relevant switch port.
2. Network > Interfaces ("/admin/network/network") > Interfaces tab > Edit "untrustedlan" > Device row > select the relevant switch port.

Save & Apply

## Logging using rsyslog

Install rsyslog and logrorate packages.

Configure rsyslog to listen on 127.0.0.1:514 so only the router can syslog to it, accepts only Local4 facility (chosen simply based on [this guide](https://www.manageengine.com/products/eventlog/logging-guide/syslog/syslog-facilities.html#context-5)), message that contains DNS A record query and response, plus DHCP response. DNS response can be useful as an accurate way to reverse DNS the IP in the NAT table. DHCP response is to keep track client IP which may change due to MAC address randomisation. "/mnt/sda1/" is the location of external USB drive, update accordingly.

Also accept kernel logs logged by [firewall rules](#firewall-rules).

Remove content of "/etc/config/[rsyslog](https://github.com/openwrt/packages/blob/7afd539dbf720229fce8f783269e4e5a735cbb5d/admin/rsyslog/files/20_rsyslog#L7:L34)" then add this config.

```plain /etc/rsyslog.conf
module(load="imudp")
input(type="imudp" port="514" address="127.0.0.1")
$ActionFileDefaultTemplate RSYSLOG_TraditionalFileFormat
if $syslogfacility-text == 'local4' and ($msg contains 'query[A]' or $msg contains 'reply' or $msg contains ' DHCP ') and $msg contains '192.168.100.' then /mnt/sda1/logs/dns
if $syslogfacility-text == 'kern' and $syslogseverity-text == 'warn' and $msg contains 'Block-Other-Ports' then /mnt/sda1/logs/fw
```

Verify config and restart rsyslog.

```
rsyslogd -f /etc/rsyslog.conf -N1
service rsyslog restart
```

Rotate the DNS and NAT log files daily with compression and keep it for 7 days.

```plain /etc/logrotate.d/dns-conntrack-fw.conf
/mnt/sda1/logs/dns /mnt/sda1/logs/conntrack /mnt/sda1/logs/fw {
    compress
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

Copy NAT table every minute filtered to specific subnet/IP. Rotate logs close to midnight (of router timezone).

Append these two lines.

```plain /etc/crontabs/root
* * * * * grep -F '192.168.100.' /proc/net/nf_conntrack >> /mnt/sda1/logs/conntrack
58 23 * * * logrotate /etc/logrotate.conf
```

Append these two lines

```plain /etc/sysupgrade.conf
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

```plain /mnt/sda1/logs/dns
Jul 30 01:23:40 OpenWrt dnsmasq[1]: 86 127.0.0.1/57738 DHCP 192.168.100.101 is iotxxx.lan
Jul 30 01:23:45 OpenWrt dnsmasq[1]: 118 192.168.100.101/1431 query[A] example.com from 192.168.100.101
Jul 30 01:23:46 OpenWrt dnsmasq[1]: 118 192.168.100.101/1431 reply example.com is 100.64.12.34
```

```plain /mnt/sda1/logs/conntrack
ipv4     2 tcp      6 src=192.168.100.101 dst=104.20.23.154 sport=35058 dport=443 packets=3 bytes=123 src=104.20.23.154 dst=100.64.12.34 sport=443 dport=35058 packets=4 bytes=567 [HW_OFFLOAD] mark=0 zone=0 use=3
```

## Monitor outgoing connections

### List A record queries of a client device

List all queries of A record from 192.168.100.101 excluding query for local ("lan") hostnames. Adjust accordingly if you use other local domain, Network > DNS ("/admin/network/dns") > General tab > Local domain.

```
grep -P '192\.168\.100\.101/\d+ query\[A\]' dns | cut -d' ' -f9 | grep -F -v '.lan from' | sort -u
```

### List A record queries of all client devices

```sh
#!/bin/sh

# src_ip src_host
cat dns | \
grep -F ' DHCP ' | \
grep -P -o '[\d.]+ is [^.]+' | \
sed -r 's| is |\t|' | \
sort -u > srcip_srchost

# src_ip dst_host dst_host's IPs
cat dns | \
grep -P -o '[\d.]+\/\d+ reply \S+ is [\d.]+' | \
perl -pe 's|([0-9.]+)\/\d+ reply (\S+) is ([0-9.]+)|\1\t\2|' | \
sort -u > srcip_dsthost

# src_ip src_host dst_host
join -t $'\t' -1 1 -2 1 -o 1.1,2.2,1.2 srcip_dsthost srcip_srchost | \
sort -k 2,2 -k 3,3 | \
sed '1i srcip\tsrchost\tdsthost' > srcip_srchost_dsthost.tsv
```

Output

| srcip           | srchost | dsthost         |
| --------------- | ------- | --------------- |
| 192.168.100.101 | iotxxx  | iot.example.com |

### List all outbound IP addresses and ports with corresponding domains

```sh
#!/bin/sh

# src_ip src_host
cat dns | \
grep -F ' DHCP ' | \
grep -P -o '[\d.]+ is [^.]+' | \
sed -r 's| is |\t|' | \
sort -u > srcip_srchost_dhcp

# src_ip dst_host dst_host's IPs
cat dns | \
grep -P -o '[\d.]+\/\d+ reply \S+ is [\d.]+' | \
# append src_ip>dst_ip column to be used as join key
# 192.168.100.123 google.com 8.8.8.8 192.168.100.123>8.8.8.8
perl -pe 's|([\d.]+)\/\d+ reply (\S+) is ([\d.]+)|\1\t\2\t\3\t\1>\3|' | \
sort -u | \
# sort join-key src_ip>dst_ip
sort -k 4,4 > srcip_dsthost_ip_dns

# src_ip dst_ip protocol dport src_ip>dst_ip
cat conntrack | \
# -a ignore invalid characters in conntrack
grep -Poa '^ipv4\s+\d+\s+\w+\s+\d+(?: \d+)? src=[\d.]+ dst=[\d.]+(?: sport=\d+ dport=\d+)?' | \
# exclude router
grep -Fa -v '.1 ' | \
perl -pe 's|^ipv4\s+\d+ (\w+)\s+\d+(?: \d+)?(?: \w+)? src=([\d.]+) dst=([\d.]+)(?: sport=\d+ dport=(\d+))?|\2\t\3\t\1\t\4\t\2>\3|' | \
# icmp doesn't have port
sed -r 's|\t\t|\t-\t|' | \
sort -u > srcip_dstip_protocol_dport_nat

# src_ip src_host dst_ip protocol dport src_ip>dst_ip
join -t $'\t' -1 1 -2 1 -o 1.1,2.2,1.2,1.3,1.4,1.5 srcip_dstip_protocol_dport_nat srcip_srchost_dhcp | \
# sort join-key src_ip>dst_ip
sort -k 6,6 | \
join -t $'\t' -1 6 -2 4 -a 1 -o 1.1,1.2,1.3,2.2,1.4,1.5,1.6 - srcip_dsthost_ip_dns | \
# set unknown dsthost as "-", connection was made without prior DNS query
sed -r 's|\t\t|\t-\t|' | \
# include only domains that were DNS-queried by specific src_ip, and unknown domains
grep -P '(\t-\t|>)' | \
# remove last column
perl -pe 's/(\t|\t[\d.]+>[\S.]+)$//' | \
sort -u | \
# sort by src_host then dst_host
sort -k 2,2 -k 4,4 | \
sed '1i srcip\tsrchost\tdstip\tdsthost\tprotocol\tdport' > srcip_srchost_dstip_dsthost_protocol_dport.tsv
```

Output

| srcip           | srchost | dstip           | dsthost         | protocol | dport |
| --------------- | ------- | --------------- | --------------- | -------- | ----- |
| 192.168.100.101 | iotxxx  | 123.123.123.123 | iot.example.com | tcp      | 443   |
| 192.168.100.101 | iotxxx  | 208.67.222.222  | -               | udp      | 53    |
| 192.168.100.101 | iotxxx  | 8.8.8.8         | -               | icmp     | -     |

## Firewall rules

Once the required ports have been [identified](#list-all-outbound-ip-addresses-and-ports-with-corresponding-domains), we can create firewall rules to only allow those ports. In this example, we allow only TCP port 80 and 443.

1. In LuCI, Network > Firewall > Traffic Rules tab ("/admin/network/firewall/rules") > Add.
   - Name: Allow-Ports-Untrusted
   - Protocol: TCP
   - Source zone: untrustedlan
   - Destination zone: wan
   - Destination port: 80 443
   - Action: accept

2. Add another rule.
   - Name: Block-Other-Ports-Untrusted
   - Protocol: TCP & UDP
   - Source zone: untrustedlan
   - Destination zone: wan
   - Action: drop
   - Advanced Settings tab > tick Enable logging.

Ensure the second rule is _below_ the first rule.
Save & Apply.

If there is any outgoing traffic being blocked in the untrustedlan, the log file will show something like this, where traffic to 123.123.123.123 UDP port 8053 has been blocked,

```plain /mnt/sda1/logs/fw
Sat Aug  1 01:23:45 2026 kern.warn kernel: [12345.123456] Block-Other-Ports-Untrusted: IN=phy0-ap1 OUT=eth1 MAC=xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx SRC=192.168.100.101 DST=123.123.123.123 LEN=60 TOS=0x00 PREC=0x00 TTL=63 ID=15757 DF PROTO=UDP SPT=54321 DPT=8053 LEN=40
```
