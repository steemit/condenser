/*global describe, it, before, beforeEach, after, afterEach */
import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Icon from 'app/components/elements/Icon';

import Flag from 'app/components/modules/Flag';

configure({ adapter: new Adapter() });

describe('Flag', () => {
    let component = LoadingIndicator;
    let fallback = Icon;
    it('should render the component only when the flag condition passes', () => {
        const FlagComponent = Flag(component);
        let wrapper = shallow(<FlagComponent flag={true} />);
        expect(wrapper.html()).not.toBe(null);
    });
    it('should render null when the flag condition fails and no fallback is provided', () => {
        const FlagComponent = Flag(component);
        let wrapper = shallow(<FlagComponent flag={false} />);
        expect(wrapper.html()).toBe(null);
    });
    it('should render the fallback component if the flag condition is false', () => {
        const FlagComponent = Flag(component, fallback);
        let wrapper = shallow(<FlagComponent flag={false} name="user" />);
        expect(wrapper.html()).not.toBe(null);
        expect(wrapper.text()).toEqual('<Icon />');
    });
});
