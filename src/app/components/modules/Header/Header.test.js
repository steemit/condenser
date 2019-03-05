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
        const header = shallow(<_Header_ pathname={'whatever'} />);
        console.log(header.closest('header.header'));
        expect(header.closest('header.header').length).toBe(1);
    });
});
