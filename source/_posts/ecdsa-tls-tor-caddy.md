---
title: Get a ECDSA TLS certificate for your onion service
excerpt: TLS cert for mere mortal
date: 2021-07-04
tags:
- tor
- caddy
---

While reading through Tor blog, there was [a post](https://blog.torproject.org/tls-certificate-for-onion-site) back in March 2021 to announce HARICA, a root CA operator, has started selling `.onion` TLS certificate. The cert is of domain validation (DV) type, significantly easier to purchase and cheaper than Digicert's extended validation (EV) cert, which was previously the only CA that supports .onion.

The post links to an [excellent tutorial](https://kushaldas.in/posts/get-a-tls-certificate-for-your-onion-service.html). Different from the tutorial, I prefer to use ECDSA cert than RSA, just like Cloudflare's cert. It includes nginx config, whereas I'm using Caddy web server.

1. Create a new [Cert Manager](https://cm.harica.gr/) account in HARICA.
2. From the Server Certificate on the left sidebar, create a new request for your onion address.
3. HARICA can generate a Certificate Signing Request (CSR) on your behalf, but I prefer to use an OpenSSL-generated CSR, so I generated and uploaded one.
4. To generate a CSR using OpenSSL:

```
# Generate an elliptic-curve private key
$ openssl ecparam -name prime256v1 -genkey -noout -out myonion.key
# prime256v1 is also used by Cloudflare

# Generate a CSR
$ openssl req -new -key myonion.key -out myonion.csr
# Leave everything blank by entering a dot (.), except for Common Name (CN)
# Enter your onion address in CN field
```

5. DV cert only requires a valid CN field, it's _optional_ to enter personal details in the CSR.
6. Back in Cert Manager, choose "upload a text file to a location on your web server" as the validation option. This option enables you to get wildcard (*.onion.com) cert, necessary if you have subdomain(s) under your onion service.
7. Instead of uploading a file to web server, I use [`respond`](https://caddyserver.com/docs/caddyfile/directives/respond) instead.

{% codeblock lang:Caddyfile mark:5-6 %}
http://xw226dvxac7jzcpsf4xb64r4epr6o5hgn46dxlqk7gnjptakik6xnzqd.onion:8080 {
  bind ::1

  # Harica CA domain validation
  @harica path /.well-known/pki-validation/xxx
  respond @harica "yyy"
}
{% endcodeblock %}

8. Restart Caddy and check the path has correct response. `curl http://localhost:8080/.well-known/pki-validation/xxx -H "Host: your-onion.onion"
9. After HARICA verified my onion, I received an email notification that it's ready for purchase and download.
10. Download the P7B format with the full chain and convert it to PEM:

```
openssl pkcs7 -inform pem -in myonion.p7b -print_certs -out myonion.pem -outform pem
```

11. Upload ".pem" and ".key" to the server. `chown` it to the Caddy system user and `chmod 600`.

12. Install the cert in Caddy. Site address has to be separated to HTTP and HTTPS blocks due to the use of custom port. When custom port is not used, Caddy listens on port 80 and 443 by default.

``` Caddyfile
# HTTP
http://xw226dvxac7jzcpsf4xb64r4epr6o5hgn46dxlqk7gnjptakik6xnzqd.onion:8080 {
  bind ::1

  # Redirect to HTTPS
  redir https://xw226dvxac7jzcpsf4xb64r4epr6o5hgn46dxlqk7gnjptakik6xnzqd.onion{uri} permanent

  # HSTS (optional)
  header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
}

# HTTPS
xw226dvxac7jzcpsf4xb64r4epr6o5hgn46dxlqk7gnjptakik6xnzqd.onion:8079 {
  bind ::1

  tls /var/lib/caddy/myonion.pem /var/lib/caddy/myonion.key

  header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

  @harica path /.well-known/pki-validation/xxx
  respond @harica "yyy"
}
```

13. Finally, update the Tor config. I configured it via NixOS global config.

{% codeblock configuration.nix lang:nix mark:13-17 %}
  services.tor = {
    enable = true;
    relay.onionServices = {
      myonion = {
        version = 3;
        map = [{
          port = 80;
          target = {
            addr = "[::1]";
            port = 8080;
          };
        } {
          port = 443;
          target = {
            addr = "[::1]";
            port = 8079;
          };
        }];
      };
    };
  };
{% endcodeblock %}
