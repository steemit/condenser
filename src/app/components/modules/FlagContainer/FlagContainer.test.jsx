import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import FlagContainer from 'app/components/modules/FlagContainer';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Icon from 'app/components/elements/Icon';

configure({ adapter: new Adapter() });

describe('FlagContainer', () => {
    console.log(FlagContainer('yellow', LoadingIndicator))
    it('should render null when the flag condition fails and no fallback is provided', () => {
        const FlagComponent = FlagContainer('yellow', LoadingIndicator);
        let wrapper = shallow(<FlagComponent/>);
        expect(wrapper.html()).toBe(null);
    });
})