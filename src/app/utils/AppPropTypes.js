import {PropTypes} from 'react';

const Children = PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
]);

export default {Children};
