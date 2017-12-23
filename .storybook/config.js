import { configure } from '@storybook/react';

const req = require.context('../src/app/components', true, /story\.jsx$/);

function loadStories() {
  req.keys().forEach(req);
}


configure(loadStories, module);
