// for LANG in es fr it ja ko pl ru zh; do echo $LANG; node add_missing.js en $LANG > tmp.json ; mv tmp.json $LANG.json ; done

const fs = require('fs');
const lodash = require('lodash');

const locale = process.argv[2];
const otherLocale = process.argv[3];

const currentJson = fs.readFileSync(`${locale}.json`);
const otherJson = fs.readFileSync(`${otherLocale}.json`);

const current = JSON.parse(currentJson);
const other = JSON.parse(otherJson);

const modified = lodash.merge(current, other);

console.log(JSON.stringify(modified, null, 4));
