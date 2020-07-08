---
title: Block phishing websites with phishing-filter
excerpt: Many formats available
date: 2020-07-07
updated: 2020-07-08
tags:
- security
---

> Skip to [phishing-filter](#phishing-filter) section

Recently I switched Firefox's Android app from Preview Nightly to Nightly after the former has been [deprecated](https://old.reddit.com/r/Android/comments/hk37jl/firefox_preview_has_been_merged_into_firefox/). The switch entailed migrating the configurations; a config I need to migrate over is DNS-over-HTTPS (DoH). I verified the Quad9's DoH address through its [instruction page](https://www.quad9.net/doh-quad9-dns-servers/) (tips: you can use "https://9.9.9.9/dns-query" instead of "https://dns.quad9.net/dns-query" so that a browser doesn't need to query the IP behind dns.quad9.net). I also checked out its [recent article](https://quad9.net/dns-blocking-effectiveness-recent-independent-tests/) that talks about how effective it blocks malicious and phishing websites (via DNS-blocking) compared to other well-known DNS service, like Cloudflare and OpenDNS. According to this [replication test](https://www.andryou.com/2020/05/31/comparing-malware-blocking-dns-resolvers-redux/), the effectiveness was measured based on the [DShield.org Suspicious Domain List](https://isc.sans.edu/suspicious_domains.html), which in turn was based on [PhishTank](https://www.phishtank.com/) and [URLhaus](https://urlhaus.abuse.ch/) lists.

I was intrigued by the DShield list as I created a blocklist ([urlhaus-filter](https://gitlab.com/curben/urlhaus-filter)) that is also based on URLhaus. I then checked out its another source, the PhishTank list. PhishTank operates similarly to URLhaus, the links are user-submitted. User can vote on submitted links (of other users') are indeed phishing websites. The database is available in [various formats](https://www.phishtank.com/developer_info.php) including CSV. This seemed ideal to be processed into a blocklist, just like what I did in urlhaus-filter. To avoid duplicate effort, I did a search on FilterLists and there is a domain-based blocklist ("[Phishing Bad Sites](https://filterlists.com/lists/phishing-bad-sites)") that is based on PhishTank.

Domain-based blocklist is created by stripping out the path of the original links, leaving the domain only (e.g. `www.example.com`~~`/foo-page`~~). This blocks the whole website, instead of specific webpages; it also significantly reduces the file size, not just from the path stripping, but also de-duplication of domains. However, one thing I learned from urlhaus-filter is that many malicious links are also hosted on popular domains, like Google Docs and Dropbox; such is the fate of file-hosting service, it will inadvertently be abused to host malicious content. To avoid blocking those popular services, I utilise [Umbrella Popularity List](https://s3-us-west-1.amazonaws.com/umbrella-static/index.html) and [Tranco List](https://tranco-list.eu/) to remove popular domains from urlhaus-filter and minimise false positive. Since uBlock Origin (uBO) supports blocking webpages via static filter (e.g. `||example.com/foo-page$all`), malicious webpages (of popular domains) are still blocked in the [uBO-specific filter](https://gitlab.com/curben/urlhaus-filter#url-based).

I ran a quick check on "Phishing Bad Sites" filter:

```
$ grep -F 'google' 2020-07-07-phishing.bad.sites.conf
```

The search result included Google Drive and Google Play. Hence, I find it necessary to create a new PhishTank-based filter, with minimal false positives and available in various formats (other than uBO). Another reason is that despite PhishTank being operated by OpenDNS, it [does not](https://www.phishtank.com/faq.php#whyisasitemarkedbyph) block all of the verified phishing websites.

## phishing-filter

I presents [phishing-filter](https://gitlab.com/curben/phishing-filter), a blocklist to restrict >14K phishing websites. [uBlock Origin](https://github.com/gorhill/uBlock) (uBO) users can import [phishing-filter.txt](https://gitlab.com/curben/phishing-filter/raw/master/dist/phishing-filter.txt) to install the filter. Other formats includes domain-based, hosts-based, dnsmasq, bind and unbound, refer to the repository for installation guide. The blocklist utilises similar approach as urlhaus-filter to exclude popular domains. Phishing links found in popular domains are still included in the "phishing-filter.txt", hence I recommend to use uBO for best result.

The workflow is largely similar to what I did in urlhaus-filter, so I don't have to reinvent the wheel here. I did take the opportunity to improve the repository's folder structure, which I find a bit messy in urlhaus-filter. urlhaus-filter's folder structure is still retained as is because changing it would induce breaking change. In phishing-filter, all generated filters are put in `dist/` folder, taking a page from Javascript/NPM libraries. All scripts are in `src/` folder and `utils` folder contains [csvquote](https://github.com/dbro/csvquote) binaries.

csvquote is a workaround for the use of _optional_ quote in PhishTank database. A URL is quoted only when there is a comma.

```
1,http://example-phishing.com/lorem,...
2,"http://example-phishing.net/ipsum,dolor",...
```

This makes `cut` having incorrect result, the comma in the link is trimmed off,

```
$ cat phishtank.csv | cut -f 2 -d ","
http://example-phishing.com/lorem
"https://example.phishing.net/ipsum
```

csvquote works by escaping the comma(s) in the column and then un-escape back.

```
$ cat phishtank.csv | csvquote | cut -f 2 -d "," | csvquote -u
http://example-phishing.com/lorem
"https://example.phishing.net/ipsum,ipsum"
```

I then remove the quotes with `sed 's/"//g'`. It will be more convenient if _all_ URLs are quoted--just like URLhaus.csv--I can simply use `cut -f 2 -d '"'`. I know I'm not supposed to use `cut` to process csv, but there is no csv-processing command line tools available in Alpine Linux official packages.

Before I stumbled upon csvquote, I also considered [xsv](https://github.com/BurntSushi/xsv) and [csvtools](https://github.com/DavyLandman/csvtools). xsv is written in Rust and can be installed via Cargo package manager, which is available in Alpine Linux. I couldn't compile csvtools under Alpine because it's not compatible with musl. Ultimately, I chose csvquote due to simplicity, minimal size and being compatible with both glibc and musl. Speaking of glibc and musl, the binaries are incompatible with each other; I couldn't run glibc-compiled csvquote on Alpine (musl-based), neither did musl-compiled binary on Ubuntu. I utilise a musl detection script that can adjust the binary choice automatically.

``` sh script.sh https://stackoverflow.com/a/60471114 Source
#!/bin/sh

LIBC="$(ldd /bin/ls | grep 'musl' || [ $? = 1 ])"
if [ -z "$LIBC" ]; then
  rm -f "/tmp/musl.log"
  # Not Musl
  CSVQUOTE="../utils/csvquote-bin-glibc"
else
  # Musl
  CSVQUOTE="../utils/csvquote-bin-musl"
fi

cat "phishtank.csv" | \
"./$CSVQUOTE" | \
cut -f 2 -d "," | \
"./$CSVQUOTE" -u | \
...
```

_OpenDNS and PhishTank are either trademarks or registered trademarks of OpenDNS, LLC._
