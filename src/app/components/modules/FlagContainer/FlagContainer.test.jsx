import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import { Map } from 'immutable';
import FlagContainer, {
    mapStateToProps,
} from 'app/components/modules/FlagContainer';
import { defaultState } from 'app/redux/AppReducer';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Icon from 'app/components/elements/Icon';

configure({ adapter: new Adapter() });

describe('FlagContainer', () => {
    it('maps state to props', () => {
        const expected = mapStateToProps(defaultState);
        expect(expected).toEqual({ flags: undefined });
    });
});
