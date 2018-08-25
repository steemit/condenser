import PropTypes from 'prop-types';

const Children = PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
]);

export default { Children };
