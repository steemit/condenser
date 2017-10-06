/* eslint guard-for-in: 0 */
/* eslint no-restricted-syntax: 0 */

const fs = require('fs');

function jsonToKeys(keys, prefix, json) {
    if (typeof json === 'object') {
        if (json.one && json.other) {
            keys[prefix] = true;
            return;
        }
        for (const k in json) {
            const new_prefix = prefix ? prefix + '.' + k : k;
            jsonToKeys(keys, new_prefix, json[k]);
        }
        return;
    }
    if (keys[prefix]) throw new Error('Duplicate translation: ' + prefix);
    keys[prefix] = true;
}

function readTranslationKeys(path) {
    const data = fs.readFileSync(path, 'utf8');
    const json = JSON.parse(data);
    const keys = {};
    jsonToKeys(keys, null, json);
    return keys;
}

function loadTranslationFiles(path) {
    const args = process.argv.slice(2);
    const translations = {};
    const files = fs.readdirSync(path);
    for (const filename of files) {
        if (args.length <= 0 || filename === args[0]) {
            const m = filename.match(/([\w-]+)\.json$/);
            if (m) {
                const lang = m[1];
                translations[lang] = readTranslationKeys(path + '/' + filename);
            }
        }
    }
    return translations;
}

function processFile(used_keys, path) {
    const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);
    for (const l of lines) {
        const tts = l.match(/(tt\(["'.\-_\w]+)/g) || l.match(/(FormattedHTMLMessage.+id=["'.\-_\w]+)/g);
        if (tts) {
            // if(tts.length > 1) console.log('-- tt -->', path, l, tts.length, JSON.stringify(tts, null, 4));
            for (const t of tts) {
                if (t !== 'tt(id') {
                    const m = t.match(/tt\(['"]([.\-_\w]+)/) || t.match(/id=['"]([.\-_\w]+)['"]/);
                    if (!m) throw new Error('Wrong format: "' + t + '" in "' + l + '"');
                    const key = m[1];
                    if (used_keys[key]) used_keys[key] += 1;
                    else used_keys[key] = 1;
                }
            }
        }
    }
}

function processDir(path, used_keys = {}) {
    const files = fs.readdirSync(path);
    for (const filename of files) {
        const newpath = path + '/' + filename;
        const stat = fs.statSync(newpath);
        if (stat.isDirectory()) processDir(newpath, used_keys);
        else if (filename.match(/\.jsx?$/)) {
            processFile(used_keys, newpath);
        }
    }
    return used_keys;
}

function checkKeys(translations, used_keys) {
    let errors_counter = 0;
    for (const lang in translations) {
        const lang_keys = translations[lang];
        for (const key in used_keys) {
            if (!lang_keys[key]) {
                console.warn('Translation key not found: ', lang, key);
                errors_counter += 1;
            }
        }
        for (const key in lang_keys) {
            if (!used_keys[key]) {
                console.warn('Unused translation: ', lang, key);
                errors_counter += 1;
            }
        }
    }
    return errors_counter;
}

const translations = loadTranslationFiles('src/app/locales');
const used_keys = processDir('src');
const errors_counter = checkKeys(translations, used_keys);
process.exit(errors_counter > 0 ? 1 : 0);
