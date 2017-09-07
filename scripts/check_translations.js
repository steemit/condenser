const fs = require('fs');

const used_keys = {};

function jsonToKeys(keys, prefix, json) {
    if (typeof json === 'object') {
        for (const k in json) {
            const new_prefix = prefix ? prefix + '.' + k : k;
            jsonToKeys(keys, new_prefix, json[k]);
        }
    } else {
        if (keys[prefix]) throw new Error('Duplicate translation: ' + prefix);
        keys[prefix] = true;
    }
}

function readTranslationKeys(path) {
    const data = fs.readFileSync(path, 'utf8');
    const json = JSON.parse(data);
    const keys = {};
    jsonToKeys(keys, null, json);
    return keys;
}

function loadTranslationFiles(path) {
    const translations = {};
    const files = fs.readdirSync(path);
    for (const filename of files) {
        const m = filename.match(/([\w-]+)\.json$/);
        if (!m) continue;
        const lang = m[1];
        translations[lang] = readTranslationKeys(path + '/' + filename);
    }
    return translations;
}

function processFile(path) {
    const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);
    for (const l of lines) {
        const tts = l.match(/(tt\(['.-_\w]+\))/g);
        if (tts) {
            // if(tts.length > 1) console.log('-- tt -->', path, l, tts.length, JSON.stringify(tts, null, 4));
            for (const t of tts) {
                const m = t.match(/tt\(['"](['.-_\w]+)['"]\)/);
                if (!m) throw new Error('Wrong format: ' + t);
                const key = m[1];
                if (used_keys[key]) used_keys[key] += 1;
                else used_keys[key] = 1;
            }
        }
    }
}

function processDir(path) {
    const files = fs.readdirSync(path);
    for (const filename of files) {
        const newpath = path + '/' + filename;
        const stat = fs.statSync(newpath);
        if (stat.isDirectory()) processDir(newpath);
        else if (filename.match(/\.jsx?$/)) {
            processFile(newpath);
        }
    }
}

function checkKeys(translations, used_keys) {
    for (const lang in translations) {
        const lang_keys = translations[lang];
        for (const key in used_keys) {
            if (!lang_keys[key]) console.warn('Warning! Translation key not found: ', lang, key);
        }
        for (const key in lang_keys) {
            if (!used_keys[key]) console.warn('Warning! Unused translation: ', lang, key);
        }
    }
}

const translations = loadTranslationFiles('src/app/locales');
processDir('src');
checkKeys(translations, used_keys);
