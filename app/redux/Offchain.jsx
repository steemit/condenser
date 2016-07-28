import Immutable from 'immutable';
import createModule from 'redux-modules';
import {PropTypes} from 'react';

const {string, object, shape, oneOf} = PropTypes;
const defaultState = Immutable.fromJS({user: {}});

export default createModule({
    name: 'offchain',
    initialState: defaultState,
    transformations: []
});
