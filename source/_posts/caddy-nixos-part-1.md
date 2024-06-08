---
title: "Setup Caddy as a reverse proxy on NixOS (Part 1: Installation)"
excerpt: "Part 1: Installing NixOS"
date: 2020-02-23
updated: 2021-02-22
tags:
- server
- linux
- caddy
- nixos
series: first
---

In this segment, I show you how I install NixOS.

This post is Part 1 of a series of articles that show you how I set up Caddy, Tor hidden service and I2P Eepsite on NixOS:

- Part 1: Install NixOS
- {% post_link caddy-nixos-part-2 'Part 2: Configure NixOS' %}
- {% post_link caddy-nixos-part-3 'Part 3: Configure Caddy' %}
- {% post_link tor-hidden-onion-nixos 'Part 4: Setup Tor hidden service' %}
- {% post_link i2p-eepsite-nixos 'Part 5: Configure I2P' %}

## Background

> Skip to [Installation](#installation) part.

I set up this website with JAMstack architecture. Before moving to the current domain, I set four requirements:

1. Retain current JAMstack workflow
2. Ability to add and _remove_ HTTP headers
3. Available on Tor .onion
4. Cloudflare CDN

This website's JAMstack workflow goes like this:

1. Pages are written in Markdown.
2. Markdown files are Git-hosted on GitLab
3. Any commit to GitLab repository triggers a build on Netlify CI
4. Markdown files are processed into HTML pages using Nodejs-powered Hexo.
5. Generated pages are hosted on curben.netlify.app

(Edit: 22 Feb 2021) static site is now hosted primarily on Cloudflare Pages curben.pages.dev, with Netlify as a standby.

Right off the bat I can already see the need of setting up a private server due to the second requirement (ability to remove HTTP header). I had an option to drop Netlify by building the pages on my workstation and deploy to the web server (using a Hexo deployer plugin). So far I do find Netlify service to be reliable and it offers features like adding headers and reverse proxy which are easy to setup. Speaking of Netlify's features, I then had an idea of setting up a web server which reverse proxy to Netlify. This approach meets all the four requirements; a side-benefit is that if I screw up the web server, at least my website is still up on curben.netlify.app and I can easily migrate this domain to Netlify.

As for web server, I went with Caddy, which has the most secured defaults. It is installed in NixOS, which is attractive for its centralised configuration. I initially planned to use Ubuntu, and then I noticed [NixOS](https://nixos.org/); unlike most other Linux servers which has configs scattered around, NixOS is configured through a single "configuration.nix" file. It is [declarative](https://en.wikipedia.org/wiki/Declarative_programming), meaning you simply supply the desired configuration and NixOS would figure how to achieve that. For example, to open port 80, you just need `networking.firewall.allowedTCPPorts = [ 80 ]`, instead of mucking around with iptables. This significantly helps reproducibility, making server migration much easier; simply supply the "configuration.nix" used in the previous server and the new server would have the same state. Having Caddy in the repo is the tipping point that finally made me dive into NixOS.

![Architecture behind mdleom.com](20200223/caddy-nixos.png)

Above diagram shows the architecture behind this website (mdleom.com). When a visitor browse mdleom.com, it will first go through Cloudflare CDN, the CDN then pass the request to my virtual private server (VPS). Before it reaches my VPS, there is a cloud firewall provided by the VPS host which I configure to allow inbound port 443. Once my VPS receive the request, the iptables port forward from 443 to 4430. The web server (Caddy) binds to (or listens on) port 4430 and it acts as a reverse proxy to the actual backend, curben.netlify.app.

The flow is slightly different when browsing via [.onion](http://xw226dvxac7jzcpsf4xb64r4epr6o5hgn46dxlqk7gnjptakik6xnzqd.onion). Tor hidden service is able to NAT-punching, only rely on outbound connection, so it can work behind a firewall that block inbound ports. The Tor daemon acts as a reverse proxy and forward the request to Caddy, which in turn is also a reverse proxy which finally forward the request to curben.netlify.app.

## Installation

NixOS has a detailed installation [guide](https://nixos.org/nixos/manual/index.html#sec-installation), anyhow this is how I installed it.

1. The LiveCD automatically login as "nixos". Simply switch to the root shell. You could setup SSH before installation. Personally I can accept the KVM console latency and I didn't want to open another port, so I never bother.

``` sh
sudo -s
```

2. Create the necessary partitions. I went with the classic MBR since my VPS provider still supports it and I don't need 2 TB partition. I set up a "swap" partition due to having a tiny RAM; if you have less than 2 GB RAM, it's better to have it, otherwise the `nixos-install` step would fail.

``` sh
# Most KVM-powered VPS use "/dev/vda" naming scheme (instead of "/dev/sda")
# Check the output of `ls /dev/` to make sure
parted /dev/vda -- mklabel msdos

# Create a new partition that fill the disk but
# leaves 1 GB space for the swap
parted /dev/vda -- mkpart primary 1MiB -1GiB

# Swap partition
parted /dev/vda -- mkpart primary linux-swap -1GiB 100%
```

3. Format the partitions.

``` sh
mkfs.btrfs -L nixos /dev/vda1
# Or "mkfs.ext4" if preferred

mkswap -L swap /dev/vda2
```

4. Mount the partitions.

``` sh
mount /dev/disk/by-label/nixos /mnt
swapon /dev/vda2
```

5. Generate the configs. This generates "configuration.nix" and "hardware-configuration.nix".

``` sh
nixos-generate-config --root /mnt
```

6. I replaced the generated "configuration.nix" with my own "configuration.nix". Before uploading the config to the server, I did the following change,

    1. Replace "/dev/sda" with "/dev/vda" in `boot.loader.grub.device`
    2. Replace "eth0" to "ens3" in firewall config (check output of `ifconfig`)
    3. Encrypt the file using 7zip before upload.

    ``` sh
    # This is much less memory-intensive than `nix-env -i package`
    # wormhole-william is Go-implementation of magic-wormhole
    # Available in 20.09+
    nix-env -f '<nixpkgs>' -iA google-authenticator p7zip usbguard wormhole-william

    cd /tmp
    wormhole-william receive configuration.7z
    7z x configuration.7z

    cp configuration.nix /mnt/etc/nixos/
    ```

7. Install it without setting root password (so that root remains disabled)

```
nixos-install --no-root-passwd
```

8. In my setup, the installation downloaded around 1 GB of packages.

9. Once the installation is done, before shutting down, secure delete the downloaded files.

``` sh
shred -uz configuration.7z configuration.nix
```

10. Shutdown, unmount the live cd, boot.

Following is my "configuration.nix". I'll show you how to secure NixOS using hashed password, firewall, DNS-over-TLS and USBGuard in my next post. After that, I'll show you how to setup Caddy and Tor (they are disabled for now).

``` nix /etc/nixos/configuration.nix
{ config, pkgs, ... }:

{
  imports =
    [ # Include the results of the hardware scan.
      ./hardware-configuration.nix
    ];

  system.stateVersion = "19.09";

  # Use the GRUB 2 boot loader.
  boot.loader.grub.enable = true;
  boot.loader.grub.version = 2;
  boot.loader.grub.device = "/dev/vda";

  networking.useDHCP = false;
  networking.interfaces.ens3.useDHCP = true;

  environment.systemPackages = with pkgs; [
    dnsutils p7zip wormhole-william
  ];

  # Save some typing
  environment.shellAliases = {
    wormhole = "wormhole-william";
  };

  time.timeZone = "UTC";

  ## Create service users
  users = {
    mutableUsers = false; # Disable useradd & passwd

    users = {
      root = {
        hashedPassword = "*"; # Disable root password
      };
      nixos = {
        hashedPassword = "xxxx";
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
    };

    groups = {
      caddyProxy = {
        members = [ "caddyProxy" ];
      };
      caddyTor = {
        members = [ "caddyTor" ];
      };
    };
  };
}

```
