---
title: SSH certificate using Cloudflare Tunnel
excerpt: A quick quide to SSH certificate without using an identity provider.
date: 2023-02-13
updated: 2023-02-21
tags:
  - cloudflare
---

This article provides a quick-start guide to SSH certificate using Cloudflare Tunnel. More information can be found in the official docs.

- [Public keys are not enough for SSH security](https://blog.cloudflare.com/public-keys-are-not-enough-for-ssh-security/)
- [SSH with short-lived certificates](https://developers.cloudflare.com/cloudflare-one/tutorials/ssh-cert-bastion/)
- [Configure short-lived certificates](https://developers.cloudflare.com/cloudflare-one/identity/users/short-lived-certificates/)
- [Self-hosted applications](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-apps/)
- [Connect with SSH through Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/use_cases/ssh/)

## Introduction

One unpleasant task I had previously in an enterprise with Linux servers was SSH key management, specifically checking the SSH public keys of departed staff have been removed from the Ansible config. Then I learned from [this article](https://smallstep.com/blog/use-ssh-certificates/) that it is possible to SSH using a short-lived (<1 day) certificate that is only issued to the user after successfully authenticate with the enterprise identity provider's (e.g. Azure AD) single sign-on (SSO). This means once a user is revoked from the identity provider, that user would not be issued with a new certificate to SSH again the next day. At that time, I didn't feel like configuring and integrating an identity provider, so I held off trying the feature.

Recently, I wanted to try out the Cloudflare Zero Trust free tier. While reading through the [SSH configuration](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/use_cases/ssh/) guide, I found out that Cloudflare support issuing [SSH user certificate](https://developers.cloudflare.com/cloudflare-one/identity/users/short-lived-certificates/). While Cloudflare supports several [SSO integration](https://developers.cloudflare.com/cloudflare-one/identity/idp-integration/), it also supports authenticating using [one-time PIN](https://developers.cloudflare.com/cloudflare-one/identity/one-time-pin/) sent to an email address that does not have to be a Cloudflare account. Cloudflare also supports browser-based shell, just like the AWS [Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html).

## Prerequisites

- A domain hosted on Cloudflare DNS
- Cloudflare Zero Trust (free for 50 users)
- A VM or cloud instance (optional, easier to clean up)

## Cloudflare Zero Trust

Navigate to **Zero Trust** page shown on the sidebar after you login to [dash.cloudflare.com](https://dash.cloudflare.com). If this is your first time, Cloudflare will ask for billing info in which you can use an existing one or add a new credit card. You won't get charged as long as you stay within the **free tier** (50 users), I will show you how to check later in this article.

The setup will then ask you to name your team domain _team-name_.cloudflareaccess.com. Just create a random name for now, you can always change it later.

## Add an application

Once you're in Zero Trust console, navigate to **Access** -> **Applications**. **Add an application** and choose **Self-hosted**.

**Configure app** tab,

- Application name: any name
- Session duration: 15 minutes.
  - In a corporate environment, "6 hours" is probably more user-friendly.
  - For sensitive server, consider "No duration".
- Application domain: test.yourdomain.com
  - The subdomain should not have an existing website.
  - It may be possible to use an existing website, by specifying test.yourdomain.com/custom-path for SSH, though I haven't try it.
- App Launcher visbility: No
- Accept all available identity providers: No, unless you have integrated an identity provider.
- Select One-time PIN
- Instant Auth: Yes

**Add policies** tab,

- Policy name: any name
- Action: Allow
- Session duration: same
- Configure rules: (Include) Emails = an email address
  - Any of your email is fine, regardless whether it's a Cloudflare account.
  - Cloudflare _will not_ create an account using that email, it will only be used to receive one-time PIN.

**Setup** tab:

- CORS settings: leave it as is
- Cookies settings:
  - SameSite Attribute: blank or Lax
    - Either setting is practically the same, browsers default to Lax when SameSite is not set.
    - "Strict" value cannot be used because Cloudflare will authenticate the user on _team-name_.cloudflareaccess.com and issue a cookie on test.yourdomain.com.
  - HTTP Only: Yes
- Additional settings:
  - Enable automatic cloudflared authentication: Yes
  - Browser rendering: SSH

## Generate a CA certificate

Navigate to **Access** -> **Service Auth** -> **SSH** tab. Select the application you just created and **Generate certificate**.

Copy the generated public key and save it to `/etc/ssh/ca.pub` in your host (the host you're going to SSH into).

```
sudo -e /etc/ssh/ca.pub
```

## Create a tunnel

Navigate to **Access** -> **Tunnels**

- Name: any name

**Install connector** tab, choose the relevant OS and run the installation command. Once installed, you should see "connected" status.

**Route tunnel** tab,

- Public hostname: test.yourdomain.com
  - This is the application domain in the [Add an application](#add-an-application) step.
- Service
  - SSH type: URL = localhost:22
    - Replace 22 with the custom SSH port you are going to use.

After finishing creating a tunnel, you should have a new CNAME DNS record that points to _tunnel-id_.cfargotunnel.com. If there is no CNAME entry, grab the tunnel ID and create a new DNS record.

## Start SSH server

Install `openssh-server`.

`sudo -e /etc/ssh/sshd_config.d/cf.conf`

```plain /etc/ssh/sshd_config.d/cf.conf
TrustedUserCAKeys /etc/ssh/ca.pub
ListenAddress 127.0.0.1
ListenAddress ::1
PasswordAuthentication no
# Uncomment below line for custom port
# Port 1234
```

`systemctl restart ssh` or `systemctl restart sshd`

## Create a test user

The easiest setup is one where a Unix username matches the email that you configured to receive one-time PIN in previous steps. For example, if you set **loremipsum**@youremail.com, then create a new user **loremipsum**.

`sudo adduser loremipsum`

Set a random password and leave everything else blank.

### Matching email to different username

To match **loremipsum**@youremail.com to **lipsum** user:

```plain /etc/ssh/sshd_config.d/cf.conf
Match user lipsum
  AuthorizedPrincipalsCommand /bin/echo 'loremipsum'
  AuthorizedPrincipalsCommandUser nobody
```

**loremipsum+somealias**@youremail.com also works.

```plain /etc/ssh/sshd_config.d/cf.conf
Match user lipsum
  AuthorizedPrincipalsCommand /bin/echo 'loremipsum+somealias'
  AuthorizedPrincipalsCommandUser nobody
```

### AuthorizedPrincipalsFile

For NixOS user, `AuthorizedPrincipalsCommand` will not work because the command will run within "/nix/store" but it is read-only. Instead, you should use `AuthorizedPrincipalsFile`. This config also enables you to match multiple emails to a username, just separate each email user by newline. This applies to all OpenSSH instances, not just NixOS.

`echo 'loremipsum' | sudo tee /etc/ssh/authorized_principals`

````nix /etc/nixos/configuration.nix
  services.openssh = {
    enable = true;
    permitRootLogin = "no";
    passwordAuthentication = false;
    # ports = [ 1234 ];
    extraConfig =
      ''
        TrustedUserCAKeys /etc/ssh/ca.pub
        Match User lipsum
          AuthorizedPrincipalsFile /etc/ssh/authorized_principals
          # if there is no existing AuthenticationMethods
          AuthenticationMethods publickey
      '';
  };
```

### Other use cases

https://developers.cloudflare.com/cloudflare-one/identity/users/short-lived-certificates/#2-ensure-unix-usernames-match-user-sso-identities

## Initiate SSH connection

Install `cloudflared` on the host that you're going to SSH from.

`cloudflared access ssh-config --hostname test.yourdomain.com --short-lived-cert`

Example output:

```plain ~/.ssh/config
Match host test.yourdomain.com exec "/usr/local/bin/cloudflared access ssh-gen --hostname %h"
    ProxyCommand /usr/local/bin/cloudflared access ssh --hostname %h
    IdentityFile ~/.cloudflared/%h-cf_key
    CertificateFile ~/.cloudflared/%h-cf_key-cert.pub
````

or

```plain ~/.ssh/config
Host test.yourdomain.com
    ProxyCommand bash -c '/usr/local/bin/cloudflared access ssh-gen --hostname %h; ssh -tt %r@cfpipe-test.yourdomain.com >&2 <&1'

Host cfpipe-test.yourdomain.com
    HostName test.yourdomain.com
    ProxyCommand /usr/local/bin/cloudflared access ssh --hostname %h
    IdentityFile ~/.cloudflared/test.yourdomain.com-cf_key
    CertificateFile ~/.cloudflared/test.yourdomain.com-cf_key-cert.pub
```

Save the output to `$HOME/.ssh/config`.

Now, the moment of truth.

`ssh loremipsum@test.yourdomain.com` (replace the username with the one you created in [Create a test user](#create-a-test-user) step.)

The terminal should launch a website to _team-name_.cloudflareaccess.com. Enter the email you configured in [Add an application](#add-an-application) step and then enter the received 6-digit PIN.

Back to the terminal, wait for at least 5 seconds and you should see the usual SSH authentication.

> You may wondering why you still see fingerprint warning, I find this article [SSH Best Practices using Certificates, 2FA and Bastions](https://goteleport.com/blog/how-to-ssh-properly/) explains it well.

## Browser-based shell

As a bonus, head to test.yourdomain.com (see [Add an application](#add-an-application) step) which will redirect you to a login page just the previous step. After login with a 6-digit PIN, you shall see a browser-based shell.

## Usage monitoring

Head to **Settings** -> **Account** to monitor how many users you have, each email address you configured to receive one-time PIN is counted as one user.

To delete user(s), head to **Users**, tick the relevant users, **Update status** and then **Remove**. The seat usage column should show _Inactive_.

## Inspect user certificate

`ssh-keygen -L -f ~/.cloudflared/test.yourdomain.com-cf_key-cert.pub`
