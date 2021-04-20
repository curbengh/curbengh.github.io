---
title: Separate Python libraries with venv
excerpt: Easier removal of unneeded dependencies
date: 2021-04-20
tags:
- linux
---

I have several Python scripts for data processing purpose. I put them in "~/.local/bin/" folder so that I can directly run them by `$ script_a` ("~/.local/bin/" is preconfigured to be part of "$PATH"). A minor annoyance I found is that whenever I want to dispose a script along with its dependencies, I need to figure out which ones are core libraries or which ones are still required by other scripts (e.g. is [`logging`](https://pypi.org/project/logging/) a [core](https://docs.python.org/3/library/logging.html) library?). Recently, I learned about [venv](https://docs.python.org/3/library/venv.html) from awscli which it uses to install dependencies in a dedicated folder.

Let's say I have `script_a.py` and it requires `dep_x` and `dep_y` libraries. I install the libraries to "~/.local/lib/script_a/" folder, so if I don't need the script anymore, I just "rm -rf" the script and "~/.local/lib/script_a/" folder where its dependencies are located.

```
mkdir -p ~/.local/lib/
python -m venv ~/.local/lib/script_a/
source ~/.local/lib/script_a/bin/activate
pip install dep_x dep_y
deactivate
```

When you run `pip list`, you won't see the libraries because they are installed in a separate folder. To inspect them,

```
source ~/.local/lib/script_a/bin/activate
pip list
deactivate
```

Now you should be able to see them.

In the Python script, in order to use the libraries, you should use the usual `#!/usr/bin/env python3` header, instead it should be `#!/home/foo/.local/lib/script_a/bin/python3`.

If the script is intended to be installed among users, you can use the following shell script to install the python script:

``` sh
#!/bin/sh

mkdir -p "$HOME/.local/bin/"
cp "script_a.py" "$HOME/.local/bin/script_a"
chmod u+x "$HOME/.local/bin/script_a"
sed "1 s|^.*$|#\!$HOME/.local/lib/script_a/bin/python3|" "$HOME/.local/bin/script_a"

mkdir -p "$HOME/.local/lib/"
python -m venv "$HOME/.local/lib/script_a/"
. "$HOME/.local/lib/script_a/bin/activate"
pip install dep_x dep_y
deactivate
```

Although slash (/) is usually used as a separator in sed, but it actually supports other special characters. In this example, I use vertical bar (|) so that I don't have to escape the slashes. Notice the shell script is a _posix_ shell script, so `. "$HOME/..."` is used instead of `source "$HOME/..."`.

Depending on python is installed, you may be need to substitute "python" and "pip" with "python3" and "pip3" respectively. Some installations like Ubuntu WSL may not include "venv" library, it can installed with `python3-venv` package.
