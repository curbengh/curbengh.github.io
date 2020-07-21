---
title: Sign Git commit with an EdDSA/Ed25519/Curve25519 key
excerpt: Utilise a curve not produced by NIST
date: 2020-07-18
tags:
- security
- gitlab
---

## Generate an Ed25519 key

```
$ gpg --expert --full-generate-key

Please select what kind of key you want:
  (10) ECC (sign only)
Your selection? 10

Please select which elliptic curve you want:
  (1) Curve 25519
Your selection? 1

# Key shouldn't expire (in commit signing)
Please specify how long the key should be valid.
Key is valid for? (0) 0

Key expires at Sun 18 Jul 2021 00:00:00 UTC
Is this correct? (y/N) y

Real name: MDLeom
## GitHub: Go to "https://github.com/settings/emails"
# Look for "xxx@users.noreply.github.com will be used for web-based Git operations"
## GitLab: Go to "https://gitlab.com/profile"
# Look for "Use a private email - xxx@users.noreply.gitlab.com"
## Must include the unique number prefix.
Email address: 123456-curbengh@users.noreply.github.com
# Leave the comment empty
Comment: 
You selected this USER-ID:
  "MDLeom <123456-curbengh@users.noreply.github.com>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? o

# It should be separate from your system password
Enter a password to encrypt private key:

pub   ed25519 2020-07-18 [SC] [expires: 2021-07-18]
      CE44B3CFC4C68B868A7AE868D87953FAD4BB4EC4
uid   MDLeom <123456-curbengh@users.noreply.github.com>
```

## Export public key

```
## Export public key
# Add this public key to your GitHub/GitLab account
gpg --output public.gpg --armor --export CE44B3CFC4C68B868A7AE868D87953FAD4BB4EC4

## Export private key for backup
# The exported key will be encrypted with your password (that you entered during key generation)
# Need to use the same password to import back
gpg --output private.asc --armor --export-secret-key CE44B3CFC4C68B868A7AE868D87953FAD4BB4EC4
```

## Sign Git commit

```
# Enable commit signing in a repository folder
$ git config user.signingkey CE44B3CFC4C68B868A7AE868D87953FAD4BB4EC4

# Commit a change and sign it
$ git commit -S -m "commit message"
```

## See also

- [Curve25519](https://en.wikipedia.org/wiki/Curve25519#Popularity)
- [Dual_EC_DRBG](https://en.wikipedia.org/wiki/Dual_EC_DRBG)
