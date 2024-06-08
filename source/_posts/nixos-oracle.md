---
title: Install NixOS on Oracle Cloud
excerpt: Two always free bare minimum VM with 20TB bandwidth
date: 2021-03-09
update: 2021-04-05
tags:
- linux
- nixos
- oci
---

> Skip to [first step](#build-a-kexec-tarball)

A few weeks ago, there was an active discussion on [HN](http://news.ycombinator.com/item?id=26239711) about the [Free For Dev](https://free-for.dev/) page which compile a list of free tier (or at least free _trial_) resources that are useful for developers. The page mentioned Oracle Cloud provides two _always free_ VMs ([specification](https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm#ariaid-title2)), whereas big three only offer one VM for a year. While I knew about this offering for a while, but I've always been sceptical about it.

I decided to give it a try after a few comments mentioned the offering is genuine. Besides, I always felt a bit uneasy about my _single_ reverse proxy setup. The sign up process was slightly bumpy because the payment processing page (shop.oracle.com) requires `Referer` header that I blocked using [Privacy Possum](https://github.com/cowlicks/privacypossum); I managed to complete the sign up after disabling the addon on the page.

For cloud image, NixOS only officially supports AWS EC2, so I expected the installation to be manual. I searched Oracle's official documentation and found these two articles ([1](https://blogs.oracle.com/cloud-infrastructure/importing-virtualbox-virtual-machines-into-oracle-cloud-infrastructure), [2](https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/importingcustomimagelinux.htm)). The first article mentioned custom image can be created with VirtualBox, with notable requirements that the disk image is in KVM-compatible VMDK/QCOW format and the bootloader is in BIOS (not UEFI) mode. Long story short, that didn't work. I made sure Qemu guest agent and `virtio` kernel module are installed, but to no avail. Maybe I forgot to set the interface name to `ens3`?

``` nix
  networking.useDHCP = false;
  networking.interfaces.ens3.useDHCP = true;
```

Undeterred by this initial setback, I searched for "nixos oracle cloud" and found this [gist](https://gist.github.com/misuzu/89fb064a2cc09c6a75dc9833bb3995bf). It offered two approaches, the first one is installing Nix package manager on an Ubuntu VM (provisioned using an official image) and _partially_ replace the OS by overwriting the bootloader so it boots NixOS instead. But that didn't work too, so I tried the second one instead, which _worked_. So, let's get started.

Edit (15 Mar 2021): I stumbled upon [NixOS-Infect](https://github.com/elitak/nixos-infect), an installation script similar to the first approach of that gist. The script seems popular and may work better, although no one has tried it on Oracle Cloud yet.

## Build a kexec tarball

The working approach involved building a [kexec](https://en.wikipedia.org/wiki/Kexec) image using Nix/NixOS. If you're not using NixOS, the NixOS' [VirtualBox image](https://nixos.org/download.html#nixos-virtualbox) works too. If you're building inside a VM (of your local workstation, not Oracle Cloud), I recommend provisioning at least two CPUs as the operation is quite intensive.

Create the following *.nix file and _only_ add your SSH key, do not modify other lines (especially `environment.systemPackages`) or it may not boot.

{% codeblock kexec.nix lang:nix https://gist.github.com/misuzu/89fb064a2cc09c6a75dc9833bb3995bf#repartitioning-target-system-from-kexec-image source mark:63 %}
{ config, pkgs, ... }:
{
  imports = [
    # this will work only under qemu, uncomment next line for full image
    # <nixpkgs/nixos/modules/installer/netboot/netboot-minimal.nix>
    <nixpkgs/nixos/modules/installer/netboot/netboot.nix>
    <nixpkgs/nixos/modules/profiles/qemu-guest.nix>
  ];

  # stripped down version of https://github.com/cleverca22/nix-tests/tree/master/kexec
  system.build = rec {
    image = pkgs.runCommand "image" { buildInputs = [ pkgs.nukeReferences ]; } ''
      mkdir $out
      cp ${config.system.build.kernel}/bzImage $out/kernel
      cp ${config.system.build.netbootRamdisk}/initrd $out/initrd
      nuke-refs $out/kernel
    '';
    kexec_script = pkgs.writeTextFile {
      executable = true;
      name = "kexec-nixos";
      text = ''
        #!${pkgs.stdenv.shell}
        set -e
        ${pkgs.kexectools}/bin/kexec -l ${image}/kernel --initrd=${image}/initrd --append="init=${builtins.unsafeDiscardStringContext config.system.build.toplevel}/init ${toString config.boot.kernelParams}"
        sync
        echo "executing kernel, filesystems will be improperly umounted"
        ${pkgs.kexectools}/bin/kexec -e
      '';
    };
    kexec_tarball = pkgs.callPackage <nixpkgs/nixos/lib/make-system-tarball.nix> {
      storeContents = [
        {
          object = config.system.build.kexec_script;
          symlink = "/kexec_nixos";
        }
      ];
      contents = [ ];
    };
  };

  boot.initrd.availableKernelModules = [ "ata_piix" "uhci_hcd" ];
  boot.kernelParams = [
    "panic=30" "boot.panic_on_fail" # reboot the machine upon fatal boot issues
    "console=ttyS0" # enable serial console
    "console=tty1"
  ];
  boot.kernel.sysctl."vm.overcommit_memory" = "1";

  environment.systemPackages = with pkgs; [ cryptsetup ];
  environment.variables.GC_INITIAL_HEAP_SIZE = "1M";

  networking.hostName = "kexec";

  services.mingetty.autologinUser = "root";
  services.openssh = {
    enable = true;
    challengeResponseAuthentication = false;
    passwordAuthentication = false;
  };

  users.users.root.openssh.authorizedKeys.keys = [
    # add your ssh key here
    "ssh-ed25519 ...."
  ];
}
{% endcodeblock %}

Build the image:

```
nix-build '<nixpkgs/nixos>' -A config.system.build.kexec_tarball -I nixos-config=./kexec.nix
```

The build will create `result/tarball/nixos-system-x86_64-linux.tar.xz` compressed kexec tarball. It took around 15 minutes for me. While waiting for the build to complete, let's create an Ubuntu instance.

## Create IAM policy

> Skip this step if you prefer to use admin account

I created a separate user with just enough permission to manage instances, VCN and boot volume backup.

```
Allow group InstanceLaunchers to manage instance-family in compartment ABC
Allow group InstanceLaunchers to read app-catalog-listing in compartment ABC
Allow group InstanceLaunchers to manage volume-family in compartment ABC
Allow group InstanceLaunchers to manage virtual-network-family in compartment ABC
```

## Create a new VCN

> Skip this step if you're not going to use custom SSH port nor Mosh

Prior to launching a new instance, I created a VCN using VCN Wizard with a public and a private subnets. I created a security list (equivalent to NACL in AWS) and a network security group (equivalent to security group in AWS) to allow ingress/incoming custom SSH port and [Mosh](https://mosh.org/) (UDP 60000-61000), detached the default security list from the public subnet and attached the newly created one. I also created a reserved IP.

## Launch an Ubuntu instance

Launch a new instance with the following properties:

- Image: Ubuntu 20.04.1 minimal (any version >= 18.04 is fine)
- Shape: Micro.VM
- VCN: Create new or choose the VCN created in previous section
  - Subnet: Public
  - Network security group: _optional, depends on your VCN_
  - Public IP: none (we'll assign the reserved IP later)
- SSH: Upload/paste your SSH public key here

`iptables` is enabled by default in Oracle-provided image which only allow incoming SSH (TCP 22). If you prefer to use custom SSH port or want to use Mosh, you need to open the ports using cloud-init script (under Advanced Settings).

``` sh
#!/bin/sh

iptables -I INPUT 1 -p tcp --dport 1234 -j ACCEPT
sed -i 's/^#Port 22$/Port 1234/' "/etc/ssh/sshd_config"
systemctl restart ssh

# Optional
apt update
apt install -y mosh
iptables -I INPUT 1 -p udp --dport 60000:61000 -j ACCEPT
```

While the instance is provisioning, navigate to its VNIC and edit its setting (3-dot to the right). Attach the previously reserved IP.

## Upload kexec tarball

Once the kexec is built, upload to the instance.

```
scp result/tarball/nixos-system-x86_64-linux.tar.xz ubuntu@somehost:/tmp/
```

### Upload to Object storage

Alternatively, you could also upload it to the Object Storage and then download it from the instance using Pre-Authenticated Request or Dynamic Groups IAM policy. The image is 300MB and it's more reliable to upload using OCI CLI. OCI CLI splits large file into 100MB chunks (adjustable) for more reliable upload.

Note that multipart upload requires `OBJECT_OVERWRITE` permission which is not included in the [Common Policy](https://docs.oracle.com/en-us/iaas/Content/Identity/Concepts/commonpolicies.htm#ariaid-title25) example. IAM policy below enables multipart upload.

```
Allow group ObjectWriters to read buckets in compartment ABC

Allow group ObjectWriters to manage objects in compartment ABC where all {target.bucket.name='BucketA', any {request.permission='OBJECT_READ', request.permission='OBJECT_CREATE', request.permission='OBJECT_INSPECT', request.permission='OBJECT_OVERWRITE'}}
```

The above permission doesn't include permission to create bucket, I'm assuming the bucket already created beforehand. `PAR_MANAGE` permission is required on both bucket and objects if you want to create pre-authenticated request. Once the policy is in place, upload using OCI CLI:

```
VM_DIR="/home/<username>/result/tarball"
VM_FILE="nixos-system-x86_64-linux.tar.xz"
# Namespace value is available on bucket details
NAMESPACE="xxx"
BUCKET_NAME="BucketA"

oci os object put -ns "${NAMESPACE}" -bn "${BUCKET_NAME}" --file "{VM_DIR}/${VM_FILE}"
```

## Execute kexec iamge

Once the instance has the kexec tarball, uncompress and execute it:

```
cd / && sudo tar xf /tmp/nixos-system-x86_64-linux.tar.xz && sudo /kexec_nixos
# wait until "executing kernel, filesystems will be improperly umounted" message is shown
```

This launches a separate root shell. In your local machine, launch another shell and ssh into the kexec:

```
ssh root@somehost
```

## Installation

This installation is slightly different from the [usual steps](/blog/2020/02/23/caddy-nixos-part-1/#installation).

### Partition

The kexec tarball doesn't include `parted` binary, so you have to make do with `fdisk`.

```
fdisk /dev/sda
Command: g
Created a new GPT disklabel (GUID: xxx).

# 512MB ESP
Command: n
Partition: 1
First sector: <press Enter>
Last sector: +512M

# root partition, leaving 1GB for swap
Command: n
Partition: 2
First sector: <press Enter>
Last sector: -1G

# 1GB swap
Command: n
Partition: 3
First sector: <press Enter>
Last sector: <press Enter>

# Mark first partition as ESP
Command: t
Partition: 1
Type: uefi

# Verify
Command: p
Disk /dev/sda: 46.58 GiB, 50010783744 bytes, 97677312 sectors
Disk model: BlockVolume
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 1048576 bytes
Disklabel type: gpt
Disk identifier: xxx

Device        Start      End  Sectors  Size Type
/dev/sda1      2048  1050623  1048576  512M EFI System
/dev/sda2   1050624 95580159 94529536 45.1G Linux filesystem
/dev/sda3  95580160 97677278  2097119 1024M Linux filesystem

# Write partition table
Command: w
```

### Format partitions

```
# Format first partition as FAT32
mkfs.fat -F 32 -n boot /dev/sda1

# Format second partition as ext4 (can be xfs or btrfs) and label it as 'nixos' (any label is fine)
mkfs.ext4 -L nixos /dev/sda2

# Swap partition
mkswap -L swap /dev/sda3
```

### Mount partitions

```
mkdir -p /mnt
mount /dev/disk/by-label/nixos /mnt
mkdir -p /mnt/boot
mount /dev/disk/by-label/boot /mnt/boot
swapon /dev/sda3
```

### Configure and install

kexec doesn't include a Nix channel (unlike the ISO), so you need to add it.

```
# Use newer channel if available
nix-channel --add https://nixos.org/channels/nixos-20.09 nixpkgs
nix-channel --update

nixos-generate-config --root /mnt
# set hostname, add users and ssh-keys, enable openssh/mosh
nano /mnt/etc/nixos/configuration.nix
nixos-install --no-root-passwd

shutdown -r now
```

### Launch a redundant instance

Since Oracle offers two VMs, might as well take it. The second instance can be in the same VCN and subnet, but I put it in another VCN for network isolation (or just because I _can_). I also created another reserved IP for the second instance.

Launching a second redundant instance is easy:

1. Create a boot volume backup of the first instance
2. Create a new boot volume from the backup
    * (Update 5 April 2021): Boot volume created from backup somehow is not free, it charges [*performance units*](https://www.oracle.com/cloud/price-list.html#storage); you may be able to avoid this cost by cloning the boot volume instead. Alternatively, you can always create the volume from scratch.
3. Launch a new instance using the second boot volume
4. Attach reserved IP to the instance

> It's recommended to launch instances in a separate fault domains to isolate server rack failure.

Add the second instance's IP to your DNS record, you now have [round-robin DNS](https://en.wikipedia.org/wiki/Round-robin_DNS) redundancy.

## Conclusion

The overall process was similar to mounting an ISO on a cloud instance and install from there, which I did in my previous VPS host. Although I would've preferred using the _official_ method of importing a KVM image, but that involves uploading 2GB disk image. The kexec tarball approach only requires uploading a 300MB file. Maybe I'll try creating a [QCOW image](https://github.com/nix-community/nixos-generators/blob/master/formats/qcow.nix) next time.

Summary of Oracle Cloud always free resource:

Pros:

- 2 VMs
- 20TB egress
- 50GB volume/instance

Limitations:

- 50Mbps Internet
- One region (though you can choose any region during sign up)
