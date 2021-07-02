---
title: Using custom package in a NixOS module
excerpt: A workaround for installing GitHub-hosted package in a IPv6-only host
date: 2021-07-02
tags:
- nixos
---

I recently setup {% post_link cloudflare-argo-nixos 'cloudflared' %} on instances that power this website, while I got it working on most of them, it's not working on IPv6-only instance. There was installation guide which I managed to resolve later (and what this post is about) and Cloudflare tunnel itself [doesn't support](https://github.com/cloudflare/cloudflared/issues/401) IPv6 yet.

A quick recap on two of the main components of NixOS: module and package. A package is a program that is available on NixOS repository, the repo doesn't contain the binary, it's made up of nix files that describe _how_ to compile it. In this case, [cloudflared.nix](https://github.com/NixOS/nixpkgs/blob/master/pkgs/applications/networking/cloudflared/default.nix) is a script to download the source code from [GitHub](https://github.com/cloudflare/cloudflared) and compile it as a Go program.

A module is (usually) used to install a program as a service and make it configurable via `configuration.nix`. For example, [i2pd.nix](https://github.com/NixOS/nixpkgs/blob/master/nixos/modules/services/networking/i2pd.nix) module installs i2pd package ([`pkgs.i2pd`](https://github.com/NixOS/nixpkgs/blob/master/pkgs/tools/networking/i2pd/default.nix)) when `services.i2pd.enable` is enabled.

A major issue is that GitHub [doesn't support](https://github.community/t/github-on-the-ipv6-internet/2794/14) IPv6 yet, so my IPv6-only instance couldn't download the source code. A common workaround is to mirror the repo somewhere else that does support IPv6, which is what I did. Then, I created a new custom package nix:

{% codeblock cloudflared-custom.nix lang:nix https://github.com/NixOS/nixpkgs/blob/master/pkgs/applications/networking/cloudflared/default.nix source mark:8 %}
{ lib, buildGoModule, fetchgit }:

buildGoModule rec {
  pname = "cloudflared";
  version = "2021.6.0";

  src = fetchgit {
    url    = "https://example.com/example/cloudflared-mirror.git";
    rev    = "refs/tags/${version}";
    sha256 = "sha256-cX0kdBPDgwjHphxGWrnXohHPp1nzs4SnvCry4AxMtp0=";
  };

  vendorSha256 = null;

  doCheck = false;

  buildFlagsArray = "-ldflags=-X main.Version=${version}";

  meta = with lib; {
    description = "CloudFlare Argo Tunnel daemon (and DNS-over-HTTPS client)";
    homepage    = "https://www.cloudflare.com/products/argo-tunnel";
    license     = licenses.unfree;
    platforms   = platforms.unix;
    maintainers = [ maintainers.thoughtpolice maintainers.enorris ];
  };
}
{% endcodeblock %}

In my {% post_link clouflared-argo-nixos 'cloudflared module' %}, I updated the following lines:

``` diff
  options.services.argoWeb = {
    enable = mkEnableOption "Cloudflare Argo Tunnel";

    config = mkOption {
      default = "/etc/caddy/argoWeb.yml";
      type = types.str;
      description = "Path to cloudflared config";
    };

    dataDir = mkOption {
      default = "/var/lib/argoWeb";
      type = types.path;
      description = ''
        The data directory, for storing credentials.
      '';
    };

+    package = mkOption {
+      default = pkgs.cloudflared;
+      defaultText = "pkgs.cloudflared";
+      type = types.package;
+      description = "cloudflared package to use.";
+    };
  };

-        ExecStart = "${pkgs.cloudflared}/bin/cloudflared --config ${cfg.config} --no-autoupdate tunnel run";
+        ExecStart = "${cfg.package}/bin/cloudflared --config ${cfg.config} --no-autoupdate tunnel run";
```

Finally, in my `configuration.nix`, I configured it to use the custom package:

``` diff
  require = [
    /etc/caddy/argoWeb.nix
  ];

  nixpkgs.config.allowUnfree = true;
  services.argoWeb = {
    enable = true;
+    package = pkgs.callPackage (import /etc/caddy/cloudflared-custom.nix) { };
    config = "/etc/caddy/argoWeb.yml";
  };
```
