---
title: Change spellcheck language in Ghostwriter
date: 2018-10-14
tags:
- Markdown
---
Ghostwriter is a Markdown editor with html preview. Previously I used [StackEdit](https://stackedit.io/app), but it's web-based.

Ghostwriter has built-in US English spellcheck. It supports [Hunspell](https://hunspell.github.io/) dictionaries for other languages.

<!-- more -->

To install other languages is easy, for Danish:

```bash
$ sudo apt install hunspell-da
```

Substitute `apt` with your distro's package manager. In Ghostwriter, go to Settings > Preferences > Spell Check (tab), and select the desired language. You might need to toggle the spellcheck or switch the language back and forth for it to work.

Here is a list of Hunspell dictionaries in Ubuntu (18.04) repo:

Package | Language
--- | ---
hunspell-af | Afrikaans
hunspell-an | Aragonese
hunspell-ar | Arabic
hunspell-be | Belarusian
hunspell-bg | Bulgarian
hunspell-bn | Bengali
hunspell-bo | Classical Tibetan language
hunspell-br | Breton language
hunspell-bs | Bosnian
hunspell-ca | Catalan
hunspell-cs | Czech
hunspell-da | Danish
hunspell-de-at | Austrian (German)
hunspell-de-at-frami | German (Austria)
hunspell-de-ch | Swiss (German)
hunspell-de-ch-frami | German (Switzerland)
hunspell-de-de | German
hunspell-de-de-frami | German
hunspell-de-med | German medical
hunspell-dz | Dzongkha language
hunspell-el | Modern Greek
hunspell-en-au | English (Australia)
hunspell-en-ca | English (Canada)
hunspell-en-gb | English (GB)
hunspell-en-med | English medical
hunspell-en-us | English (US)
hunspell-en-za | English (South Africa)
hunspell-es | Spanish
hunspell-eu | Basque (Euskera)
hunspell-fr | French
hunspell-fr-classical | French
hunspell-fr-comprehensive | French
hunspell-fr-modern | French
hunspell-fr-revised | French
hunspell-gd | Scottish Gaelic
hunspell-gl | Galician
hunspell-gl-es | Galician
hunspell-gu | Gujarati
hunspell-gug | Guarani
hunspell-he | Hebrew
hunspell-hi | Hindi
hunspell-hr | Croatian
hunspell-hu | Hungarian
hunspell-is | Icelandic
hunspell-it | Italian
hunspell-kk | Kazakh
hunspell-kmr | Kurmanji
hunspell-ko | Korean
hunspell-lo | Laotian
hunspell-lt | Lithuanian
hunspell-ml | Malayalam
hunspell-ne | Nepalese
hunspell-nl | Dutch
hunspell-no | Norwegian
hunspell-oc | Occitan
hunspell-pl | Polish
hunspell-pt-br | Brazilian Portuguese
hunspell-pt-pt | Portuguese
hunspell-ro | Romanian
hunspell-ru | Russian
hunspell-se | North Sámi Hunspell
hunspell-si | Sinhala
hunspell-sk | Slovak
hunspell-sl | Slovene
hunspell-sr | Serbian
hunspell-sv | Swedish
hunspell-sw | Swahili
hunspell-te | Telugu
hunspell-th | Thai
hunspell-uk | Ukrainian
hunspell-uz | Uzbek
hunspell-vi | Vietnamese
