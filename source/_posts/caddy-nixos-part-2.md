---
title: "Setup Caddy as a reverse proxy on NixOS (Part 2: Hardening)"
excerpt: "Part 2: Securing NixOS"
date: 2020-03-04
lastUpdated: 2020-04-22
tags:
- web
- linux
- caddy
- nixos
---

In this post, I show you how I securely configure the NixOS, the server OS behind this website.

This post is Part 2 of a series of articles that show you how I set up Caddy and Tor hidden service on NixOS:

- {% post_link caddy-nixos-part-1 'Part 1: Install NixOS' %}
- Part 2: Configure NixOS
- {% post_link caddy-nixos-part-3 'Part 3: Configure Caddy' %}
- {% post_link tor-hidden-onion-nixos 'Part 4: Configure Tor' %}
- {% post_link i2p-eepsite-nixos 'Part 5: Configure I2P' %}

Following diagram shows the architecture behind this website.

![Architecture behind mdleom.com](20200223/caddy-nixos.png)

## Prerequisites

Before proceeding to the rest of this guide, there are some system packages that you need to install. Add the packages to `environment.systemPackages` option in "configuration.nix" and run `# nixos-rebuild switch` to install them.

```
  environment.systemPackages = with pkgs; [
    dnsutils usbguard magic-wormhole p7zip google-authenticator
  ];
```

## Disable mutableUsers

In NixOS, instead of using `useradd` and `passwd` to manage users, you could also manage them from the "configuration.nix". I prefer this approach because it fits the OS' declarative nature and you could say it is the NixOS-_way_.

First, I disabled `useradd` and `passwd`.

``` js
users.mutableUsers = false;
```

## Disable root

``` js
users.root.hashedPassword = "*";
```

## Hash user's password

User's password can be configured by `users.<name>.password`, obviously this means the password is stored in plain text. Even if you lock down `configuration.nix` with `chmod 600` (which I did), "it is (still) world-readable in the Nix store". The safer way is to store in a hashed form,

``` js
users.<name>.hashedPassword = "xxxx";
```

