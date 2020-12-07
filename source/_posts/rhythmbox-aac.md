---
title: Play AAC-encoded music in Rhythmbox
excerpt: Don't bother gstreamer1.0-plugins-bad, use gstreamer1.0-libav instead
date: 2019-09-26
tags:
- linux
- media
---

Recently I just switched from Foobar2000 (which requires Wine to run in Linux) to Rhythmbox. The first issue I encountered was it didn't add AAC-encoded songs when I set it to scan library. A quick search for solution resulted in installation of `gstreamer1.0-plugins-bad`. While it did resolve the issue, but it also installed many packages:

```
libgupnp-igd-1.0-4
libopenal1
libnice10
libsrtp2-1
libvo-aacenc0
libofa0
libusrsctp1
libsrt1
libwildmidi2
libopenal-data
libfluidsynth1
libmplex2-2.1-0
libmpeg2encpp-2.1-0
libsoundtouch1
libmjpegutils-2.1-0
libvo-amrwbenc0
libspandsp2
libmodplug1
libgstreamer-plugins-bad1.0-0
```

Guest what, most are not even related to decoding AAC. In searching for leaner solution, I purged them and tried install `libvo-aacenc0` only. But now Rhythmbox couldn't play AAC, at the same time it suggested installing `gstreamer1.0-libav` or `gstreamer1.0-plugins-bad`. So, I proceed to install `gstreamer1.0-libav` and AAC can be played once again. Rhythmbox still can play it even after I purged `libvo-aacenc0`, so it's not needed after all.

To make sure not only Rhythmbox can play AAC, but also recognise it during library scan, I also reset the library by removing "~/.local/share/rhythmbox/rhythmdb.xml". No issue on that.

One thing still puzzling me is that `gstreamer1.0-libav` is not actually an AAC decoder itself, (my understanding is that) it acts as a bridge between gstreamer and libav/ffmpeg to enable apps that utilize the former to encode/decode using the later, without additional code changes. The actual decoder I believe is in one of the following packages:

- libavcodec58
- libavformat58
- libfaad2

In my case, the above packages are already installed beforehand, perhaps shipped by default in Ubuntu (maybe not the libfaad2). So if Rhythmbox still can't play AAC after installing `gstreamer1.0-libav`, just make sure those packages are there.
