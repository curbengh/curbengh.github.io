---
title: Enable LUKS2 and Argon2 support for Grub in Manjaro/Arch
excerpt: Convert LUKS1 to LUKS2
date: 2022-11-27
tags:
  - linux
  - manjaro
  - arch
  - luks
---

I recently refreshed my Manjaro installation using the official ISO. My last installation used Manjaro Architect, which is my preferred method. Unfortunately, it was removed from all official ISOs due to lack of maintainer. I tried installing it in Live USB but it couldn't install some base packages due to keyring issue, same issue with the [nightly ISO](https://github.com/manjaro-architect/download/releases). As such, I had to use the GUI installer instead.

I ticked "Encrypt system" and Manjaro created two partitions in my NVMe drive.

| Partition      | Filesystem | Mount       | Encrypted |
| -------------- | ---------- | ----------- | --------- |
| /dev/nvme0n1p1 | FAT32      | `/boot/efi` | No        |
| /dev/nvme0n1p2 | Btrfs      | `/`         | LUKS1     |

The implication of the above layout is that `/boot` (where the kernel resides) is encrypted, except for `/boot/efi` (Grub resides here)—p1 is not encrypted, p2 is LUKS-encrypted. So, Grub has to unlock the LUKS partition first (using password), before the rest of `/` can be unlocked (using keyfile). Keyfile is used in this layout so that password is not [prompted twice](https://leo3418.github.io/collections/gentoo-config-luks2-grub-systemd/auto-unlock.html).

There are two disadvantages of using Grub to unlock LUKS:

1. Slow unlocking due to lack of cryptography acceleration
2. Limited LUKS2 support, i.e. Argon2 is not supported

Fortunately, there is an AUR package [grub-improved-luks2-git](https://aur.archlinux.org/packages/grub-improved-luks2-git) that has been patched for Argon2 support. I will also show how to tune Argon2 parameters for faster unlock (while sacrificing security).

## Prerequisite

- Manjaro/Arch live USB/CD, for offline (unmounted) LUKS1 to LUKS2 keyslot conversion
  - Keyslot technically can be updated in mounted partition since it is only used to unlock the encryption key, once unlocked, subsequent data encryption/decryption uses only the encryption key.
  - I just feel uneasy doing this while the partition has active I/O, so I opt for live USB instead.

## grub-improved-luks2-git

Use your favourite AUR helper to install [grub-improved-luks2-git](https://aur.archlinux.org/packages/grub-improved-luks2-git). This will take a while to compile patched Grub.

```
yay -S grub-improved-luks2-git
```

There should be a confirmation to remove `grub` to avoid package conflict.

## Live USB

Reboot into live USB. Identify the location of encrypted location using GParted. The partition filesystem should be "[Encrypted] btrfs". In my case, it is `/dev/nvme0n1p2`.

## LUKS1 to LUKS2 conversion

```
sudo cryptsetup convert --type luks2 /dev/nvme0n1p2
```

_If you want to revert back to LUKS1,_

```
sudo cryptsetup convert --type luks1 /dev/nvme0n1p2
```

_Before reverting back to LUKS1, the keyslot must be using PBKDF2 not Argon2, otherwise you will encounter "Cannot convert to LUKS1 format" error._

```
sudo cryptsetup luksConvertKey --pbkdf pbkdf2 /dev/nvme0n1p2
```

## Load LUKS2 Grub module

At this stage, the Grub bootloader (not the package) cannot unlock the LUKS2 partition yet. It needs to be reinstalled so that it can detect LUKS2 partition and load the relevant module.

First, unlock the partition and mount it.

```
sudo cryptsetup open /dev/nvme0n1p2 root
sudo mount -o subvol=@ /dev/mapper/root /mnt
sudo mount /dev/nvme0n1p1 /mnt/boot/efi
```

Notice in the "grub.cfg", it loads `luks` module instead of `luks2`, this explains why Grub couldn't unlock it.

```
$ sudo less /mnt/boot/grub/grub.cfg

menuentry 'Manjaro Linux' {
  insmod luks
}
```

While you _could_ manually update the config and replace `luks` with `luks2`, it is better to automate it using `grub-mkconfig`.

```
sudo manjaro-chroot /mnt /bin/bash
# or `sudo arch-chroot /mnt /bin/bash`
grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=manjaro --recheck
grub-mkconfig -o /boot/grub/grub.cfg
```

Now, inspect "grub.cfg" again while still in chroot, you should see `luks2` instead.

```
$ less /boot/grub/grub.cfg

menuentry 'Manjaro Linux' {
  insmod luks2
}
```

## Verify LUKS2 unlock

Before proceed to the next step, I recommend reboot into your Manjaro/Arch to check whether Grub can unlock LUKS2. Once that is done, reboot again to live USB.

## PBKDF2 to Argon2

_This step should be done in live USB_

All keyslot parameters are retained during conversion to LUKS2, so the pbkdf algorithm is still PBKDF2 + SHA256. To convert to Argon2 + SHA512,

```
sudo cryptsetup luksConvertKey --pbkdf argon2id --hash sha512 /dev/nvme0n1p2
```

You may notice `insmod gcry_sha256` line in the "grub.cfg", this module is not used for LUKS2 unlocking, so there is no need to add `insmod gcry_sha512`. As long as `insmod luks2` is there, Grub should be able to unlock LUKS2 regardless of pbkdf or hash algorithm.

## Enable TRIM and disable workqueue for SSD performance (optional)

_Still in live USB_

```
sudo cryptsetup --allow-discards --perf-no_read_workqueue --perf-no_write_workqueue --persistent open /dev/nvme0n1p2 root
```

Verify the flags are set.

```
$ sudo cryptsetup luksDump /dev/nvme0n1p2 | grep Flags

Flags:       	allow-discards no-read-workqueue no-write-workqueue
```

More details:

- [SSD TRIM](<https://wiki.archlinux.org/title/Dm-crypt/Specialties#Discard/TRIM_support_for_solid_state_drives_(SSD)>)
- [Workqueue](<https://wiki.archlinux.org/title/Dm-crypt/Specialties#Disable_workqueue_for_increased_solid_state_drive_(SSD)_performance>)

## Faster unlock in Grub

_This step can be done while the drive is mounted (as in not in live USB)_

Due to lack of cryptography acceleration, Grub takes half a minute to unlock LUKS. For faster unlock, Argon2 parameters can be tuned to _less security_.

To start off, have a try with these parameters:

- 4 iterations
- 256MB memory cost

```
sudo cryptsetup luksConvertKey /dev/nvme0n1p2 --pbkdf-force-iterations 4 --pbkdf-memory 262100
sudo cryptsetup luksConvertKey /dev/nvme0n1p2 --pbkdf-force-iterations 4 --pbkdf-memory 262100 --key-file /crypto_keyfile.bin
```

[This page](https://leo3418.github.io/collections/gentoo-config-luks2-grub-systemd/tune-parameters.html#change-the-parameters) explains why keyfile also needs to be updated.

Reboot and check how fast is the unlock. Fine tune the `--pbkdf-memory` option until the unlock speed is satisfactory (not too slow and not too fast). The option takes a value in kilobyte (KB).

| MB   | KB      |
| ---- | ------- |
| 128  | 131100  |
| 256  | 262100  |
| 512  | 524300  |
| 1024 | 1049000 |

## References

- [Dm-crypt/Encrypting_an_entire_system](https://wiki.archlinux.org/title/Dm-crypt/Encrypting_an_entire_system)
- [Gentoo Configuration Guide](https://leo3418.github.io/collections/gentoo-config-luks2-grub-systemd.html)
- [Restore the GRUB Bootloader](https://wiki.manjaro.org/index.php/GRUB/Restore_the_GRUB_Bootloader)
