/*global describe, it, before, beforeEach, after, afterEach */
import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';

import { _Header_ } from './Header';

configure({ adapter: new Adapter() });

describe('Header', () => {
    it('contains class .header', () => {
        expect(
            shallow(<_Header_ location={{ pathname: 'whatever' }} />).is(
                '.Header'
            )
        ).toBe(true);
    });
});
