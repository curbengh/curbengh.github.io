---
title: Comparing malware-blocking DNS providers using URLhaus and PhishTank
excerpt: Canadian Shield, Cloudflare, DNS Filter, NextDNS, OpenDNS, Quad9
date: 2020-07-11
updated: 2020-07-14
tags:
- security
---

Quad9--a DNS provider that blocks malicious domains by default--recently announced (in [this post](https://quad9.net/dns-blocking-effectiveness-recent-independent-tests/)) it has >90% effectiveness in filtering malware websites, according to an [independent test](https://forums.lawrencesystems.com/t/dns-malware-filtering-compared-quad9-vs-cloudflare-vs-dns-filter-vs-opendns-cisco-umbrella/5072). Reading through the forum post, a security researcher from DNSFilter (one of the DNS providers tested) [raised a concern](https://forums.lawrencesystems.com/t/dns-malware-filtering-compared-quad9-vs-cloudflare-vs-dns-filter-vs-opendns-cisco-umbrella/5072/30) about the quality of the dataset [DShield.org Suspicious Domain List](https://isc.sans.edu/suspicious_domains.html) that was sourced from outdated lists. I noticed the lists that he mentioned are different from the ones I saw on the DShield website. The more [recent version](https://web.archive.org/web/20200612030447/https://isc.sans.edu/suspicious_domains.html) (which I saw) mentioned [URLhaus](https://urlhaus.abuse.ch/) and [PhishTank](https://www.phishtank.com/), whereas [previously](https://web.archive.org/web/20200528232041/https://isc.sans.edu/suspicious_domains.html) it mentioned Malware Domain List, Malwaredomains blocklist and others. That researcher was right about it when I noticed [another](https://www.andryou.com/2020/05/31/comparing-malware-blocking-dns-resolvers-redux/) DNS-filtering test that also used previous version of DShield list, mentioned there were only 137 out of 2,288 (**~6%**) of the domains are live during the test. This is exactly the reason DShield switched out its sources.

Using outdated datasets casts doubt on the accuracy of that DNS-filtering test. In light of this discovery, I decided to do my own test using URLhaus and PhishTank datasets. Instead of using the raw datasets, I sourced domain lists from the blocklists [urlhaus-filter](https://gitlab.com/curben/urlhaus-filter) and [phishing-filter](https://gitlab.com/curben/phishing-filter) (which I maintain). Specifically, I used [urlhaus-filter-hosts-online.txt](https://gitlab.com/curben/urlhaus-filter/-/blob/1b53f63f5d708cd528b6744a2045f6a47491beaa/urlhaus-filter-hosts-online.txt) and [phishing-filter-hosts](https://gitlab.com/curben/phishing-filter/-/blob/5183915d29604ed14b14e1924912a994cccd2fab/dist/phishing-filter-hosts.txt) which already filtered out IP address and popular domains. I just need to remove the comment and `0.0.0.0`.

``` sh
cat urlhaus-filter-hosts-online.txt | \
# Remove header comment
sed "/^#/d" | \
# Remove "0.0.0.0"
sed "s/^0.0.0.0 //g" > urlhaus.txt
```

The files were generated on **10 July 2020 00:05 UTC** (± 5 minutes) using URLhaus and PhishTank datasets downloaded _around that time_. The test is conducted using a script modified from other tests ([[1]](https://www.andryou.com/2020/05/31/comparing-malware-blocking-dns-resolvers-redux/), [[2]](https://forums.lawrencesystems.com/t/dns-malware-filtering-compared-quad9-vs-cloudflare-vs-dns-filter-vs-opendns-cisco-umbrella/5072)). I ran the test on **10 July 2020 07:00 UTC** (estimated). I tested the following DNS providers:

- [Canadian Shield](https://www.cira.ca/cybersecurity-services/canadian-shield) (149.112.121.20)
- [Cloudflare](https://1.1.1.1/family/) (1.1.1.2)
- [DNSFilter](https://www.dnsfilter.com/) (103.247.36.36)
  * Configured to block Botnet, Cryptomining, Malware, New Domains and Phishing & Deception categories.
- [NextDNS](https://nextdns.io/) (45.90.28.38)
  * Configured to block Newly Registered Domains, in addition default security filtering.
- [OpenDNS](https://www.opendns.com/home-internet-security/) (208.67.222.222)
  * Default security filtering includes Malware/Botnet and Phishing Protections.
- [Quad9](https://quad9.net/) (9.9.9.9)

I use Google DNS (8.8.8.8) to determine _liveness_ of domains, domains that did not return IP address are excluded from the results.

## Malware-blocking test result

DNS Provider | Canadian Shield<br>149.112.121.20 | Cloudflare<br>1.1.1.2 | DNSFilter<br>103.247.36.36 | NextDNS<br>45.90.28.38 | OpenDNS<br>208.67.222.222 | Quad9<br>9.9.9.9
--- | --- | --- | --- | --- | ---
% blocked<br>10 July 2020 | 84.04% | 49.11% | 15.43% | 89.54% | 17.73% | 81.03%
% blocked<br>13 July 2020 | 83.30% | 49.19% | 15.26% | 86.89% | 16.52% | 78.46%

- 10 July 2020: [Script](https://gitlab.com/curben/blog/raw/site/20200711/malware.sh), [CSV](https://gitlab.com/curben/blog/raw/site/20200711/malware.csv.zip) and [Spreadsheet](https://gitlab.com/curben/blog/raw/site/20200711/malware.ods).
  * **564** out of 569 malware domains were live.
- 13 July 2020: [CSV](https://gitlab.com/curben/blog/raw/site/20200711/malware-update.csv.zip) and [Spreadsheet](https://gitlab.com/curben/blog/raw/site/20200711/malware-update.ods).
  * **557** out of 569 malware domains were live.

(Warning: Do not visit any of the links in the CSV and spreadsheet)

## Phishing-blocking test result

DNS Provider | Canadian Shield<br>149.112.121.20 | Cloudflare<br>1.1.1.2 | DNSFilter<br>103.247.36.36 | NextDNS<br>45.90.28.38 | OpenDNS<br>208.67.222.222 | Quad9<br>9.9.9.9
--- | --- | --- | --- | --- | ---
% blocked<br>10 July 2020 | 72.01% | 36.98% | 73.36% | 89.10% | 50.19% | 49.26%
% blocked<br>13 July 2020 | 71.53% | 37.38% | 73.71% | 84.40% | 47.33% | 47.00%

- 10 July 2020: [Script](https://gitlab.com/curben/blog/raw/site/20200711/phishing.sh), [CSV](https://gitlab.com/curben/blog/raw/site/20200711/phishing.csv.zip) and [Spreadsheet](https://gitlab.com/curben/blog/raw/site/20200711/phishing.ods).
  * **6553** out of 7027 phishing domains were live.
- 13 July 2020: [CSV](https://gitlab.com/curben/blog/raw/site/20200711/phishing-update.csv.zip) and [Spreadsheet](https://gitlab.com/curben/blog/raw/site/20200711/phishing-update.ods).
  * **6474** out of 7027 phishing domains were live.

(Warning: Do not visit any of the links in the CSV and spreadsheet)

## Discussion

The results skew towards DNS providers--like NextDNS--that utilise URLhaus and PhishTank. This is what happened when there are only two samples. Quad9 noted that independent test skewed towards it because its network providers also utilise the same data sources (i.e. previous version of DShield) and also admitted that "this type of testing is tricky to do". What makes it tricky is not just because of limited samples, but also the fact that even if a DNS provider use the same dataset(s), it may decide not to use all of the domains in a dataset.

PhishTank is a notable example of this kind of discrepancy. Despite being operated by OpenDNS, the DNS provider only blocked half of the phishing domains. OpenDNS [explains](https://www.phishtank.com/faq.php#whyisasitemarkedbyph) that PhishTank is just one source and it also look at other sources to determine whether a website is really a phish. This means it doesn't 100% trust any of its sources, which also explains why none of the providers tested has 100% score.

Using URLhaus and PhishTank alone cannot possibly determine the effectiveness of malicious-blocking DNS providers accurately. I believe there are many malicious links out there that are not covered in those datasets. While I do think they are high quality and every DNS provider should consider utilising them, they are not _representative_ samples. So, take DNS-filtering testing which has limited sample with a grain of salt.

(Edit 14/07/2020) I was curious if the result is due to the samples being too _fresh_ (7 hours); DNS providers may not update their sources in real-time and perhaps only update once or twice a day. I ran the tests again on 13 July 2020 using the same samples (which I downloaded in 10 July 2020), a 3-day delay. The results show no significant change though.
