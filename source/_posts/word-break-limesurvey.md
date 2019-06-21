---
title: Prevent word break in array question on LimeSurvey
subtitle: In array type question, when you add many answer options, some words might break into next line, especially when the word is long.
date: 2018-10-31
tags:
- stats
- limesurvey
---

When you have many answer options, the word can break into next line, like this:

{% cloudinary '20181031/break-word' 'Part of a word break into next line in LimeSurvey'  %}

LimeSurvey does this to have consistent column width size across array question. Personally, I prefer not to have word break than fixed width.

Here's how to prevent word break.

1. Go to the main admin page and then Themes.

	{% cloudinary '20181031/theme-button' 'LimeSurvey theme button in admin panel' %}

2. 'Extend' the theme of your choice. Choose a name of the new *extended* theme.

	{% cloudinary '20181031/theme-list' 'LimeSurvey theme list' %}

3. It will redirect you to 'Theme editor' page.
4. Go to 'custom.css'.

	{% cloudinary '20181031/custom-css' 'Customise LimeSurvey theme through custom.css' %}

5. Paste the following css,

	```css
	table.ls-answers {
	    table-layout: auto;
	}
	
	#outerframeContainer {
	    word-wrap: normal;
	    hyphens: none;
	    -moz-hyphens: none;
	    -webkit-hyphens: none;
	}
	```

5. Save it and change to the new theme in your survey.

Once the word break is disabled, array answers should look like this,

{% cloudinary '20181031/no-break-word' 'No word break in LimeSurvey' %}
