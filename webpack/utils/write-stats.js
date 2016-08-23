// borrowed from https://github.com/gpbl/isomorphic500/blob/master/webpack%2Futils%2Fwrite-stats.js
import fs from 'fs';
import path from 'path';

export default function (stats) {
    const publicPath = this.options.output.publicPath;
    const json = stats.toJson();

    // get chunks by name and extensions
    const getChunks = function (name, ext = /.js$/) {
        let chunks = json.assetsByChunkName[name];

        // a chunk could be a string or an array, so make sure it is an array
        if (!(Array.isArray(chunks))) {
            chunks = [chunks];
        }

        return chunks
            .filter(chunk => ext.test(path.extname(chunk))) // filter by extension
            .map(chunk => `${publicPath}${chunk}`); // add public path to it
    };

    let script = getChunks('vendor', /js/);
    script = [...script, ...getChunks('app', /js/)];
    const style = getChunks('app', /css/);

    // Find compiled images in modules
    // it will be used to map original filename to the compiled one
    // for server side rendering
    const imagesRegex = /\.(jpe?g|png|gif|svg)$/;
    const images = json.modules
        .filter(module => imagesRegex.test(module.name))
        .map(image => {
            return {
                original: image.name,
                compiled: `${publicPath}${image.assets[0]}`
            };
        });

    const content = {script, style, images};

    const filename = process.env.NODE_ENV === 'production' ? 'webpack-stats-prod.json' : 'webpack-stats-dev.json';
    const filepath = path.resolve(__dirname, '../../tmp/' + filename);
    fs.writeFileSync(filepath, JSON.stringify(content, null, 4));
    console.error('updated', filename);
}
