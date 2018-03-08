/*global describe, it, before, beforeEach, after, afterEach */
import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';

import { _Header_ } from './index';

configure({ adapter: new Adapter() });

beforeEach(() => {
    global.$STM_Config = {};
});

describe('Header', () => {
    it('contains class .header', () => {
        global.$STM_Config = { read_only_mode: false };
        expect(shallow(<_Header_ pathname={'whatever'} />).is('.Header')).toBe(
            true
        );
    });
});
