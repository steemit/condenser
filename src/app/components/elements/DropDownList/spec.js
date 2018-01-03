import React from 'react';
import LinkWithDropdown from './';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

describe('LinkWithDropdown', () => {
    const wrapper = shallow(<LinkWithDropdown />);
    const container = wrapper.instance();

    it('renders without crashing', () => {
        expect(wrapper).toBeTruthy();
        expect(container).toBeTruthy();
        expect(wrapper).toMatchSnapshot();
    });
});
