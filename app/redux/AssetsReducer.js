import createModule from 'redux-modules';

import {immutableCore, global_object} from 'app/utils/Assets/assets_fake_data';

const defaultState = {
    assets: {},
    asset: {},
    core: immutableCore,
    globalObject: global_object
};

export default createModule({
    name: 'assets',
    initialState: defaultState,
    transformations: [
        {
            action: 'RECEIVE_ASSETS',
            reducer: (state, {payload}) => {
                return state.set('assets', payload)
            }
        },
        {
            action: 'GET_ASSET',
            reducer: (state, {payload}) => {
                return state.set('asset', payload)
            }
        }
    ]
});
