---
title: "Setup Caddy as a reverse proxy on NixOS (Part 2: Hardening)"
excerpt: "Part 2: Securing NixOS"
date: 2020-03-04
updated: 2022-12-03
tags:
  - server
  - linux
  - caddy
  - nixos
series: true
---

> 6 Jul 2022: Updated to NixOS 22.05 syntax.

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

Before proceeding to the rest of this guide, there are some system packages that you need to install.

```
$ nix-env -f '<nixpkgs>' -iA google-authenticator p7zip usbguard wormhole-william
```

## Disable mutableUsers

In NixOS, instead of using `useradd` and `passwd` to manage users, you could also manage them from the "configuration.nix". I prefer this approach because it fits the OS' declarative nature and you could say it is the NixOS-_way_.

First, I disabled `useradd` and `passwd`.

```nix
users.mutableUsers = false;
```

## Disable root

```nix
users.root.hashedPassword = "*";
```

## Hash password

User's password can be configured by `users.<name>.password`, obviously this means the password is stored in plain text. Even if you lock down `configuration.nix` with `chmod 600` (which I did), "it is (still) world-readable in the Nix store". The safer way is to store in a hashed form,

```nix
users.<name>.hashedPassword = "xxxx";
```

Use `openssl passwd -6` to generate the SHA512-hashed password. Alternatively, you could also use `mkpasswd -m sha-512` (bundled with `whois` package). To ensure password is entered correctly in `mkpasswd` (it only prompts once), copy the salt value which is the second section where each section is separated by `$` ($6$**salt**$hashedpassword).

```
mkpasswd -m sha-512 --salt 'saltvalue'
```

Both outputs of `mkpasswd` should be the same.

### yescript

NixOS 22.11 onwards support yescrypt, a more secure password hashing algorithm than SHA512. It can generated using `mkpasswd -m yescrypt`, openssl passwd doesn't support it yet. mkpasswd generates it with "5" compute cost by default, you can change it using `--round` option with a value from 1 to 11. Increasing the value will make it more resistant to brute-force, but password verification will also be slower.

To verify the output, `--salt` option cannot be used for yescrypt due to [a bug](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=1003151). As a workaround, copy the output from the first `$` until the forth.

```
printf "Password: " && read -s var && mkpasswd "$var" '$y$parameter$salt$' && var=""
```

Replace the single-quoted value `''` with the copied value.

### passwordFile

Note that the hash is still world-readable. A more secure option is to use `users.<name>.passwordFile`. Save the hash into a file (e.g. "/etc/nixos/nixos.password") and restricts the file to be readable by root only (`chown root:root` and `chmod 600`).

You might be wondering why not just `passwordFile` during installation. The issue is that, in the live CD environment, the "/etc/" folder refers to the live CD's not the actual one which is located in "/mnt/etc/". I mean, you _could_ try "/mnt/etc/nixos/nixos.password", but remember to update the option after reboot otherwise you would get locked out. "./nixos.password" value doesn't work because `passwordFile` option doesn't support relative path, it must be a full path. Hence, I have to use `hashedPassword` during the initial setup and then switch to `passwordFile`. Remember to remove the `hashedPassword` option once you have set up `passwordFile`.

```nix
  passwordFile = "/etc/nixos/nixos.password";
  isNormalUser = true;
  extraGroups = [ "wheel" ]; # Enable ‘sudo’ for the user.
```

I enable `isNormalUser` which includes sane defaults (disable "isSystemUser", create a home folder in "/home/nixos/" and enable shell). Since root account is disabled, you definitely need to add the user to `wheel` group so that it can use `sudo`.

Once you run `# nixos-rebuild switch`, verify the password has been set, by checking the `/etc/shadow`.

```
# cat /etc/shadow | grep 'nixos'
```

The hash in the output should be the same as the content of "/etc/nixos/nixos.password" or `hashedPassword` value. Only quit root shell **after** verify.

## Run each service as different user

