---
title: Mapping Ctrl+H to Backspace in terminal emulator
excerpt: Also fix Ctrl+Backspace in PowerShell
date: 2023-07-17
tags:
  - linux
  - zsh
  - powershell
---

A few months ago, there was [an article](https://www.masteringemacs.org/article/keyboard-shortcuts-every-command-line-hacker-should-know-about-gnu-readline) which encouraged Linux users to use more readline keyboard shortcuts. readline keyboard shortcuts are based on Emacs keybindings, while also support switching to vi keybindings. At that time, I was only familiar with `Ctrl+a` (line start) and `Ctrl+e` (line end). Interested to learn more tricks, I went on search for a cheatsheet and [found this](https://clementc.github.io/blog/2018/01/25/moving_cli/). I then added two missing shortcuts (`Ctrl+h` & `Ctrl+d`), printed it out and stick it to my desk.

![readline keyboard shortcuts](20230717/readline-shortcuts.png)

However there were two shortcuts which did not work as intended: `Ctrl+h` and `Ctrl+Backspace`. The first one is [supposed to](https://en.wikipedia.org/wiki/GNU_Readline#Emacs_keyboard_shortcuts) be equivalent to backspace, but it was deleting previous word just like `Ctrl+Backspace` or `Ctrl+w`. The second one did not work on PowerShell's Emacs mode.

While looking for a workaround for other terminal and shell, I find it helpful to remember these two facts so that you can stay on the right track.

- $TERM does not refer to the terminal emulator
- Shell does not recognise Ctrl+Backspace

## $TERM is not the terminal emulator

In Kitty, `$TERM` is "xterm-kitty"; most other Linux terminals output it as "xterm-256color". The value actually refers to the "[terminfo](https://en.wikipedia.org/wiki/Terminfo)" being used and not the [terminal emulator](https://en.wikipedia.org/wiki/Xterm).

## Shell does not recognise Ctrl+Backspace

When Ctrl+Backspace is pressed, a terminal emulator either sends "^?" or "^H" [control character](https://en.wikipedia.org/wiki/C0_and_C1_control_codes#C0_controls) to the shell, which then initiate an action (e.g. "backward-kill-word").

"^\[character\]" is first and foremost a [caret notation](https://en.wikipedia.org/wiki/Caret_notation) of a control character, a friendlier representation of hexadecimal, much like hexadecimal is a nicer representation of binary. "^H" actually means control-code-8 (H is the eighth letter), instead of representing `Ctrl+h`. "^H" can be entered using `Ctrl+h` simply because it is more practical than having a dedicated key for each control character on a keyboard.

## Remap Ctrl+h to ^?

Most terminal emulators map `Backspace` to "^?" and `Ctrl+Backspace` to "^H". Since `Ctrl+h` is also mapped to "^H", thus sharing a similar action ("backward-kill-word") with `Ctrl+Backspace`. The easiest fix is to remap `Ctrl+h` to "^?". This approach only needs to configure the terminal emulator.

To check which control character is mapped to:

```
$ showkey -a

# backspace
^? 	127 0177 0x7f

# ctrl+ backspace
^H 	 8 0010 0x08
```

### kitty

`map ctrl+h send_text normal \x7f`

Add the above line to the end of "$HOME/.config/kitty/kitty.conf". "7f" is the hex of "^?".

Press `Ctrl+Shirt+F5` to reload the config and run `showkey -a` to verify `Ctrl+h` has been remapped.

```
$ showkey -a

# ctrl+h
^? 	127 0177 0x7f
```

### Windows Terminal

Go Settings -> Open JSON file which will open "$home\AppData\Local\Packages\Microsoft.WindowsTerminal_xxx\LocalState\settings.json". Under `"actions"` list, append the following object.

```json
{
  "command": {
    "action": "sendInput",
    "input": "\u007F"
  },
  "keys": "ctrl+h"
}
```

## Map Ctrl+Backspace to backward-kill-word

`Ctrl+Backspace` does not work as expected when I switch the PowerShell's edit mode to Emacs `Set-PSReadLineOption -EditMode Emacs`, even though it works in the default `Cmd` mode. This is because PowerShell binds it to [`BackwardDeleteChar`](https://learn.microsoft.com/en-us/powershell/module/psreadline/about/about_psreadline_functions#backwarddeletechar) in Emacs mode. Somehow I could not remap it to "^H" (`\b`).

Some xterm users also have this issue and a workaround is by [mapping it](https://www.vinc17.net/unix/ctrl-backspace.en.html) to an unused escape sequence, then bind it to backward-kill-word in the shell. While Windows Terminal [supports](https://learn.microsoft.com/en-us/windows/terminal/customize-settings/actions#send-input) sending an escape sequence, the corresponding binding is [not supported](https://github.com/PowerShell/PSReadLine/issues/3430) in PowerShell. Instead of using escape sequence, let's use a unicode character, specifically a character within the range of [private use area](https://en.wikipedia.org/wiki/Private_Use_Areas) (`U+E888-U+F8FF`) to avoid conflict with existing characters. I choose `U+E888` for this example.

Anyhow, it is only a tiny issue for me since I can always use `Ctrl+w`.

### Windows Terminal

Go Settings -> Open JSON file which will open "$home\AppData\Local\Packages\Microsoft.WindowsTerminal_xxx\LocalState\settings.json". Under `"actions"` list, append the following object.

```json
{
  "command": {
    "action": "sendInput",
    "input": "\uE888"
  },
  "keys": "ctrl+backspace"
}
```

#### PowerShell

```ps $PROFILE
Set-PSReadLineKeyHandler -Chord "`u{E888}" -Function BackwardKillWord
```

The following Windows Terminal + PowerShell configs did not work for me. Windows Terminal did yield the correct control character, but somehow PowerShell could not recognise it.

```json
{
  "command": {
    "action": "sendInput",
    "input": "\u007F"
  },
  "keys": "backspace"
},
{
  "command": {
    "action": "sendInput",
    "input": "\b"
  },
  "keys": "ctrl+backspace"
}
```

```ps $PROFILE
Set-PSReadLineKeyHandler -Chord "`u{007F}" -Function BackwardDeleteChar
Set-PSReadLineKeyHandler -Chord "`b" -Function BackwardKillWord
```

#### zsh

```sh $HOME/.zshrc
bindkey '\uE888' backward-kill-word
```

#### bash

```sh $HOME/.bashrc
bind '"\uE888":backward-kill-word'
```
