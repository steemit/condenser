# internationalization guide

## how to add your own language

1. copy ./en.js
2. rename it (for example jp.js)
3. translate it
5. go to server-html.jsx
6. add your locale date ass it is done in https://cdn.polyfill.io script (add ',Intl.~locale.XX' at the end of url)
7. add localeData and newly translated strings as it is done in Translator.jsx (read the comments)

## Notes for hackers and translators
'keep_syntax_lowercase_with_dashes' on string names. Example: show_password: 'Show Password'
Please keep in mind that none of the strings are bind directly to components to keep them reusable. For example: 'messages_count' can be used in one page today, but also can be placed in another tomorrow.
Strings must be as close to source as possible.
They must keep proper structure because "change_password" can translate both 'Change Password' and 'Change Account Password'.
Same with "user hasn't started posting" and "user hasn't started posting yet", 'user_hasnt_followed_anything_yet' and 'user_hasnt_followed_anything' is not the same

### About syntax rules

Do not use anything to style strings unless you are 100% sure what you are doing.
This is no good: 'LOADING' instead of 'Loading'. Avoid whitespace styling: '   Loading' - is no good.
Also, try to avoid using syntax signs, unless it's a long ass string which will always end with dot no matter where you put it. Example: 'Loading...', 'Loading!' is no good, use 'Loading' instead.
If you are not sure which syntax to use and how to write your translations just copy the way original string have been written.

### How to use plurals

Plurals are strings which look differently depending on what numbers are used.
We use formatJs syntax, read the docs http://formatjs.io/guides/message-syntax/
Pay special attention to '{plural} Format' section.
[This link](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html) shows how they determine which plural to use in different languages (they explain how string falls under 'few', 'many' and 'other' category. If you are completely lost, just look at the other translation files (en.js or ru.js).

### How to use special symbols
\n means new line break
\' means ' (single quote sign)
this works: 'hasn\'t', "hasn't" (double quotes > single quotes)
this does not: 'hasn't'
Some languages require certain strings to be empty. For example, Russian language in some context does not have equivalent for 'by'('Post created by Misha'). For empty strings use ' '(empty quotes with single space)  instead of '', otherwise you will see string name instead of nothing.