For separation of privilege, each service is launched with different user under different group. Shell is disabled for those users. In this case, I have "caddyProxy" to run the Caddy reverse proxy for mdleom.com, "caddyTor" for the reverse proxy to be connected to Tor and "tor" for the Tor hidden service. Caddy package does create "caddy" user by default in its ["caddy.nix"](https://github.com/NixOS/nixpkgs/blob/master/nixos/modules/services/web-servers/caddy.nix), but I prefer to use my own "caddy.nix" which has less permissions granted. "tor" user will be created automatically by the Tor package, but I need to import the private key and assign it to the "tor" user before I can enable the service, hence I create the user beforehand.

Combining with the previous user configs, I ended up with:

```nix
  users = {
    mutableUsers = false;

    users = {
      root = {
        hashedPassword = "*";
      };
      nixos = {
        group = "nixos";
        hashedPassword = "xxxx";
        isNormalUser = true;
        extraGroups = [ "wheel" ];
      };
      caddyProxy = {
        group = "caddyProxy";
        home = "/var/lib/caddyProxy";
        createHome = true;
        isSystemUser = true;
        group = "caddyProxy";
      };
      caddyTor = {
        group = "caddyTor";
        home = "/var/lib/caddyTor";
        createHome = true;
        isSystemUser = true;
        group = "caddyTor";
      };
      tor = {
        group = "tor";
        home = "/var/lib/tor";
        createHome = true;
        isSystemUser = true;
        group = "tor";
        uid = config.ids.uids.tor;
      };
    };

    groups = {
      nixos = {};
      caddyProxy = {};
      caddyTor = {};
      tor = {};
    };
  };
```

## Enables 2FA (OTP) for login

For extra security, I enabled 2FA for the user account via TOTP method. It can be configured using `google-authenticator` (available in NixOS repo). The resulting secret is stored in "~/.google*authenticator". This is also why `isNormalUser` is needed. `google-authenticator` should be run as a normal user, \_not* root nor sudo.

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

```nix
  ## Requires OTP to login & sudo
  security.pam = {
    services.login.googleAuthenticator.enable = true;
    services.sudo.googleAuthenticator.enable = true;
  };
```

## DNS-over-TLS

Since DNS is not encrypted in transit, it risks being tampered. To resolve that, I use DNS-over-TLS which as the name implies, uses TLS to encrypt the DNS traffic. I use `stubby` which creates a DNS resolver that listens on localhost and forward DNS query to the upstream server(s) using DoT. `stubby` enables DNSSEC by default to verify authenticity of the DNS response for supported domains. (This domain mdleom.com has DNSSEC enabled through a DS record)

I use Cloudflare DNS (simply because I'm already using its CDN) and [Quad9](https://quad9.net/) as backup. Refer to [stubby.yml](https://github.com/getdnsapi/stubby/blob/develop/stubby.yml.example) for a full list of supported servers. For Cloudflare DNS, I opt for the malware-blocking flavour, refer to the following IPs if you prefer the default flavour.

```
Source: https://developers.cloudflare.com/1.1.1.1/setup/
# No malware blocking
1.1.1.1
1.0.0.1
2606:4700:4700::1111
2606:4700:4700::1001

# Malware blocking
1.1.1.2
1.0.0.2
2606:4700:4700::1112
2606:4700:4700::1002
```

```nix
  ## DNS-over-TLS
  services.stubby = {
    enable = true;
    settings = {
      # ::1 cause error, use 0::1 instead
      listen_addresses = [ "127.0.0.1" "0::1" ];
      # https://github.com/getdnsapi/stubby/blob/develop/stubby.yml.example
      resolution_type = "GETDNS_RESOLUTION_STUB";
      dns_transport_list = [ "GETDNS_TRANSPORT_TLS" ];
      tls_authentication = "GETDNS_AUTHENTICATION_REQUIRED";
      tls_query_padding_blocksize = 128;
      idle_timeout = 10000;
      round_robin_upstreams = 1;
      tls_min_version = "GETDNS_TLS1_3";
      dnssec = "GETDNS_EXTENSION_TRUE";
      upstream_recursive_servers = [
        {
          address_data = "1.1.1.2";
          tls_auth_name = "cloudflare-dns.com";
        }
        {
          address_data = "1.0.0.2";
          tls_auth_name = "cloudflare-dns.com";
        }
        {
          address_data = "2606:4700:4700::1112";
          tls_auth_name = "cloudflare-dns.com";
        }
        {
          address_data = "2606:4700:4700::1002";
          tls_auth_name = "cloudflare-dns.com";
        }
        {
          address_data = "9.9.9.9";
          tls_auth_name = "dns.quad9.net";
        }
        {
          address_data = "149.112.112.112";
          tls_auth_name = "dns.quad9.net";
        }
        {
          address_data = "2620:fe::fe";
          tls_auth_name = "dns.quad9.net";
        }
        {
          address_data = "2620:fe::9";
          tls_auth_name = "dns.quad9.net";
        }
      ];
    };
  };
```

Then I point systemd's resolved to stubby. I do configure it to fallback to unencrypted DNS if stubby is not responsive (which does happen). Whether you need an unsecured fallback depends on your cost-benefit. For me, the cost of the site being inaccessible (due to unresponsive stubby) outweighs the benefit of having enforced encryption (my setup is opportunistic).

```nix
  networking.nameservers = [ "::1" "127.0.0.1" ];
  services.resolved = {
    enable = true;
    fallbackDns = [ "2606:4700:4700::1112" "2606:4700:4700::1002" "1.1.1.2" "1.0.0.2" ];
  };
```

Execute `nixos-rebuild switch` and test the DNS resolver by using `dig` (part of "dnsutils" package):

```
$ dig example.com
```

## Bind to port >1024

By default, Linux program cannot bind to port <=1024 for security reason. If a program needs it, you need to explicitly grant CAP_NET_BIND_SERVICE capability. An alternative approach is to bind the program to port >1024 and port forward 80/443 to that port.

In my case, I configure iptables to port forward 443 to 4430, so any traffic that hits 443 will be redirected to 4430. Both ports need to be opened, but I do configure my dedicated firewall (separate from the web server) to allow port 443 only.

```nix
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

Most probably you would need `ip46tables` to open ports in both IPv4 and IPv6. If the server doesn't support IPv6 (!), just use `iptables`.

(Edit: 20 Jun 2021) {% post_link cloudflare-argo-nixos 'cloudflared' %} replaced my port forwarding setup, my web server now binds to localhost and no longer needs open inbound port.

## Unattended upgrade

Unattended upgrade can be enabled through the following config. Once enabled, NixOS will automatically check and install the updates. If you enable `allowReboot`, it will also reboot if required (especially after kernel upgrade). Unattended upgrade is also a cost-benefit thing. The benefit is timely fix for vulnerability and reduce maintenance effort, the cost is potential incompatibility issue that can arise after update. In my use case, the cost is deemed to be minimal because I find the issue to be rare.

In the config, you can also specify the time that the server will reboot. I recommend to only enable it after everything is up and running, especially when setting a web server; you wouldn't want the server to reboot itself in the middle of your tinkering.

(For more advanced usage of `dates`, see [`systemd.time`](https://jlk.fjfi.cvut.cz/arch/manpages/man/systemd.time.7#CALENDAR_EVENTS))

```nix
  system.autoUpgrade = {
    enable = true;
    allowReboot = true;
    # Daily 00:00
    dates = "daily UTC";
  };
```

## USBGuard (restricts new USB devices)

I use USBGuard utility to allow or deny USB devices. In a virtual server environment, I only need to use the virtualised USB keyboard. Configuration is easy and straightforward. First, I generate a policy (with root privilege) to allow all currently connected devices:

```
$ sudo usbguard generate-policy > /var/lib/usbguard/rules.conf
```

Then, I just simply enable the service:

```nix
  # Load "/var/lib/usbguard/rules.conf" by default
  services.usbguard.enable = true;
```

Once enabled, any device not whitelisted in the policy will not be accessible.

## Networking stack hardening and performance

Based on [Ubuntu Wiki](https://wiki.ubuntu.com/ImprovedNetworking/KernelSecuritySettings) and [ArchWiki](https://wiki.archlinux.org/index.php/sysctl).

```nix
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

_NixOS [defaults](https://nixos.wiki/wiki/Linux_kernel) to the latest LTS kernel_

```nix
  # Latest LTS kernel
  boot.kernelPackages = pkgs.linuxPackages_hardened;
```

```nix
  # Latest kernel
  boot.kernelPackages = pkgs.linuxPackages_latest_hardened;
```

## Remove old, unreferenced packages

Since my web server has limited disk space, it needs to run [garbage collector](https://nixos.org/nixos/manual/index.html#sec-nix-gc) from time to time.

Since [unattended upgrade](#Unattended-upgrade) is executed on 00:00, I delay garbage collection to 01:00 to avoid time conflict. The order doesn't matter, but there should be at least 15 minutes buffer.

```nix
  ## Garbage collector
  nix.gc = {
    automatic = true;
    # Every Monday 01:00 (UTC)
    dates = "Monday 01:00 UTC";
    options = "--delete-older-than 7d";
  };

  # Run garbage collection whenever there is less than 500MB free space left
  nix.extraOptions = ''
    min-free = ${toString (500 * 1024 * 1024)}
  '';
```

## Complete configuration.nix

```nix /etc/nixos/configuration.nix
{ config, pkgs, ... }:

{
  imports =
    [ # Include the results of the hardware scan.
      ./hardware-configuration.nix
    ];

  # The global useDHCP flag is deprecated, therefore explicitly set to false here.
  # Per-interface useDHCP will be mandatory in the future, so this generated config
  # replicates the default behaviour.
  networking.useDHCP = false;
  networking.interfaces.ens3.useDHCP = true;

  environment.systemPackages = with pkgs; [
    dnsutils wormhole-william p7zip
  ];

  environment.shellAliases = {
    ls = "ls -l";
    la = "ls -a";
    wormhole = "wormhole-william";
  };

  time.timeZone = "UTC";

  ## Unattended upgrade
  system.autoUpgrade = {
    enable = true;
    allowReboot = true;
    dates = "weekly UTC";
  };

  ## Garbage collection
  # https://nixos.wiki/wiki/Storage_optimization#Automation
  nix.gc = {
    automatic = true;
    dates = "Monday 01:00 UTC";
    options = "--delete-older-than 7d";
  };

  # Run garbage collection whenever there is less than 500MB free space left
  nix.extraOptions = ''
    min-free = ${toString (500 * 1024 * 1024)}
  '';

  ## Optional: Clear >1 month-old logs
  systemd = {
    services.clear-log = {
      description = "Clear >1 month-old logs every week";
      serviceConfig = {
        Type = "oneshot";
        ExecStart = "${pkgs.systemd}/bin/journalctl --vacuum-time=30d";
      };
    };
    timers.clear-log = {
      wantedBy = [ "timers.target" ];
      partOf = [ "clear-log.service" ];
      timerConfig.OnCalendar = "weekly UTC";
    };
  };

  ## Hardened kernel
  boot.kernelPackages = pkgs.linuxPackages_hardened;

  ## Enable BBR
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
    # Latency reduction
    "net.ipv4.tcp_fastopen" = 3;
    ## Bufferfloat mitigations
    # Requires >= 4.9 & kernel module
    "net.ipv4.tcp_congestion_control" = "bbr";
    # Requires >= 4.19
    "net.core.default_qdisc" = "cake";
  };

  ## USBGuard
  # Load "/var/lib/usbguard/rules.conf" by default
  services.usbguard.enable = true;

  ## DNS-over-TLS
  services.stubby = {
    enable = true;
    settings = {
      listen_addresses = [ "127.0.0.1" "0::1" ];
      # https://github.com/getdnsapi/stubby/blob/develop/stubby.yml.example
      resolution_type = "GETDNS_RESOLUTION_STUB";
      dns_transport_list = [ "GETDNS_TRANSPORT_TLS" ];
      tls_authentication = "GETDNS_AUTHENTICATION_REQUIRED";
      tls_query_padding_blocksize = 128;
      idle_timeout = 10000;
      round_robin_upstreams = 1;
      tls_min_version = "GETDNS_TLS1_3";
      dnssec = "GETDNS_EXTENSION_TRUE";
      upstream_recursive_servers = [
        {
          address_data = "1.1.1.2";
          tls_auth_name = "cloudflare-dns.com";
        }
        {
          address_data = "1.0.0.2";
          tls_auth_name = "cloudflare-dns.com";
        }
        {
          address_data = "2606:4700:4700::1112";
          tls_auth_name = "cloudflare-dns.com";
        }
        {
          address_data = "2606:4700:4700::1002";
          tls_auth_name = "cloudflare-dns.com";
        }
        {
          address_data = "9.9.9.9";
          tls_auth_name = "dns.quad9.net";
        }
        {
          address_data = "149.112.112.112";
          tls_auth_name = "dns.quad9.net";
        }
        {
          address_data = "2620:fe::fe";
          tls_auth_name = "dns.quad9.net";
        }
        {
          address_data = "2620:fe::9";
          tls_auth_name = "dns.quad9.net";
        }
      ];
    };
  };

  networking.nameservers = [ "::1" "127.0.0.1" ];
  services.resolved = {
    enable = true;
    fallbackDns = [ "2606:4700:4700::1111" "2606:4700:4700::1001" "1.1.1.1" "1.0.0.1" ];
  };

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

  ## Create service users
  users = {
    mutableUsers = false; # Disable passwd

    users = {
      root = {
        hashedPassword = "*"; # Disable root password
      };
      nixos = {
        passwordFile = "/etc/nixos/nixos.password";
        isNormalUser = true;
        extraGroups = [ "wheel" ]; # Enable ‘sudo’ for the user.
      };
      caddyProxy = {
        home = "/var/lib/caddyProxy";
        createHome = true;
        isSystemUser = true;
        group = "caddyProxy";
      };
      caddyTor = {
        home = "/var/lib/caddyTor";
        createHome = true;
        isSystemUser = true;
        group = "caddyTor";
      };
      caddyI2p = {
        home = "/var/lib/caddyI2p";
        createHome = true;
        isSystemUser = true;
        group = "caddyI2p";
      };
    };

    groups = {
      caddyProxy = {
        members = [ "caddyProxy" ];
      };
      caddyTor = {
        members = [ "caddyTor" ];
      };
      caddyI2p = {
        members = [ "caddyI2p" ];
      };
    };
  };

  ## Requires OTP to login & sudo
  security.pam = {
    services.login.googleAuthenticator.enable = true;
    services.sudo.googleAuthenticator.enable = true;
  };

  ### The rest will be explained in the next articles
  ## Caddy web server
  require = [
    /etc/caddy/caddyProxy.nix
    /etc/caddy/caddyTor.nix
    /etc/caddy/caddyI2p.nix
  ];
  services.caddyProxy = {
    enable = false;
    config = "/etc/caddy/caddyProxy.conf";
  };
  services.caddyTor = {
    enable = false;
    config = "/etc/caddy/caddyTor.conf";
  };
  services.caddyI2p = {
    enable = false;
    config = "/etc/caddy/caddyI2p.conf";
  };

  ## Tor onion
  services.tor = {
    enable = true;
    enableGeoIP = false;
    relay.onionServices = {
      proxy = {
        version = 3;
        map = [{
          port = 80;
          target = {
            addr = "[::1]";
            port = 8080;
          };
        }];
      };
    };
    settings = {
      ClientUseIPv4 = false;
      ClientUseIPv6 = true;
      ClientPreferIPv6ORPort = true;
    };
  };

  ## I2P Eepsite
  services.i2pd = {
    enable = true;
    enableIPv4 = false;
    enableIPv6 = true;
    ifname = "ens3";
    address = "xxxx";
    inTunnels = {
      proxy = {
        enable = true;
        keys = "proxy-keys.dat";
        inPort = 80;
        address = "::1";
        destination = "::1";
        port = 8081;
      };
    };
  };
}
```
