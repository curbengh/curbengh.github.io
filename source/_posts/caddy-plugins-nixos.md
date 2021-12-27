---
title: Installing Caddy plugins in NixOS
excerpt: By using custom package
date: 2021-12-27
tags:
- caddy
- nixos
---

Caddy, like any other web servers, is extensible through plugins. Plugin is usually installed using [xcaddy](https://github.com/caddyserver/xcaddy); using it is as easy as `$ xcaddy build --with github.com/caddyserver/ntlm-transport` to build the latest caddy binary with [ntlm-transport](https://github.com/caddyserver/ntlm-transport) plugin.

NixOS has its [own way](https://nixos.org/manual/nixpkgs/stable/#sec-language-go) of building Go package (Caddy is written in Go), so using xcaddy may be counterintuitive. The _Nix_-way to go is to build a custom package using a "*.nix" file and instruct the service (also known as a _module_ in Nix ecosystem) to use that package instead of the repo's.

In NixOS, the Caddy module has long included [`services.caddy.package`](https://search.nixos.org/options?channel=21.11&show=services.caddy.package&from=0&size=50&sort=relevance&type=packages&query=caddy) option to specify custom package. It was primarily used as a way to install Caddy 2 from the unstable channel (`unstable.caddy`) because the package in stable channel (`pkgs.caddy`) of NixOS 20.03 is still Caddy 1. I talked about that option in a {% post_link caddy-v2-nixos 'previous post' %}.

Aside from installing Caddy from different channel, that option can also be used to specify a custom package by using [`pkgs.callPackage`](https://nixos.org/guides/nix-pills/callpackage-design-pattern.html). I {% post_link custom-package-nixos-module 'previously used' %} `callPackage` as a workaround to install cloudflared in a IPv6-only instance from a repository other than GitHub because GitHub doesn't support IPv6 yet.

If a custom package is defined in "/etc/caddy/custom-package.nix", then the configuration will be:

``` nix /etc/nixos/configuration.nix
  services.caddy = {
    enable = true;
    package = pkgs.callPackage /etc/caddy/custom-package.nix { };
  };
```

## Custom package

The following package patches the "[main.go](https://github.com/caddyserver/caddy/blob/master/cmd/main.go)" file of the upstream source to insert additional plugins. The code snippet is courtesy of [@diamondburned](https://github.com/diamondburned). The marked lines show how plugins are specified through the `plugins` option.

{% codeblock /etc/caddy/custom-package.nix lang:nix https://github.com/NixOS/nixpkgs/issues/89268#issuecomment-636529668 source mark:3,12 %}
{ lib, buildGoModule, fetchFromGitHub, plugins ? [], vendorSha256 ? "" }:
with lib;
let imports = flip concatMapStrings plugins (pkg: "\t\t\t_ \"${pkg}\"\n");

  main = ''
    package main

    import (
      caddycmd "github.com/caddyserver/caddy/v2/cmd"

      _ "github.com/caddyserver/caddy/v2/modules/standard"
${imports}
    )

    func main() {
      caddycmd.Main()
    }
  '';

in buildGoModule rec {
  pname = "caddy";
  version = "2.4.6";

  subPackages = [ "cmd/caddy" ];

  src = fetchFromGitHub {
    owner = "caddyserver";
    repo = pname;
    # https://github.com/NixOS/nixpkgs/blob/nixos-21.11/pkgs/servers/caddy/default.nix
    rev = "v${version}";
    sha256 = "sha256-xNCxzoNpXkj8WF9+kYJfO18ux8/OhxygkGjA49+Q4vY=";
  };

  inherit vendorSha256;

  overrideModAttrs = (_: {
    preBuild    = "echo '${main}' > cmd/caddy/main.go";
    postInstall = "cp go.sum go.mod $out/ && ls $out/";
  });

  postPatch = ''
    echo '${main}' > cmd/caddy/main.go
    cat cmd/caddy/main.go
  '';

  postConfigure = ''
    cp vendor/go.sum ./
    cp vendor/go.mod ./
  '';

  meta = with lib; {
    homepage = https://caddyserver.com;
    description = "Fast, cross-platform HTTP/2 web server with automatic HTTPS";
    license = licenses.asl20;
    maintainers = with maintainers; [ rushmorem fpletz zimbatm ];
  };
}
{% endcodeblock %}

## Install custom package

Specify the desired plugins in `services.caddy.package.plugins`:

``` nix /etc/nixos/configuration.nix
  services.caddy = {
    enable = true;
    package = (pkgs.callPackage /etc/caddy/custom-package.nix {
      plugins = [
        "github.com/caddyserver/ntlm-transport"
        "github.com/caddyserver/forwardproxy"
      ];
      vendorSha256 = "0000000000000000000000000000000000000000000000000000";
    });
  };
```

The above example will install ntlm-transport and [forwardproxy](https://github.com/caddyserver/forwardproxy) plugins. The first run of `nixos-rebuild` will fail due to mismatched `vendorSha256`, simply replace the "000..." with the expected value and the second run should be ok.
