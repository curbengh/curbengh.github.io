#!/bin/bash
# Bulk DNS Lookup
# Generates a CSV of DNS lookups from a list of domains.
# https://www.andryou.com/2020/05/31/comparing-malware-blocking-dns-resolvers-redux/
# https://forums.lawrencesystems.com/t/dns-malware-filtering-compared-quad9-vs-cloudflare-vs-dns-filter-vs-opendns-cisco-umbrella/5072

domain_list='phishing.txt' # One FQDN per line in file.

# IP address of the nameserver used for lookups:
ns1_ip='8.8.8.8' # Google
ns2_ip='9.9.9.9' # Quad9
ns3_ip='1.1.1.2' # Cloudflare Malware
ns4_ip='149.112.121.20' # Canadian Shield
ns5_ip='208.67.222.222' # OpenDNS / Cisco Umbrella
ns6_ip='103.247.36.36' # DNS Filter
ns7_ip='45.90.28.38' # NextDNS

echo "Domain name, $ns1_ip,$ns2_ip,$ns3_ip,$ns4_ip,$ns5_ip,$ns6_ip,$ns7_ip "; # Start CSV - output to terminal
echo "Domain name, $ns1_ip,$ns2_ip,$ns3_ip,$ns4_ip,$ns5_ip,$ns6_ip,$ns7_ip " > "phishing.csv"; # Start CSV - output to .csv file
for domain in `sed '/^[[:blank:]]*#/d;s/#.*//' $domain_list` # Start looping through domains, ignoring comments
do
  ip1=`dig @$ns1_ip +noadflag +noedns +short $domain |tail -n1`; # IP address lookup DNS Server1
  if [ -n "$ip1" ] && [ "$ip1" != "0.0.0.0" ] && [ "$ip1" != "127.0.0.1" ]; then # Only run additional lookups if domain is returning a valid IP address
    ip2=`dig @$ns2_ip +noadflag +noedns +short $domain |tail -n1`; # IP address lookup DNS server2
    ip3=`dig @$ns3_ip +noadflag +noedns +short $domain |tail -n1`; # IP address lookup DNS server3
    ip4=`dig @$ns4_ip +noadflag +noedns +short $domain |tail -n1`; # IP address lookup DNS server4
    ip5=`dig @$ns5_ip +noadflag +noedns +short $domain |tail -n1`; # IP address lookup DNS server5
    ip6=`dig @$ns6_ip +noadflag +noedns +short $domain |tail -n1`; # IP address lookup DNS server6
    ip7=`dig @$ns7_ip +noadflag +noedns +short $domain |tail -n1`; # IP address lookup DNS server7
    ### Blank out any localhost IP addresses
    if [ "$ip2" = "127.0.0.1" ] ||  [ "$ip2" = "0.0.0.0" ]; then
      ip2=""
    fi
    if [ "$ip3" = "127.0.0.1" ] ||  [ "$ip3" = "0.0.0.0" ]; then
      ip3=""
    fi
    if [ "$ip4" = "127.0.0.1" ] ||  [ "$ip4" = "0.0.0.0" ]; then
      ip4=""
    fi
    if [ "$ip5" = "127.0.0.1" ] ||  [ "$ip5" = "0.0.0.0" ]; then
      ip5=""
    fi
    if [ "$ip6" = "127.0.0.1" ] ||  [ "$ip6" = "0.0.0.0" ]; then
      ip6=""
    fi
    if [ "$ip7" = "127.0.0.1" ] ||  [ "$ip7" = "0.0.0.0" ]; then
      ip7=""
    fi
    ### Blank out any block pages
    ## Canadian Shield - https://github.com/CIRALabs/canadianshield_helperscripts/blob/master/check_digs/check_digs.sh#L38
    if [ "$ip4" = "75.2.78.236" ] || [ "$ip4" = "99.83.179.4" ] || [ "$ip4" = "99.83.178.7" ] || [ "$ip4" = "75.2.110.227" ]; then
      ip4=""
      echo "### CAN SHIELD BLOCKED"
    fi
    ## Cisco Umbrella - https://support.opendns.com/hc/en-us/articles/227986927-What-are-the-Cisco-Umbrella-Block-Page-IP-Addresses-
    if [ "$ip5" = "146.112.61.104" ] || [ "$ip5" = "146.112.61.105" ] || [ "$ip5" = "146.112.61.106" ] || [ "$ip5" = "146.112.61.107" ] || [ "$ip5" = "146.112.61.108" ] || [ "$ip5" = "146.112.61.109" ] || [ "$ip5" = "146.112.61.110" ]; then
      ip5=""
      echo "### CISCO UMBRELLA BLOCKED"
    fi
    ## DNSFilter
    if [ "$ip6" = "198.251.90.71" ]; then
      ip6=""
      echo "### DNSFILTER BLOCKED"
    fi
    echo -en "$domain,$ip1,$ip2,$ip3,$ip4,$ip5,$ip6,$ip7\n"; # Output to terminal
    echo -en "$domain,$ip1,$ip2,$ip3,$ip4,$ip5,$ip6,$ip7\n" >> "phishing.csv"; # Append to .csv file
  fi
done;
