---
title: Parsing NGINX log in Splunk
excerpt: Configure regex in field extractor to create relevant fields
date: 2021-12-25
tags:
- splunk
- nginx
---

For web server's access log, Splunk has built-in support for Apache only. Splunk has a feature called field extractor. It is powered by delimiter and regex, and enables user to add new [_fields_](https://docs.splunk.com/Documentation/Splunk/8.2.3/Knowledge/Aboutfields) to be used in a search query. This post will only covers the regex patterns to parse nginx log, for instruction on field extractor, I recommend perusing the [official documentation](https://docs.splunk.com/Documentation/Splunk/8.2.3/Knowledge/ExtractfieldsinteractivelywithIFX).

To illustrate, say we have a log format like this:

```
{id} "{http.request.host}" "{http.request.header.user-agent}"
```

An example log is:

```
123 "example.com" "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0"
```

While you could search for a specific keyword, e.g. attempts of {% post_link log4shell-log4j-unbound-dns 'Log4shell exploit' %}, since there are no fields, you cannot run any statistics like [`table`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Table) or [`stats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/stats) on the search results.

Splunk is able to understand Apache log format because its field extractor already includes the necessary regex patterns to parse the relevant fields of each line in a log. Choosing a source type is equivalent of choosing a log format. If a format is not listed in [the default list](https://docs.splunk.com/Documentation/Splunk/8.2.3/Data/Listofpretrainedsourcetypes), we can either use an add-on or create new fields using field extractor. There is a Splunk [add-on](https://docs.splunk.com/Documentation/AddOns/latest/NGINX) for nginx and I suggest to try it before resorting to field extractor.

I create five patterns which cover most of the nginx events I encountered during my work. Refer to the documentation for [supported syntax](https://docs.splunk.com/Documentation/Splunk/8.2.3/Knowledge/AboutSplunkregularexpressions).

A field is extracted through "capturing group".

```
(?<field_name>capture pattern)
```

For example, `(?<month>\w+)` searches for one or more (`+`) alphanumeric characters (`\w`) and names the field as `month`. I opted for lazier matching, mostly using unbounded quantifier `+` instead of a stricter range of occurrences `{M,N}` despite knowing the exact pattern of a field. I found some fields may stray off slightly from the expected pattern, so a lazier matching tends match more events without matching unwanted's.

## Web request

### Regex

```
(?<month>\w+)\s+(?<day>\d+)\s(?<time>[\d\:]+)\s(?<proxy_ip>[\d\.]+)(?:\snginx\:\s)(?<remote_ip>[\d\.]+)(?:\s\d+\s\S+\s\S+\s)\[(?<time_local>\S+)\s(?<timezone>\+\d{4})\]\s"(?<http_method>\w+)\s(?<http_path>.+)\s(?<http_version>HTTP/\d\.\d)"\s(?<http_status>\d{3})\s(?:\d+)\s"(?<request_url>.[^"]*)"\s"(?<http_user_agent>.[^"]*)"\s(?<server_ip>[\d\.]+)\:(?<server_port>\d+)(?:\s\d+\s\d+\s)(?<ssl_version>\S+)\s(?<ssl_cipher>\S+)\s(?<http_cookie>\S+)
```

### Event

```
Dec 24 01:23:45 192.168.0.2 nginx: 1.2.3.4 55763 - - [24/Dec/2021:01:23:45 +0000] "GET /page.html HTTP/2.0" 200 494 "https://www.example.com" "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0" 192.168.1.2:8080 123 4 TLSv1.2 ECDHE-RSA-AES128-GCM-SHA256 abcdef .
```

### Fields

Field | Value | Regex | Explanation
--- | --- | --- | ---
month | Dec | `(?<month>\w+)` | One or more alphanumeric
day | 24 | `(?<day>\d+)` | One or more digit
time | 01:23:45 | `(?<time>[\d\:]+)` | One or more digit or semicolon
proxy_ip | 192.168.0.2 | `(?<proxy_ip>[\d\.]+)` | One or more digit or dot
remote_ip | 1.2.3.4 | `(?<remote_ip>[\d\.]+)` |
time_local | 24/Dec/2021:01:23:45 | `(?<time_local>\S+)` | One or more non-whitespace characters
timezone | +0000 | `(?<timezone>[\+\-]\d{4})` | Four digits with plus or minus prefix
http_method | GET | `(?<http_method>\w+)` |
http_path | /page.html | `(?<http_path>.+)` | One or more of any character
http_version | HTTP/2.0 | `(?<http_version>HTTP/\d\.\d)` | "HTTP", a digit, dot and digit
http_status | 200 | `(?<http_status>\d{3})` | Three digits
request_url | https://www.example.com | `(?<request_url>.[^"]*)` | Zero or more of any character except double quote
http_user_agent | Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0 | `(?<http_user_agent>.[^"]*)` |
server_ip | 192.168.1.2 | `(?<server_ip>[\d\.]+)` |
server_port | 8080 | `(?<server_port>\d+)` |
ssl_version | TLSv1.2 | `(?<ssl_version>\S+)` |
ssl_cipher | ECDHE-RSA-AES128-GCM-SHA256 | `(?<ssl_cipher>\S+)` |
http_cookie | abcdef | `(?<http_cookie>\S+)` |

nginx is configured as a reverse proxy, `proxy_ip` is its ip whereas `server_ip` is the upstream's.

## Proxy request

### Regex

```
(?<month>\w+)\s+(?<day>\d+)\s(?<time>[\d\:]+)\s(?<proxy_ip>[\d\.]+)(?:\snginx\:\s)(?<year>\d{4})\/(?<nmonth>\d{2})(?:\/\d{2}\s[\d\:]+\s)\[(?<log_level>\w+)\](?:\s\d+#\d+\:\s\*\d+\sclient\s)(?<remote_ip>[\d\.]+)\:(?<remote_port>\d+)(?:\sconnected\sto\s)(?<server_ip>[\d\.]+)\:(?<server_port>\d+)
```

### Event

```
Dec 24 01:23:45 192.168.0.2 nginx: 2021/12/24 01:23:45 [info] 1776#1776:*114333142 client 1.2.3.4:19802 connected to 192.168.1.2:8080
```

### Fields

Field | Value | Regex | Explanation
--- | --- | --- | ---
month | Dec | `(?<month>\w+)` |
day | 24 | `(?<day>\d+)` |
time | 01:23:45 | `(?<time>[\d\:]+)` |
proxy_ip | 192.168.0.2 | `(?<proxy_ip>[\d\.]+)` |
year | 2021 | `(?<year>\d{4})` |
nmonth | 12 | `(?<nmonth>\d{2})` |
log_level | info | `(?<log_level>\w+)` |
remote_ip | 1.2.3.4 | `(?<remote_ip>[\d\.]+)` |
remote_port | 19802 | `(?<remote_port>\d+)` |
server_ip | 192.168.1.2 | `(?<server_ip>[\d\.]+)` |
server_port | 8080 | `(?<server_port>\d+)` |

## Upstream error response

### Regex

```
(?<month>\w+)\s+(?<day>\d+)\s(?<time>[\d\:]+)\s(?<proxy_ip>[\d\.]+)(?:\snginx\:\s)(?<year>\d{4})\/(?<nmonth>\d{2})(?:\/\d{2}\s[\d\:]+\s)\[(?<log_level>\w+)\](?:\s\d+#\d+\:\s\*\d+\s)(?<upstream_error>.[^,]*)(?:,\sclient\:\s)(?<remote_ip>[\d\.]+)(?:,\sserver\:\s)(?<server_host>.[^,]*)(?:,\srequest\:\s")(?<http_method>\w+)\s(?<http_path>\S+)\s(?<http_version>HTTP/\d\.\d)(?:",\supstream\:\s")(?<upstream_url>.[^"]*)",\shost\:\s"(?<upstream_host>.[^"]*)
```

### Event

```
Dec 24 01:23:45 192.168.0.2 nginx: 2021/12/24 01:23:45 [error] 1776#1776:*71197740 upstream timed out (110: Connection timed out) while reading response header from upstream, client: 1.2.3.4, server: example.com, request: "POST /api/path HTTP/2.0",upstream: "http://192.168.1.2:8080/api/path", host:"example.com"
```

### Fields

Field | Value | Regex | Explanation
--- | --- | --- | ---
month | Dec | `(?<month>\w+)` |
day | 24 | `(?<day>\d+)` |
time | 01:23:45 | `(?<time>[\d\:]+)` |
proxy_ip | 192.168.0.2 | `(?<remote_ip>[\d\.]+)` |
year | 2021 | `(?<year>\d{4})` |
nmonth | 12 | `(?<nmonth>\d{2})` |
log_level | error | `(?<log_level>\w+)` |
upstream_error | upstream timed out (110: Connection timed out) while reading response header from upstream | `(?<upstream_error>.[^,]*)` | Zero or more of any character except comma
remote_ip | 1.2.3.4 | `(?<remote_ip>[\d\.]+)` |
server_host | example.com | `(?<server_host>.[^,]*)` |
http_method | POST | `(?<http_method>\w+)` |
http_path | /api/path | `(?<http_path>\S+)` |
http_version | HTTP/2.0 | `(?<http_version>HTTP/\d\.\d)` |
upstream_url | http://192.168.1.2:8080/api/path | `(?<upstream_url>.[^"]*)` |
upstream_host | example.com | `(?<upstream_host>.[^"]*)` |

## Upstream epoll error

### Regex

```
(?<month>\w+)\s+(?<day>\d+)\s(?<time>[\d\:]+)\s(?<proxy_ip>[\d\.]+)(?:\snginx\:\s)(?<year>\d{4})\/(?<nmonth>\d{2})(?:\/\d{2}\s[\d\:]+\s)\[(?<log_level>\w+)\](?:\s\d+#\d+\:\s\*\d+\s)(?<upstream_error>[^,]*,[^,]*)(?:,\sclient\:\s)(?<remote_ip>[\d\.]+)(?:,\sserver\:\s)(?<server_host>.[^,]*)(?:,\srequest\:\s")(?<http_method>\w+)\s(?<http_path>\S+)\s(?<http_version>HTTP/\d\.\d)(?:",\supstream\:\s")(?<upstream_url>.[^"]*)(?:",\shost\:\s")(?<upstream_host>.[^"]*)
```

### Event

```
Dec 24 01:23:45 192.168.0.2 nginx: 2021/12/24 01:23:45 [info] 13199#13199: *81574833 epoll_wait() reported that client prematurely closed connection, so upstream connection is closed too while connecting to upstream, client: 1.2.3.4, server: example.com, request: "GET /page.html HTTP/1.1", upstream:"http://192.168.1.2/page.html", host: "example.com"
```

### Fields

Field | Value | Regex | Explanation
--- | --- | --- | ---
month | Dec | `(?<month>\w+)` |
day | 24 | `(?<day>\d+)` |
time | 01:23:45 | `(?<time>[\d\:]+)` |
proxy_ip | 192.168.0.2 | `(?<remote_ip>[\d\.]+)` |
year | 2021 | `(?<year>\d{4})` |
nmonth | 12 | `(?<nmonth>\d{2})` |
log_level | info | `(?<log_level>\w+)` |
upstream_error | epoll_wait() reported that client prematurely closed connection, so upstream connection is closed too while connecting to upstream | `(?<upstream_error>.[^,]*)` |
remote_ip | 1.2.3.4 | `(?<remote_ip>[\d\.]+)` |
server_host | example.com | `(?<server_host>.[^,]*)` |
http_method | GET | `(?<http_method>\w+)` |
http_path | /page.html | `(?<http_path>\S+)` |
http_version | HTTP/1.1 | `(?<http_version>HTTP/\d\.\d)` |
upstream_url | http://192.168.1.2/page.html | `(?<upstream_url>.[^"]*)` |
upstream_host | example.com | `(?<upstream_host>.[^"]*)` |

## Upstream epoll error with referrer

### Regex

```
(?<month>\w+)\s+(?<day>\d+)\s(?<time>[\d\:]+)\s(?<proxy_ip>[\d\.]+)(?:\snginx\:\s)(?<year>\d{4})\/(?<nmonth>\d{2})(?:\/\d{2}\s[\d\:]+\s)\[(?<log_level>\w+)\](?:\s\d+#\d+\:\s\*\d+\s)(?<upstream_error>[^,]*,[^,]*)(?:,\sclient\:\s)(?<remote_ip>[\d\.]+)(?:,\sserver\:\s)(?<server_host>.[^,]*)(?:,\srequest\:\s")(?<http_method>\w+)\s(?<http_path>\S+)\s(?<http_version>HTTP/\d\.\d)(?:",\supstream\:\s")(?<upstream_url>.[^"]*)(?:",\shost\:\s")(?<upstream_host>.[^"]*)(?:",\sreferrer\:\s")(?<referrer>.[^"]*)
```

### Event

```
Dec 24 01:23:45 192.168.0.2 nginx: 2021/12/24 01:23:45 [info] 1776#1776:*71220252 epoll_wait() reported that client prematurely closed connection, so upstream connection is closed too while sending request to upstream, client: 1.2.3.4, server: example.com, request: "GET /page.html HTTP/1.1", upstream: "http://192.168.1.2:8080/page.html", host: "example.com", referrer: "https://example.com"
```

### Fields

Field | Value | Regex | Explanation
--- | --- | --- | ---
month | Dec | `(?<month>\w+)` |
day | 24 | `(?<day>\d+)` |
time | 01:23:45 | `(?<time>[\d\:]+)` |
proxy_ip | 192.168.0.2 | `(?<remote_ip>[\d\.]+)` |
year | 2021 | `(?<year>\d{4})` |
nmonth | 12 | `(?<nmonth>\d{2})` |
log_level | info | `(?<log_level>\w+)` |
upstream_error | epoll_wait() reported that client prematurely closed connection, so upstream connection is closed too while sending request to upstream | `(?<upstream_error>.[^,]*)` |
remote_ip | 1.2.3.4 | `(?<remote_ip>[\d\.]+)` |
server_host | example.com | `(?<server_host>.[^,]*)` |
http_method | GET | `(?<http_method>\w+)` |
http_path | /page.html | `(?<http_path>\S+)` |
http_version | HTTP/1.1 | `(?<http_version>HTTP/\d\.\d)` |
upstream_url | http://192.168.1.2:8080/page.html | `(?<upstream_url>.[^"]*)` |
upstream_host | example.com | `(?<upstream_host>.[^"]*)` |
referrer | https://example.com | `(?<referrer>.[^"]*)` |
