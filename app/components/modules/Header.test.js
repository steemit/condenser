/*global describe, it, before, beforeEach, after, afterEach */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import {_Header_} from './Header.jsx';

describe('Header', () => {
    it('contains class .header', () => {
        expect(shallow(<_Header_ />).is('.Header')).to.equal(true);
    });
});
