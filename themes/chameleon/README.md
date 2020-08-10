# Chameleon theme

Chameleon is a fork of [Typing](https://github.com/geekplux/hexo-theme-typing) theme, rewrote from scratch with the following changes/features:

- [sanitize.css](https://github.com/csstools/sanitize.css/) and [autoprefixer](https://github.com/csstools/sanitize.css/) for consistent cross-browser styling.
- Utilise [relative length](https://www.w3schools.com/CSSref/css_units.asp) instead of absolute length in the css.
- [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) to apply light/dark theme according to the OS preference.
- Add a [Copy](https://clipboardjs.com/) button to each code block.
- Removed jQuery, fancyBox, web analytics, comment plugins, donation links and [typo.css](https://github.com/sofish/typo.css).
- Homepage shows index of posts (same as /archives).

## Options

Configure this theme from your **site**'s configuration:

``` yml
# _config.yml
theme_config:
  # Header menu
  menu:
    Home: /
    Archives: /archives/
    Feed: /atom.xml

  # Footer menu
  footer:
    GitLab: https://gitlab.com/curben/blog

  # Load forkawesome icons?
  icons: false
```
