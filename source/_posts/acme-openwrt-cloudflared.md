---
title: Obtain HTTPS/TLS certificate in OpenWRT using acme.sh and cloudflared
excerpt: Avoid opening inbound port
date: 2026-11-13
tags:
  - openwrt
  - cloudflare
---

OpenWRT offers a user-friendly way of getting a valid public CA-signed HTTPS/TLS certificate from ACME-compatible CA (e.g. Lets Encrypt, ZeroSSL, etc), through a [user guide](https://openwrt.org/docs/guide-user/services/tls/acmesh) and a [LuCI app](https://github.com/openwrt/luci/tree/master/applications/luci-app-acme). This enables the router's web portal (`http://192.168.1.1`) to be secured with HTTPS without using self-signed CA. While this makes the process of getting a certificate quite trivial, except for DNS-01 validation method, every other methods require [opening up](https://github.com/openwrt/packages/blob/401b45e748b543f3f5e20c329e490d049ec5d263/net/acme-acmesh/files/hook.sh#L191) an inbound port.

Opening up inbound port can be avoided by using a reverse tunnel such as Cloudflare Tunnel available to free account. I am currently using Cloudflare Tunnel to {% post_link cloudflare-argo-nixos 'host this blog' %} and previously utilised it to {% post_link ssh-certificate-cloudflare-tunnel 'SSH into' %} my web server (which I later replaced with {% post_link tailscale-alpine 'Tailscale' %}). This post is about using it to complete domain verification through HTTP-01 challenge. The custom domain to be used for the TLS certificate should be already hosted on Cloudflare, a requirement for the Cloudflare Tunnel. I use `custom.example.com` as illustration, change it to your preferred subdomain.

## WAF rule and CAA

Navigate to your domain zone, Security > [Security rules](https://dash.cloudflare.com/<account-id>/<domain-name>/security/security-rules) > Create rule > Custom rules.

- Name: Restrict ACME path to Lets Encrypt
- Conditions (AND):
  - Hostname equals `custom.example.com`
  - URI Path does not start with `/.well-known/acme-challenge/`
  - User Agent does not equal `Mozilla/5.0 (compatible; Let's Encrypt validation server; +https://www.letsencrypt.org)`
- Action: Block

For the subdomain `custom.example.com`, the WAF rule only allows `custom.example.com/.well-known/acme-challenge/` to be accessed by Lets Encrypt user agent. Other paths (e.g. `custom.example.com/` or `custom.example.com/xxx`) will be blocked by the WAF. The subdomain will get vulnerability scans from bots as soon as the certificate is issued because those bots can track new domains/subdomains through [Certificate Transparency](https://en.wikipedia.org/wiki/Certificate_Transparency) logs. However, if the certificate is not being used for public web service, there's nothing to be scanned so it's optional to configure the WAF rule, but at least it gives some peace of mind in case an inbound port is mistakenly opened.

Go to [DNS records](https://dash.cloudflare.com/<account-id>/<domain-name>/dns/records) and add a new [CAA](https://en.wikipedia.org/wiki/DNS_Certification_Authority_Authorization) record to allow Lets Encrypt to issue certificate on the subdomain. I'll come back to why I prefer Lets Encrypt instead of the default CA of acme.sh ZeroSSL.

| Type | Name   | CA domain name    |
| ---- | ------ | ----------------- |
| CAA  | custom | `letsencrypt.org` |

## Cloudflare Tunnel

Install `acme.sh` and cloudflared packages.

```sh
apk update
apk install acme-acmesh cloudflared
```

To create a new tunnel, login to Cloudflare Dashboard, Networking > [Tunnels](https://dash.cloudflare.com/<account-id>/tunnels) > Create Tunnel > Tunnel name. Grab the token value from the command `cloudflared tunnel run --token xxx` and leave the page open.

Back in OpenWRT, edit "/etc/config/cloudflared" and paste the token there.

```sh /etc/config/cloudflared
config cloudflared 'config'
  option enabled '1'
  option token 'xxx'
```

Run `service cloudflared start` and heads back to the Cloudflare tunnel page, the "Connection Status" should now show it's connected.

Add a new route > Published application,

- Subdomain: custom
- Domain: `example.com`
- Path: /.well-known/acme-challenge/
- Service URL: `http://127.0.0.80:8080`

Optionally, to test whether the tunnel and route are working, in OpenWRT

```sh
mkdir -p /tmp/www/.well-known/acme-challenge/
echo 'ok' > /tmp/www/.well-known/acme-challenge/test
uhttpd -f -p 127.0.0.80:8080 -h /tmp/www/ -D
```

Then open `https://custom.example.com/.well-known/acme-challenge/test` in web browser. Remember to quit `uhttpd` by Ctrl + C.

## acme.sh

The acmesh package also installs acme-common dependency that provides `acme` executable which is an OpenWRT init script not acme.sh CLI. Since we won't be using that init script, it can be disabled.

```sh
/etc/init.d/acme stop
/etc/init.d/acme disable
```

acme.sh is located at "/usr/lib/acme/client/acme.sh". The CLI stores configs and certs in "/root" folder by default, which doesn't match the folders used by OpenWRT's acme-common: "/etc/acme/" and "/etc/ssl/certs/" respectively. This can be configured through CLI parameters, but it's quite wordy if we have to type those out in every execution of acme.sh. Instead, I created a wrapper inspired by [this guide](https://pieterbakker.com/acme-sh-installation-guide-2025/).

{% codeblock /etc/custom-scripts/acme-wrapper.sh lang:sh https://gitlab.com/curben/openwrt-scripts/-/blob/main/acme-wrapper/acme-wrapper.sh source %}
#!/bin/sh

# https://pieterbakker.com/acme-sh-installation-guide-2025/

/usr/lib/acme/client/acme.sh \
--home "/usr/lib/acme/client" \
--config-home "/etc/acme" \
--cert-home "/etc/ssl/acme" \
--ca-bundle "/etc/ssl/certs/ca-certificates.crt" \
--server letsencrypt \
"$@"
{% endcodeblock %}

Ensure "/etc/custom-scripts/acme-wrapper.sh" is executable. It can be in any preferred folder, as long you add it "/etc/sysupgrade.conf" so that the folder is kept during upgrade.

## Register for ACME API key

Register for an API key from Lets Encrypt.

```
/etc/custom-scripts/acme-wrapper.sh --register-account --email le.vacate601@passmail.net --server letsencrypt --ca-bundle /etc/ssl/certs/ca-certificates.crt --auto-upgrade 0
```

API key is stored in "/etc/acme/ca/acme-v02.api.letsencrypt.org/directory/".

acme.sh stores general config in "/etc/acme/account.conf".

```sh /etc/acme/account.conf
USER_PATH='/usr/sbin:/usr/bin:/sbin:/bin'
CA_BUNDLE='/etc/ssl/certs/ca-certificates.crt'
AUTO_UPGRADE='0'
DEFAULT_ACME_SERVER='https://acme-v02.api.letsencrypt.org/directory'
# Optional logging
LOG_FILE="/mnt/sdcard/log/acme-sh.log"
LOG_LEVEL=1
```

## Request for a certificate

Issue a certificate. In this example, the certificate is used for LuCI web, hence the renew hook to reload uhttpd.

```
/etc/custom-scripts/acme-wrapper.sh --issue --standalone --httpport 8080 --local-address 127.0.0.80 --listen-v4 --domain custom.example.com --pre-hook "/etc/init.d/cloudflared start" --post-hook "/etc/init.d/cloudflared stop" --renew-hook "/etc/init.d/uhttpd reload"
```

The [hooks](https://github.com/acmesh-official/acme.sh/wiki/Using-pre-hook-post-hook-renew-hook-reloadcmd) are stored in "/etc/ssl/acme/custom.example.com_ecc/custom.example.com.conf" encoded in base64. They are automatically executed during renewal, so we don't have to specify them in the [cron job](#cron-job-to-auto-renew). This also means the cloudflared service doesn't need to be enabled to run at boot and stay up; with hooks, cloudflared will only run during renewal, so the tunnel is only up during a short period of renewal.

```sh /etc/ssl/acme/custom.example.com_ecc/custom.example.com.conf
Le_PreHook='__ACME_BASE64__START_L2V0Yy9pbml0LmQvY2xvdWRmbGFyZWQgc3RhcnQ=__ACME_BASE64__END_'
Le_PostHook='__ACME_BASE64__START_L2V0Yy9pbml0LmQvY2xvdWRmbGFyZWQgc3RvcA==__ACME_BASE64__END_'
Le_RenewHook='__ACME_BASE64__START_L2V0Yy9pbml0LmQvdWh0dHBkIHJlbG9hZA==__ACME_BASE64__END_'
```

## Attach certificate to LuCI web

Once issued, the certificate and private key will be available under "/etc/ssl/acme/custom.example.com_ecc/"

To attach the certificate to LuCI web, edit "/etc/config/utthpd and replace the cert and key options and reload uhttpd `/etc/init.d/uhttpd reload`.

```sh /etc/config/uhttpd
config uhttpd 'main'
	option cert '/etc/ssl/acme/custom.example.com_ecc/fullchain.cer'
	option key '/etc/ssl/acme/custom.example.com_ecc/custom.example.com.key'
```

Add a host entry in the OpenWRT device and your local device to point `custom.example.com` to 192.168.1.1 or whichever is the OpenWRT's IP.

```plain /etc/hosts
192.168.1.1 custom.example.com
```

Check whether `https://custom.example.com` is working and serving a valid certificate.

## Cron job to auto renew

Add a new entry to "/etc/crontabs/root". Each day at 00:00am of OpenWRT device's timezone (default is UTC), acme.sh will check [ACME Renewal Information](https://github.com/acmesh-official/acme.sh/wiki/ARI) of all certificates and renew them when necessary.

```plain /etc/crontabs/root
0 0 * * * /etc/custom-scripts/acme-wrapper.sh --cron
```

Adjust the time to your preferred local time, refer to [crontab.guru](https://crontab.guru/) for cron syntax. Remove `0 0 * * * /etc/init.d/acme renew` entry if you see one.

All hooks specified during [certificate issuance](#request-for-a-certificate) will execute during renewal.

## ZeroSSL vs Lets Encrypt

My experience with ZeroSSL and Lets Encrypt.

|                                              | ZeroSSL     | Lets Encrypt |
| -------------------------------------------- | ----------- | ------------ |
| Registration                                 | 1 minute    | <5 seconds   |
| Cert issuance<br>(incl. domain verification) | 2.5 minutes | 17 seconds   |

Frequent downtime of ZeroSSL's ACME service wasn't helping either.

![zerossl status](20261113/zerossl-status.png)

It's probably why Caddy still [defaults to](https://caddyserver.com/docs/caddyfile/directives/tls#acme) Lets Encrypt ACME despite being sponsored by ZeroSSL. Caddy does offer [ZeroSSL option](https://caddyserver.com/docs/caddyfile/directives/tls#zerossl) to obtain a certificate, but it is through their proprietary API with much better uptime.

## DNS-PERSIST-01

Cloudflare Tunnel is simply a workaround to avoid storing DNS API key for DNS-01 validation and opening up inbound port for HTTP-01 validation. There is an upcoming [DNS-PERSIST-01](https://letsencrypt.org/2026/02/18/dns-persist-01) validation that I'm looking forward to replace this workaround, when it's ready [in 2027](https://www.certkit.io/blog/whats-taking-dns-persist-01-so-long).
