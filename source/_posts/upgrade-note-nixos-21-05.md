---
title: My upgrade note of NixOS 21.05
excerpt: Changes that I made when upgrading from 20.09 to 21.05
date: 2021-06-13
tags:
- server
- linux
- tor
- nixos
---

This post details the changes I made to my NixOS' configuration when upgrading from 20.09 to 21.05.

## isNormalUser/isSystemUser

Either [`isNormalUser`](https://search.nixos.org/options?channel=21.05&show=users.users.%3Cname%3E.isNormalUser&from=0&size=50&sort=relevance&query=isnormaluser) or `isSystemUser` must now be set. This mainly affects service user (user that is created solely to run a service).

``` diff
  users = {
    users = {
      fooService = {
        home = "/var/www";
        createHome = true;
+        isSystemUser = true;
      };
    };
  };
```

## Make home folder world-readable

I have a "{% post_link rsync-setup-nixos '/var/www' %}" folder which I use to serve this website. Previously, `chmod +xr` was persistent but now NixOS always set the permission of a user's home folder to be `chmod 700` every time `nixos-rebuild` is executed. As a workaround, I have to configure nix to execute chmod after `nixos-rebuild` and during boot.

``` nix
  system.activationScripts = {
     www-data.text =
     ''
       chmod +xr "/var/www"
     '';
  };
```

## Tor onion

Some settings have been renamed:

1. hiddenServices -> relay.onionServices
2. `map.*.toHost` -> `map.*.target.addr`
3. extraConfig -> settings


``` diff
  services.tor = {
    enable = true;
    enableGeoIP = false;
-    hiddenServices = {
-      myOnion = {
-        version = 3;
-        map = [
-          {
-            port = "80";
-            toHost = "[::1]";
-            toPort = "8080";
-          }
-        ];
-      }
-    }
-    extraConfig =
-      ''
-        ClientUseIPv4 0
-        ClientUseIPv6 1
-        ClientPreferIPv6ORPort 1
-      '';
+    relay.onionServices = {
+      myOnion = {
+        version = 3;
+        map = [{
+          port = 80;
+          target = {
+            addr = "[::1]";
+            port = 8080;
+          };
+        }];
+      };
+    };
+    settings = {
+      ClientUseIPv4 = false;
+      ClientUseIPv6 = true;
+      ClientPreferIPv6ORPort = true;
+    };
  };
```
