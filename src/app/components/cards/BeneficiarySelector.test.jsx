import React from 'react';
import reactForm from 'app/utils/ReactForm';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';

import {
    BeneficiarySelector,
    validateBeneficiaries,
} from './BeneficiarySelector';

require('app/Translator');

configure({ adapter: new Adapter() });

class FormWrapper extends React.Component {
    constructor(props) {
        super();
        this.state = {};
        reactForm({
            fields: ['beneficiaries'],
            initialValues: { beneficiaries: [] },
            validation: values => {
                return {
                    beneficiaries: true,
                };
            },
            instance: this,
            name: 'testwrapper',
        });
    }

    render() {
        const { beneficiaries } = this.state;
        return (
            <BeneficiarySelector
                {...beneficiaries.props}
                username="testuser"
                following={['testfollowing']}
            />
        );
    }
}

describe('BeneficiarySelector', () => {
    it('it should add, set and remove beneficiary', () => {
        const wrapper = mount(<FormWrapper />);

        const component = wrapper.instance();
        expect(component.state.beneficiaries.value.length).toBe(0);
        expect(wrapper.find('input #remainingPercent').get(0).props.value).toBe(
            100
        );

        // add beneficiary
        wrapper.find('a #add').simulate('click');
        expect(component.state.beneficiaries.value.length).toBe(1);

        // add name and percent
        wrapper
            .find('input #percent')
            .simulate('change', { target: { value: 20 } });
        expect(wrapper.find('input #remainingPercent').get(0).props.value).toBe(
            80
        );
        wrapper
            .find('input #user')
            .simulate('change', { target: { value: 'testuser' } });
        expect(component.state.beneficiaries.value[0].percent).toBe(20);
        expect(component.state.beneficiaries.value[0].username).toBe(
            'testuser'
        );

        // remove beneficiary
        wrapper.find('a #remove').simulate('click');
        expect(component.state.beneficiaries.value.length).toBe(0);
        expect(wrapper.find('input #remainingPercent').get(0).props.value).toBe(
            100
        );
    });
});

describe('BeneficiarySelector_maxEntries', () => {
    it('it should hide add after 8 entries', () => {
        const wrapper = mount(<FormWrapper />);

        const component = wrapper.instance();
        expect(component.state.beneficiaries.value.length).toBe(0);
        expect(wrapper.find('input #remainingPercent').get(0).props.value).toBe(
            100
        );

        // add beneficiary 8 times
        for (var i = 0; i < 8; i++) {
            wrapper.find('a #add').simulate('click');
        }
        expect(component.state.beneficiaries.value.length).toBe(8);

        expect(wrapper.find('a #add').get(0).props.hidden).toBe(true);
    });
});

describe('BeneficiarySelector_validate', () => {
    it('beneficiary size exceeded', () => {
        var beneficiaries = [];
        for (var i = 0; i < 9; i++) {
            beneficiaries[i] = { username: 'abc' + i, percent: 1 };
        }
        expect(validateBeneficiaries('', beneficiaries, true)).toContain(
            'at most 8 beneficiaries'
        );
    });

    it('beneficiary cannot have duplicate', () => {
        var beneficiaries = [];
        for (var i = 0; i < 2; i++) {
            beneficiaries[i] = { username: 'abc', percent: 1 };
        }
        expect(validateBeneficiaries('', beneficiaries, true)).toContain(
            'duplicate'
        );
    });

    it('beneficiary cannot be self', () => {
        var beneficiaries = [{ username: 'abc', percent: 1 }];
        expect(validateBeneficiaries('abc', beneficiaries, true)).toContain(
            'self'
        );
    });

    it('beneficiary user missing when optional no error', () => {
        var beneficiaries = [{ username: '', percent: 0 }];
        expect(validateBeneficiaries('a', beneficiaries, false)).toBeFalsy();
    });

    it('beneficiary percent missing when optional no error', () => {
        var beneficiaries = [{ username: 'abc', percent: 0 }];
        expect(validateBeneficiaries('', beneficiaries, false)).toBeFalsy();
    });

    it('beneficiary percent too low when required', () => {
        var beneficiaries = [{ username: 'abc', percent: 0 }];
        expect(validateBeneficiaries('', beneficiaries, true)).toContain(
            'percent'
        );
    });

    it('beneficiary percent too high', () => {
        var beneficiaries = [{ username: 'abc', percent: 101 }];
        expect(validateBeneficiaries('', beneficiaries, true)).toContain(
            'percent'
        );
    });

    it('beneficiary percent sum too high', () => {
        var beneficiaries = [
            { username: 'abc', percent: 50 },
            { username: 'def', percent: 51 },
        ];
        expect(validateBeneficiaries('', beneficiaries, true)).toContain(
            'percent'
        );
    });
});
