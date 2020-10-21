---
title: Using BusyBox httpd in AWS EC2 for testing
excerpt: An alternative to Apache. No installation required.
date: 2020-10-21
tags:
- linux
- aws
- busybox
---

As part of my practice for AWS [Solutions Architect](https://aws.amazon.com/certification/certified-solutions-architect-associate/) certification, I needed to run a test web server to test security group (a virtual firewall attached to an instance, specifically its network interface), NACL (network access control list, a subnet-level cloud firewall) and Route 53 DNS failover. Most (all?) study guides suggest installing and running an Apache web server, the most popular web server (it's the 'A' of an LAMP stack).

> This article assumes Ubuntu Linux AMI is used

## BusyBox httpd

It's little known that there is already a web server included in most Linux distributions, the ubiquitous BusyBox has a tiny and simple `httpd` web server. It doesn't support TLS and PHP (you _could_ run PHP via [CGI](https://www.php.net/manual/en/install.unix.commandline.php), which httpd [supports](https://openwrt.org/docs/guide-user/services/webserver/http.httpd#cgi), but it's not recommended). Since I only needed a static "index.html", httpd fits the bill. Not all Busybox installation includes httpd, for example {% post_link binaries-alpine-docker 'Alpine' %} doesn't have one, you need to install [busybox-extras](https://pkgs.alpinelinux.org/package/edge/main/x86_64/busybox-extras) package to get it.

By default, a normal user cannot starts a web server that binds to port 1 - 1023 without root privilege in Linux. A common solution is to grant `CAP_NET_BIND_SERVICE` capability to the web server's binary (BusyBox in this case). Alternatively, you could _start_ it using root and then _run_ it as an unprivileged user:

```
$ sudo busybox httpd -p 80 -u 33:33
```

Ubuntu includes a `www-data` user that has minimal privilege, "33" is its uid/gid:

```
$ cat /etc/passwd | grep www-data
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
```

Notice `www-data` has its shell disabled via `/usr/sbin/nologin`. We can verify that `httpd` is listening on port 80 using `www-data`:

```
$ sudo lsof -i -P -n | grep busybox
busybox   85600        www-data    3u  IPv4 527284      0t0  TCP *:80 (LISTEN)
```

But we still can't escape the fact that `httpd` was started using root:

```
$ ps aux | grep httpd
root       85808  0.0  0.0  12020  4792 pts/0    S+   13:58   0:00 sudo busybox httpd -f -p 80 -u 33:33
www-data   85809  0.0  0.0   2420     4 pts/0    S+   13:58   0:00 busybox httpd -f -p 80 -u 33:33
```

I guess the workaround is fine for a temporary test server, you shouldn't do this in production; well, you wouldn't use `httpd` in production anyway.

### Example usage

1. Create an `index.html`:

```
$ echo '<html>test server</html>' > index.html
```

2. Starts `httpd`:

```
$ sudo busybox httpd -p 80 -u 33:33
```

3. From your local workstation, verify the server is responding:

```
$ curl -L http://x.x.x.x
<html>test test</html>
```

_Obviously you should already have a rule in the relevant security group to allow inbound port 80._

## Run SSH in an alternative port

SSH uses port 22 by default, if you prefer strangers not to knock on that door (figuratively speaking, not to be confused with [port knocking](https://en.wikipedia.org/wiki/Port_knocking)), you can change to another port using a [user data](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html) script.

First, create a shell script (in your local workstation):

``` sh script.sh
#!/bin/sh

# Change port 1234 to desired port
sed -i 's/^#Port 22$/Port 1234/' "/etc/ssh/sshd_config"
systemctl restart ssh
```

Then, specify the script as a `--user-data` when you create an EC2 instance using AWS CLI:

{% codeblock mark:6 %}
aws ec2 run-instances --count 1 --profile ec2 \
--image-id ami-xxxx \
--instance-type t2.micro --key-name test-key \
--security-group-ids sg-xxxx --subnet-id subnet-xxxx \
--associate-public-ip-address \
--user-data file:///home/location/to/script.sh \
--tag-specifications \
'ResourceType=instance,Tags=[{Key=Name,Value=test-ec2}]'
{% endcodeblock %}

The file should be specified with `file://` prefix, if the script is located at "/home/example/script.sh", it should be `file:///home/example/script.sh`.

Refer to "[Ubuntu Cloud Image Finder](https://cloud-images.ubuntu.com/locator/)" for the latest Ubuntu AMIs in your AWS region.

### Terminate EC2 instance using a tag

Notice I tag/name the instance as "test-ec2", this helps me to easily terminate it without manual input of instance id:

{% codeblock mark:4 %}
aws ec2 terminate-instances --profile ec2 \
--instance-ids $(aws ec2 describe-instances --profile ec2 \
--query 'Reservations[].Instances[].InstanceId' --filters 'Name=tag:Name,Values=test-ec2' \
--output text)
{% endcodeblock %}

### SSH config

Instead of,

```
$ ssh -i /path/to/private_key.pem ubuntu@x.x.x.x
```

you could use an SSH config.

1. Move the private key to ".ssh" of your home folder:

```
$ mkdir -p ~/.ssh
$ cp /path/to/private_key.pem ~/.ssh/
```

2. SSH is fussy about the folder/file permission:

```
$ chmod 0700 ~/.ssh/
$ chmod 600 ~/.ssh/private_key.pem
```

3. Create SSH config:

``` plain ~/.ssh/config
Host server1
  HostName x.x.x.x
  User ubuntu
  Port 1234
  IdentityFile /home/example/.ssh/private_key.pem
```

The username differs depending on the AMI that you use, refer to the AWS [documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/managing-users.html).

To find out your instance's public IP using its tag (e.g. "test-ec2"):

``` plain
$ aws ec2 describe-instances --profile ec2 \
--query 'Reservations[*].Instances[*].PublicIpAddress' --filters 'Name=tag:Name,Values=test-ec2' \
--output text
```

4. To SSH into your EC2 instance:

```
$ ssh server1
```

## kitty compatibility

If you use [kitty](https://sw.kovidgoyal.net/kitty/index.html) terminal to ssh into your Linux instance, you may find the backspace doesn't work. That is because kitty uses different terminfo.

``` plain server
$ echo $TERM
xterm-256color
```

``` plain local
$ echo $TERM
xterm-kitty
```

You can view the xterm-kitty by:

```
$ infocmp xterm-kitty
```

There are two ways to fix this.

### Send kitty terminfo

This seems like a common issue and the fix is mentioned in kitty's [FAQ](https://sw.kovidgoyal.net/kitty/faq.html#i-get-errors-about-the-terminal-being-unknown-or-opening-the-terminal-failing-when-sshing-into-a-different-computer). In this approach, kitty can upload and install its terminfo when you ssh into your server:

```
$ kitty +kitten ssh server1
```

### Install terminfo using user data

Alternatively, you could also install it using user data:

``` sh script.sh
#!/bin/sh

# kitty terminfo
echo "#	Reconstructed via infocmp from file: /usr/share/terminfo/x/xterm-kitty
xterm-kitty|KovIdTTY,
	am, ccc, hs, km, mc5i, mir, msgr, npc, xenl,
	colors#0x100, cols#80, it#8, lines#24, pairs#0x7fff,
	acsc=++\,\,--..00``aaffgghhiijjkkllmmnnooppqqrrssttuuvvwwxxyyzz{{||}}~~,
	bel=^G, bold=\E[1m, cbt=\E[Z, civis=\E[?25l,
	clear=\E[H\E[2J, cnorm=\E[?12l\E[?25h, cr=\r,
	csr=\E[%i%p1%d;%p2%dr, cub=\E[%p1%dD, cub1=^H,
	cud=\E[%p1%dB, cud1=\n, cuf=\E[%p1%dC, cuf1=\E[C,
	cup=\E[%i%p1%d;%p2%dH, cuu=\E[%p1%dA, cuu1=\E[A,
	cvvis=\E[?12;25h, dch=\E[%p1%dP, dch1=\E[P, dim=\E[2m,
	dl=\E[%p1%dM, dl1=\E[M, dsl=\E]2;\007, ech=\E[%p1%dX,
	ed=\E[J, el=\E[K, el1=\E[1K, flash=\E[?5h$<100/>\E[?5l,
	fsl=^G, home=\E[H, hpa=\E[%i%p1%dG, ht=^I, hts=\EH,
	ich=\E[%p1%d@, il=\E[%p1%dL, il1=\E[L, ind=\n,
	indn=\E[%p1%dS,
	initc=\E]4;%p1%d;rgb\:%p2%{255}%*%{1000}%/%2.2X/%p3%{255}%*%{1000}%/%2.2X/%p4%{255}%*%{1000}%/%2.2X\E\\,
	kDC=\E[3;2~, kEND=\E[1;2F, kHOM=\E[1;2H, kIC=\E[2;2~,
	kLFT=\E[1;2D, kNXT=\E[6;2~, kPRV=\E[5;2~, kRIT=\E[1;2C,
	ka1=, ka3=, kbs=^?, kc1=, kc3=, kcbt=\E[Z, kcub1=\EOD,
	kcud1=\EOB, kcuf1=\EOC, kcuu1=\EOA, kdch1=\E[3~, kend=\EOF,
	kf1=\EOP, kf10=\E[21~, kf11=\E[23~, kf12=\E[24~,
	kf13=\E[1;2P, kf14=\E[1;2Q, kf15=\E[1;2R, kf16=\E[1;2S,
	kf17=\E[15;2~, kf18=\E[17;2~, kf19=\E[18;2~, kf2=\EOQ,
	kf20=\E[19;2~, kf21=\E[20;2~, kf22=\E[21;2~,
	kf23=\E[23;2~, kf24=\E[24;2~, kf25=\E[1;5P, kf26=\E[1;5Q,
	kf27=\E[1;5R, kf28=\E[1;5S, kf29=\E[15;5~, kf3=\EOR,
	kf30=\E[17;5~, kf31=\E[18;5~, kf32=\E[19;5~,
	kf33=\E[20;5~, kf34=\E[21;5~, kf35=\E[23;5~,
	kf36=\E[24;5~, kf37=\E[1;6P, kf38=\E[1;6Q, kf39=\E[1;6R,
	kf4=\EOS, kf40=\E[1;6S, kf41=\E[15;6~, kf42=\E[17;6~,
	kf43=\E[18;6~, kf44=\E[19;6~, kf45=\E[20;6~,
	kf46=\E[21;6~, kf47=\E[23;6~, kf48=\E[24;6~,
	kf49=\E[1;3P, kf5=\E[15~, kf50=\E[1;3Q, kf51=\E[1;3R,
	kf52=\E[1;3S, kf53=\E[15;3~, kf54=\E[17;3~,
	kf55=\E[18;3~, kf56=\E[19;3~, kf57=\E[20;3~,
	kf58=\E[21;3~, kf59=\E[23;3~, kf6=\E[17~, kf60=\E[24;3~,
	kf61=\E[1;4P, kf62=\E[1;4Q, kf63=\E[1;4R, kf7=\E[18~,
	kf8=\E[19~, kf9=\E[20~, khlp=, khome=\EOH, kich1=\E[2~,
	kind=\E[1;2B, kmous=\E[M, knp=\E[6~, kpp=\E[5~,
	kri=\E[1;2A, kund=, oc=\E]104\007, op=\E[39;49m, rc=\E8,
	rev=\E[7m, ri=\EM, rin=\E[%p1%dT, ritm=\E[23m, rmacs=\E(B,
	rmam=\E[?7l, rmcup=\E[?1049l, rmir=\E[4l, rmkx=\E[?1l,
	rmso=\E[27m, rmul=\E[24m, rs1=\E]\E\\\Ec, sc=\E7,
	setab=\E[%?%p1%{8}%<%t4%p1%d%e%p1%{16}%<%t10%p1%{8}%-%d%e48;5;%p1%d%;m,
	setaf=\E[%?%p1%{8}%<%t3%p1%d%e%p1%{16}%<%t9%p1%{8}%-%d%e38;5;%p1%d%;m,
	sgr=%?%p9%t\E(0%e\E(B%;\E[0%?%p6%t;1%;%?%p2%t;4%;%?%p1%p3%|%t;7%;%?%p4%t;5%;%?%p7%t;8%;m,
	sgr0=\E(B\E[m, sitm=\E[3m, smacs=\E(0, smam=\E[?7h,
	smcup=\E[?1049h, smir=\E[4h, smkx=\E[?1h, smso=\E[7m,
	smul=\E[4m, tbc=\E[3g, tsl=\E]2;, vpa=\E[%i%p1%dd," | \
tic -x -o "/home/ubuntu/.terminfo/" "-"

printf "\n#kitty terminfo\nexport TERM=\"xterm-kitty\"\n" >> "/home/ubuntu/.profile"
```

_Change the home folder name according to the Linux distribution that you use_
