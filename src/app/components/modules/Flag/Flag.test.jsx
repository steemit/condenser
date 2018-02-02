/*global describe, it, before, beforeEach, after, afterEach */
import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Icon from 'app/components/elements/Icon';

import Flag from 'app/components/modules/Flag';

configure({ adapter: new Adapter() });

describe('Flag', () => {
    let component = <LoadingIndicator />;
    let fallback = <Icon name="user" />;
    let child = <div> HELLO WORLD </div>;

    it('should render the children  when the flag prop is true', () => {
        const wrapper = shallow(
            <Flag
                flagged={true}
                FlagComponent={component}
                Fallback={fallback}
                children={child}
            />
        );
        expect(wrapper.text()).toEqual(' HELLO WORLD ');
    });
    it('should render the FlagComponent  when the flag prop is true and there are no children', () => {
        const wrapper = shallow(
            <Flag
                flagged={true}
                FlagComponent={component}
                Fallback={fallback}
            />
        );
        expect(wrapper.text()).toEqual('<LoadingIndicator />');
    });

    it('should render null when the flag condition fails and no fallback is provided', () => {
        const wrapper = shallow(
            <Flag flagged={false} FlagComponent={component} />
        );
        expect(wrapper.html()).toBe(null);
    });

    it('should render the fallback component if the flag condition is false', () => {
        const wrapper = shallow(
            <Flag
                flagged={false}
                FlagComponent={component}
                Fallback={fallback}
            />
        );
        expect(wrapper.html()).not.toBe(null);
        expect(wrapper.text()).toEqual('<Icon />');
    });

    it('should render children but not FlagComponent if both are provided', () => {
        const wrapper = shallow(
            <Flag
                flagged={true}
                FlagComponent={component}
                Fallback={fallback}
                children={child}
            />
        );
        // There isn't a good way to check for proptypes errors
        // see https://stackoverflow.com/questions/26124914/how-to-test-react-proptypes-through-jest
        expect(wrapper.text()).toEqual(' HELLO WORLD ');
    });
});
