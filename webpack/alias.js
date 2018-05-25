import path from 'path';

function resolvePath(...rest) {
  return path.join(__dirname, '..', 'app', ...rest);
}

module.exports = {
    react: path.join(__dirname, '../node_modules', 'react'),
    '@config': resolvePath('client_config'),
    '@elements': resolvePath('components', 'elements'),
    '@modules': resolvePath('components', 'modules'),
    '@pages': resolvePath('components', 'pages'),
    '@utils': resolvePath('utils')
}
