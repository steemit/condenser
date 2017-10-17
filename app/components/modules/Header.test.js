/*global describe, it, before, beforeEach, after, afterEach */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { Map } from 'immutable';
import {_Header_} from './Header.jsx';

describe('Header', () => {
      it('contains class .header', () => {
        const location = { pathname: '/@lyke' }
        const account_meta = Map().setIn(['lyke'], Map({}));
        const component = shallow(<_Header_ location={location} account_meta={account_meta}/> )
        expect(component.is('.Header')).to.equal(true);
    });
});
