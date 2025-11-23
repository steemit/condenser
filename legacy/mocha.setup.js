require('babel-register')();

process.env.NODE_PATH = require('path').resolve(__dirname, './src');
require('module').Module._initPaths();

const jsdom = require('jsdom').jsdom;

const exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
    if (typeof global[property] === 'undefined') {
        exposedProperties.push(property);
        global[property] = document.defaultView[property];
    }
});

global.navigator = {
    userAgent: 'node.js'
};

documentRef = document;

function donothing() {
    return null;
}
require.extensions['.svg'] = donothing;
require.extensions['.css'] = donothing;
require.extensions['.scss'] = donothing;
