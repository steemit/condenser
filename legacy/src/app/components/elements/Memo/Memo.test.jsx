import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';

import { Memo } from './index';

configure({ adapter: new Adapter() });

describe('Memo', () => {
    it('should return an empty span if no text is provided', () => {
        const wrapper = shallow(<Memo fromNegativeRepUser={false} />);
        expect(wrapper.html()).toEqual('<span></span>');
    });

    it('should render a plain ol memo', () => {
        const wrapper = shallow(
            <Memo fromNegativeRepUser={false} text={'hi dude'} />
        );
        expect(wrapper.html()).toEqual('<span class="Memo">hi dude</span>');
    });
});