Use `openssl passwd -6` to generate the SHA512-hashed password. Alternatively, if your distro bundles it (Ubuntu doesn't), you could also use `mkpasswd -m sha-512`, but do enter the password with care because it only prompts once (unlike openssl which prompts twice).

Note that the hash is still world-readable. A more secure option is to use `users.<name>.passwordFile`. Save the hash into a file (e.g. "/etc/nixos/nixos.password") and restricts the file to be readable by root only (`chown root:root` and `chmod 600`).

You might be wondering why not just `passwordFile` during installation. The issue is that, in the live CD environment, the "/etc/" folder refers to the live CD's not the actual one which is located in "/mnt/etc/". I mean, you _could_ try "/mnt/etc/nixos/nixos.password", but you gotta remember to update the option after reboot otherwise you would get locked out. "./nixos.password" value doesn't work because `passwordFile` option doesn't support relative path, it must be a full path. Hence, I have use `hashedPassword` during the initial setup and then switch to `passwordFile`. Remember to remove the `hashedPassword` option once you have set up `passwordFile`.

``` js
  passwordFile = "/etc/nixos/nixos.password";
  isNormalUser = true;
  extraGroups = [ "wheel" ]; # Enable ‘sudo’ for the user.
```

I enable `isNormalUser` which includes sane defaults (disable "isSystemUser", create a home folder in "/home/nixos/" and enable shell). Since root account is disabled, you definitely need to add the user to `wheel` group so that it can use `sudo`.

Once you run `# nixos-rebuild switch`, verify the password has been set, by checking the `/etc/shadow`.

```
# cat /etc/shadow | grep 'nixos'
```

The hash in the output should be the same as the "/etc/nixos/nixos.password" file. Only quit root shell **after** verify.

## Run each service as different user

For separation of privilege, each service is launched with different user under different group. Shell is disabled for those users. In this case, I have "caddyProxy" to run the Caddy reverse proxy for mdleom.com, "caddyTor" for the reverse proxy to be connected to Tor and "tor" for the Tor hidden service. Caddy package does create "caddy" user by default in its ["caddy.nix"](https://github.com/NixOS/nixpkgs/blob/master/nixos/modules/services/web-servers/caddy.nix), but I prefer to use my own "caddy.nix" which has less permissions granted. "tor" user will be created automatically by the Tor package, but I need to import the private key and assign it to the "tor" user before I can enable the service, hence I create the user beforehand.

Combining with the previous user configs, I ended up with:

``` js
  users = {
    mutableUsers = false;

    users = {
      root = {
        hashedPassword = "*";
      };
      nixos = {
        hashedPassword = "xxxx";
        isNormalUser = true;
        extraGroups = [ "wheel" ];
      };
      caddyProxy = {
        home = "/var/lib/caddyProxy";
        createHome = true;
      };
      caddyTor = {
        home = "/var/lib/caddyTor";
        createHome = true;
      };
      tor = {
        home = "/var/lib/tor";
        createHome = true;
      };
    };

    groups = {
      caddyProxy = {
        members = [ "caddyProxy" ];
      };
      caddyTor = {
        members = [ "caddyTor" ];
      };
      tor = {
        members = [ "tor" ];
      };
    };
  };
```

## Enables 2FA (OTP) for login

For extra security, I enabled 2FA for the user account via TOTP method. It can be configured using `google-authenticator` (available in NixOS repo). The resulting secret is stored in "~/.google_authenticator". This is also why `isNormalUser` is needed. `google-authenticator` should be run as a normal user, _not_ root nor sudo.

```
$ google-authenticator
```

1. Yes to time-based
2. Import the generated QR code or secret key to OTP app (recommends Aegis for Android)
3. Enter OTP
4. Backup scratch codes
5. Yes to saving the key to ~/.google_authenticator
6. Yes to disallowing multiple usage
7. No to increasing window
8. Yes to rate-limiting login attempts

Once the secret is generated, TOTP can be enabled using the following config. I configured it to require OTP when login and sudo, in addition to password.

``` js
  ## Requires OTP to login & sudo
  security.pam = {
    services.login.googleAuthenticator.enable = true;
    services.sudo.googleAuthenticator.enable = true;
  };
```

## DNS-over-TLS

Since DNS is not encrypted in transit, it risks being tampered. To resolve that, I use DNS-over-TLS which as the name implies, uses TLS to encrypt the DNS traffic. I use `stubby` which creates a DNS resolver that listens on localhost and forward DNS query to the upstream server(s) using DoT. `stubby` enables DNSSEC by default to verify authenticity of the DNS response for supported domains. (This domain mdleom.com has DNSSEC enabled by having a DS record)

I use Cloudflare DNS simply because I'm already using its CDN, using other alternatives wouldn't have the privacy benefit since Cloudflare already knows that a visitor is browsing this website though its CDN.  Refer to stubby.yml for a full list of supported servers.

``` js
  ## DNS-over-TLS
  services.stubby = {
    enable = true;
    listenAddresses = [ "0::1" "127.0.0.1" ];
    roundRobinUpstreams = false;
    upstreamServers =
      ''
        ## Cloudflare DNS
        - address_data: 2606:4700:4700::1111
          tls_auth_name: "cloudflare-dns.com"
        - address_data: 2606:4700:4700::1001
          tls_auth_name: "cloudflare-dns.com"
        - address_data: 1.1.1.1
          tls_auth_name: "cloudflare-dns.com"
        - address_data: 1.0.0.1
          tls_auth_name: "cloudflare-dns.com"
      '';
  };
```

Then I point systemd's resolved to stubby. I do configure it to fallback to unencrypted DNS if stubby is not responsive (which does happen). Whether you need an unsecured fallback depends on your cost-benefit. For me, the cost of the site being inaccessible (due to unresponsive stubby) outweighs the benefit of having enforced encryption (my setup is opportunistic).

```
  networking.nameservers = [ "::1" "127.0.0.1" ];
  services.resolved = {
    enable = true;
    fallbackDns = [ "2606:4700:4700::1111" "2606:4700:4700::1001" "1.1.1.1" "1.0.0.1" ];
  };
```

Execute `nixos-rebuild switch` and test the DNS resolver by using `dig` (part of "dnsutils" package):

```
$ dig example.com
```

## Bind to port >1024

By default, Linux program cannot bind to port <=1024 for security reason. If a program needs it, you need to explicitly grant CAP_NET_BIND_SERVICE capability. An alternative approach is to bind the program to port >1024 and port forward 80/443 to that port.

In my case, I configure iptables to port forward 443 to 4430, so any traffic that hits 443 will be redirected to 4430. Both ports need to be opened, but I do configure my dedicated firewall (separate from the web server) to allow port 443 only.

``` js
  ## Port forwarding
  networking.firewall = {
    enable = true;
    interfaces.ens3 = {
      allowedTCPPorts = [ 443 4430 ];
    };
    extraCommands =
      ''
        ip6tables -t nat -I PREROUTING -i ens3 -p tcp -m tcp --dport 443 -j REDIRECT --to-ports 4430
      '';
  };
```

(Note: Most probably you would need `ip46tables` to open ports in both IPv4 and IPv6. If the server doesn't support IPv6 (!), just use `iptables`)

## Unattended upgrade

Unattended upgrade can be enabled through the following config. Once enabled, NixOS will automatically check and install the updates. If you enable `allowReboot`, it will also reboot if required (especially after kernel upgrade). Unattended upgrade is also a cost-benefit thing. The benefit is timely fix for vulnerability and reduce maintenance effort, the cost is potential incompatibility issue that can arise after update. In my use case, the cost is deemed to be minimal because I find the issue to be rare.

In the config, you can also specify the time that the server will reboot. I recommend to only enable it after everything is up and running, especially when setting a web server; you wouldn't want the server to reboot itself in the middle of your tinkering.

``` js
  system.autoUpgrade = {
    enable = true;
    allowReboot = true;
    dates = "00:00";
  };
```

## USBGuard (restricts new USB devices)

I use USBGuard utility to allow or deny USB devices. In a virtual server environment, I only need to use the virtualised USB keyboard. Configuration is easy and straightforward. First, I generate a policy (with root privilege) to allow all currently connected devices:

```
# usbguard generate-policy > /var/lib/usbguard/rules.conf
```

Then, I just simply enable the service:

``` js
  services.usbguard = {
    enable = true;
    ruleFile = "/var/lib/usbguard/rules.conf";
  };
```

Once enabled, any device not whitelisted in the policy will not be accessible.

## Networking stack hardening and performance

Based on [Ubuntu Wiki](https://wiki.ubuntu.com/ImprovedNetworking/KernelSecuritySettings) and [ArchWiki](https://wiki.archlinux.org/index.php/sysctl).

```
  ## Enable BBR module
  boot.kernelModules = [ "tcp_bbr" ];

  ## Network hardening and performance
  boot.kernel.sysctl = {
    # Disable magic SysRq key
    "kernel.sysrq" = 0;
    # Ignore ICMP broadcasts to avoid participating in Smurf attacks
    "net.ipv4.icmp_echo_ignore_broadcasts" = 1;
    # Ignore bad ICMP errors
    "net.ipv4.icmp_ignore_bogus_error_responses" = 1;
    # Reverse-path filter for spoof protection
    "net.ipv4.conf.default.rp_filter" = 1;
    "net.ipv4.conf.all.rp_filter" = 1;
    # SYN flood protection
    "net.ipv4.tcp_syncookies" = 1;
    # Do not accept ICMP redirects (prevent MITM attacks)
    "net.ipv4.conf.all.accept_redirects" = 0;
    "net.ipv4.conf.default.accept_redirects" = 0;
    "net.ipv4.conf.all.secure_redirects" = 0;
    "net.ipv4.conf.default.secure_redirects" = 0;
    "net.ipv6.conf.all.accept_redirects" = 0;
    "net.ipv6.conf.default.accept_redirects" = 0;
    # Do not send ICMP redirects (we are not a router)
    "net.ipv4.conf.all.send_redirects" = 0;
    # Do not accept IP source route packets (we are not a router)
    "net.ipv4.conf.all.accept_source_route" = 0;
    "net.ipv6.conf.all.accept_source_route" = 0;
    # Protect against tcp time-wait assassination hazards
    "net.ipv4.tcp_rfc1337" = 1;
    # TCP Fast Open (TFO)
    "net.ipv4.tcp_fastopen" = 3;
    ## Bufferbloat mitigations
    # Requires >= 4.9 & kernel module
    "net.ipv4.tcp_congestion_control" = "bbr";
    # Requires >= 4.19
    "net.core.default_qdisc" = "cake";
  };
```

TCP Fast Open ([TFO](https://en.wikipedia.org/wiki/Tcp_fast_open)) is enabled by default (`tcp_fastopen = 1`) for outgoing connection since 3.13. As of writing, TFO has limited server support; Caddy, Tor and I2Pd don't support it yet, so enabling it for incoming and outgoing connections (`3`) has no effect.

## Hardened kernel

Kernel compiled with additional security-oriented patch set. [More details](https://wiki.archlinux.org/index.php/Security#Kernel_hardening).

```
  boot.kernelPackages = pkgs.linuxPackages_hardened;
```
