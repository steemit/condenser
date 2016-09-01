Notes for hackers and translators:
none of the strings are bind directly to components to keep them reusable.
few reasons behind it:






// do i even want to write this shit?






How to add your own language:
* copy ./en.js and translate
* add localeData and newly translated strings as it is done in Translator.jsx


// explain why long ass strings are used
// NOTE: here are some placeholders:
// Strings are not bind to components to keep them isomorphic and reusable.
// long ass strings like 'by_verifying_you_agree' and 'by_verifying_you_agree_terms_and_conditions' used together and nearby to avoid out of context problems. Because you cant just use 'terms_and_conditions' string template because it can have different formatting and prononciation in different languages depending on context
// do not add dots at the end (but what about long texts?)
// notes
// so not use space and indentation as styling tool in strings( ie '   something    else    and      this')
// but what about this kind of sentences? transfer_amount_to_steem_power
// transfer_amount_steem_power_to
// recieve_amount_from
// transfer_amount_from_to
// they allways will have identation on the end and never will be used out of context(?) (or not?)
// IDEA what about adding indentation based of formatJS syntax? (defaultValue or { indent: true })
// JUST USE SAME RULES AS ORIGINAL SYNTAX (question about lower/upper class)

// try to write 5 instead of FIVE because it is hard to change it in the future

// all strings are lowercase and use underscore to separate multiple strings (except not full sentence(ie 'by')), or intermediate strings (ie 'in reply to' is used before something else) // TODO (before what exactly?) (PostHistoryRow)

// another example why not to use dots and other syntax marks: santence can be put into text(dot needed), but also can be put in snackbar or button(dot not needed)

// not sure but possible problems
// example: 'by Mike'
// in english it is 'by Mike', but in some language it might be 'Mike by' (sort of, hope you understand)

// TODO heck defineMessages API of react-intl, it will allow to improve strings
// DO NOT FORGET TO ADD RUBLE SIGN

// add rules about using quotes for non programmers? (ie \', \n)

// TODO remove all '$' signs. What is proper syntax?

// TODO add coin and brand name as constant here. Like so:
// const 	brandName = 'SteemIt',
// 		coinName = 'Steem Power'
// form empty strings (ex. 'by') use ' ' instead of ''

// if you are going to add strings please keep in mind:
// strings must be as close to source as possible
// they must keep propert structure because "change_password" can translate both
// 'Change Password' and 'Change Account Password',
// same with 'user hasnt started posting' and 'user hasnt started posting yet'
// 'user_hasnt_followed_anything_yet' and 'user_hasnt_followed_anything' is not the same

// FIXME name this file README.md and place in locales (for better github view)

// TODO add explanation on how to change formatted date values
