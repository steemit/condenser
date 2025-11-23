'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ReactForm = require('app/utils/ReactForm');

var _ReactForm2 = _interopRequireDefault(_ReactForm);

var _enzyme = require('enzyme');

var _enzymeAdapterReact = require('enzyme-adapter-react-15');

var _enzymeAdapterReact2 = _interopRequireDefault(_enzymeAdapterReact);

var _BeneficiarySelector = require('./BeneficiarySelector');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('app/Translator');

(0, _enzyme.configure)({ adapter: new _enzymeAdapterReact2.default() });

var FormWrapper = function (_React$Component) {
    (0, _inherits3.default)(FormWrapper, _React$Component);

    function FormWrapper(props) {
        (0, _classCallCheck3.default)(this, FormWrapper);

        var _this = (0, _possibleConstructorReturn3.default)(this, (FormWrapper.__proto__ || (0, _getPrototypeOf2.default)(FormWrapper)).call(this));

        _this.state = {};
        (0, _ReactForm2.default)({
            fields: ['beneficiaries'],
            initialValues: { beneficiaries: [] },
            validation: function validation(values) {
                return {
                    beneficiaries: true
                };
            },
            instance: _this,
            name: 'testwrapper'
        });
        return _this;
    }

    (0, _createClass3.default)(FormWrapper, [{
        key: 'render',
        value: function render() {
            var beneficiaries = this.state.beneficiaries;

            return _react2.default.createElement(_BeneficiarySelector.BeneficiarySelector, (0, _extends3.default)({}, beneficiaries.props, {
                username: 'testuser',
                following: ['testfollowing']
            }));
        }
    }]);
    return FormWrapper;
}(_react2.default.Component);

describe('BeneficiarySelector', function () {
    it('it should add, set and remove beneficiary', function () {
        var wrapper = (0, _enzyme.mount)(_react2.default.createElement(FormWrapper, null));

        var component = wrapper.instance();
        expect(component.state.beneficiaries.value.length).toBe(0);
        expect(wrapper.find('input #remainingPercent').get(0).props.value).toBe(100);

        // add beneficiary
        wrapper.find('a #add').simulate('click');
        expect(component.state.beneficiaries.value.length).toBe(1);

        // add name and percent
        wrapper.find('input #percent').simulate('change', { target: { value: 20 } });
        expect(wrapper.find('input #remainingPercent').get(0).props.value).toBe(80);
        wrapper.find('input #user').simulate('change', { target: { value: 'testuser' } });
        expect(component.state.beneficiaries.value[0].percent).toBe(20);
        expect(component.state.beneficiaries.value[0].username).toBe('testuser');

        // remove beneficiary
        wrapper.find('a #remove').simulate('click');
        expect(component.state.beneficiaries.value.length).toBe(0);
        expect(wrapper.find('input #remainingPercent').get(0).props.value).toBe(100);
    });
});

describe('BeneficiarySelector_maxEntries', function () {
    it('it should hide add after 8 entries', function () {
        var wrapper = (0, _enzyme.mount)(_react2.default.createElement(FormWrapper, null));

        var component = wrapper.instance();
        expect(component.state.beneficiaries.value.length).toBe(0);
        expect(wrapper.find('input #remainingPercent').get(0).props.value).toBe(100);

        // add beneficiary 8 times
        for (var i = 0; i < 8; i++) {
            wrapper.find('a #add').simulate('click');
        }
        expect(component.state.beneficiaries.value.length).toBe(8);

        expect(wrapper.find('a #add').get(0).props.hidden).toBe(true);
    });
});

describe('BeneficiarySelector_validate', function () {
    it('beneficiary size exceeded', function () {
        var beneficiaries = [];
        for (var i = 0; i < 9; i++) {
            beneficiaries[i] = { username: 'abc' + i, percent: 1 };
        }
        expect((0, _BeneficiarySelector.validateBeneficiaries)('', beneficiaries, true)).toContain('at most 8 beneficiaries');
    });

    it('beneficiary cannot have duplicate', function () {
        var beneficiaries = [];
        for (var i = 0; i < 2; i++) {
            beneficiaries[i] = { username: 'abc', percent: 1 };
        }
        expect((0, _BeneficiarySelector.validateBeneficiaries)('', beneficiaries, true)).toContain('duplicate');
    });

    it('beneficiary cannot be self', function () {
        var beneficiaries = [{ username: 'abc', percent: 1 }];
        expect((0, _BeneficiarySelector.validateBeneficiaries)('abc', beneficiaries, true)).toContain('self');
    });

    it('beneficiary user missing when optional no error', function () {
        var beneficiaries = [{ username: '', percent: 0 }];
        expect((0, _BeneficiarySelector.validateBeneficiaries)('a', beneficiaries, false)).toBeFalsy();
    });

    it('beneficiary percent missing when optional no error', function () {
        var beneficiaries = [{ username: 'abc', percent: 0 }];
        expect((0, _BeneficiarySelector.validateBeneficiaries)('', beneficiaries, false)).toBeFalsy();
    });

    it('beneficiary percent too low when required', function () {
        var beneficiaries = [{ username: 'abc', percent: 0 }];
        expect((0, _BeneficiarySelector.validateBeneficiaries)('', beneficiaries, true)).toContain('percent');
    });

    it('beneficiary percent too high', function () {
        var beneficiaries = [{ username: 'abc', percent: 101 }];
        expect((0, _BeneficiarySelector.validateBeneficiaries)('', beneficiaries, true)).toContain('percent');
    });

    it('beneficiary percent sum too high', function () {
        var beneficiaries = [{ username: 'abc', percent: 50 }, { username: 'def', percent: 51 }];
        expect((0, _BeneficiarySelector.validateBeneficiaries)('', beneficiaries, true)).toContain('percent');
    });
});