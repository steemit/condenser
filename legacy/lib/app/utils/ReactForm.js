'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.default = reactForm;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
    @arg {string} name - form state will appear in this.state[name]
    @arg {object} instance - `this` for the component
    @arg {array} fields - ['username', 'save', ...]
    @arg {object} initialValues required for checkboxes {save: false, ...}
    @arg {function} validation - values => ({ username: ! values.username ? 'Required' : null, ... })
*/
function reactForm(_ref) {
    var name = _ref.name,
        instance = _ref.instance,
        fields = _ref.fields,
        initialValues = _ref.initialValues,
        _ref$validation = _ref.validation,
        validation = _ref$validation === undefined ? function () {} : _ref$validation;

    if ((typeof instance === 'undefined' ? 'undefined' : (0, _typeof3.default)(instance)) !== 'object') throw new TypeError('instance is a required object');
    if (!Array.isArray(fields)) throw new TypeError('fields is a required array');
    if ((typeof initialValues === 'undefined' ? 'undefined' : (0, _typeof3.default)(initialValues)) !== 'object') throw new TypeError('initialValues is a required object');

    // Give API users access to this.props, this.state, this.etc..
    validation = validation.bind(instance);

    var formState = instance.state = instance.state || {};
    formState[name] = {
        // validate: () => setFormState(instance, fields, validation),
        handleSubmit: function handleSubmit(submitCallback) {
            return function (event) {
                event.preventDefault();

                var _setFormState = setFormState(name, instance, fields, validation),
                    valid = _setFormState.valid;

                if (!valid) return;
                var data = getData(fields, instance.state);
                var formValid = true;
                var fs = instance.state[name] || {};
                fs.submitting = true;

                // User can call this function upon successful submission
                var updateInitialValues = function updateInitialValues() {
                    setInitialValuesFromForm(name, instance, fields, initialValues);
                    formState[name].resetForm();
                };

                instance.setState((0, _defineProperty3.default)({}, name, fs), function () {
                    // TODO, support promise ret
                    var ret = submitCallback({ data: data, event: event, updateInitialValues: updateInitialValues }) || {};
                    // Look for field level errors
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = (0, _getIterator3.default)((0, _keys2.default)(ret)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var fieldName = _step.value;

                            var error = ret[fieldName];
                            if (!error) continue;
                            var value = instance.state[fieldName] || {};
                            value.error = error;
                            value.touched = true;
                            if (error) formValid = false;
                            instance.setState((0, _defineProperty3.default)({}, fieldName, value));
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    fs.submitting = false;
                    fs.valid = formValid;
                    instance.setState((0, _defineProperty3.default)({}, name, fs));
                });
            };
        },
        resetForm: function resetForm() {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = (0, _getIterator3.default)(fields), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var field = _step2.value;

                    var fieldName = n(field);
                    var f = instance.state[fieldName];
                    var def = initialValues[fieldName];
                    f.props.onChange(def);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        },
        clearForm: function clearForm() {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = (0, _getIterator3.default)(fields), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var field = _step3.value;

                    var fieldName = n(field);
                    var f = instance.state[fieldName];
                    f.props.onChange();
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }
    };

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        var _loop = function _loop() {
            var field = _step4.value;

            var fieldName = n(field);
            var fieldType = t(field);

            var fs = formState[fieldName] = {
                value: null,
                error: null,
                touched: false
            };

            // Caution: fs.props is expanded <input {...fieldName.props} />, so only add valid props for the component
            fs.props = { name: fieldName };

            {
                var initialValue = initialValues[fieldName];
                if (fieldType === 'checked') {
                    fs.value = toString(initialValue);
                    fs.props.checked = toBoolean(initialValue);
                } else if (fieldType === 'selected') {
                    fs.props.selected = toString(initialValue);
                    fs.value = fs.props.selected;
                } else {
                    fs.props.value = toString(initialValue);
                    fs.value = fs.props.value;
                }
            }

            fs.props.onChange = function (e) {
                var value = e && e.target ? e.target.value : e; // API may pass value directly
                var v = (0, _extends3.default)({}, instance.state[fieldName] || {});
                var initialValue = initialValues[fieldName];

                if (fieldType === 'checked') {
                    v.touched = toString(value) !== toString(initialValue);
                    v.value = v.props.checked = toBoolean(value);
                    v.value = value;
                } else if (fieldType === 'selected') {
                    v.touched = toString(value) !== toString(initialValue);
                    v.value = v.props.selected = toString(value);
                } else {
                    v.touched = toString(value) !== toString(initialValue);
                    v.value = v.props.value = toString(value);
                }

                instance.setState((0, _defineProperty3.default)({}, fieldName, v), function () {
                    setFormState(name, instance, fields, validation);
                });
            };

            fs.props.onBlur = function () {
                // Some errors are better shown only after blur === true
                var v = (0, _extends3.default)({}, instance.state[fieldName] || {});
                v.blur = true;
                instance.setState((0, _defineProperty3.default)({}, fieldName, v));
            };
        };

        for (var _iterator4 = (0, _getIterator3.default)(fields), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            _loop();
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }
}

function setFormState(name, instance, fields, validation) {
    var formValid = true;
    var formTouched = false;
    var v = validation(getData(fields, instance.state));
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = (0, _getIterator3.default)(fields), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var field = _step5.value;

            var _fieldName = n(field);
            var validate = v[_fieldName];
            var error = validate ? validate : null;
            var value = (0, _extends3.default)({}, instance.state[_fieldName] || {});
            value.error = error;
            formTouched = formTouched || value.touched;
            if (error) formValid = false;
            instance.setState((0, _defineProperty3.default)({}, _fieldName, value));
        }
    } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
            }
        } finally {
            if (_didIteratorError5) {
                throw _iteratorError5;
            }
        }
    }

    var fs = (0, _extends3.default)({}, instance.state[name] || {});
    fs.valid = formValid;
    fs.touched = formTouched;
    instance.setState((0, _defineProperty3.default)({}, name, fs));
    return fs;
}

function setInitialValuesFromForm(name, instance, fields, initialValues) {
    var data = getData(fields, instance.state);
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
        for (var _iterator6 = (0, _getIterator3.default)(fields), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var field = _step6.value;

            var _fieldName2 = n(field);
            initialValues[_fieldName2] = data[_fieldName2];
        }
    } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
            }
        } finally {
            if (_didIteratorError6) {
                throw _iteratorError6;
            }
        }
    }
}

function getData(fields, state) {
    var data = {};
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
        for (var _iterator7 = (0, _getIterator3.default)(fields), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var field = _step7.value;

            var _fieldName3 = n(field);
            data[_fieldName3] = state[_fieldName3].value;
        }
    } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
                _iterator7.return();
            }
        } finally {
            if (_didIteratorError7) {
                throw _iteratorError7;
            }
        }
    }

    return data;
}

/*
    @arg {string} field - field:type
    <pre>
        type = checked (for checkbox or radio)
        type = selected (for seelct option)
        type = string
    </pre>
    @return {string} type
*/
function t(field) {
    var _field$split = field.split(':'),
        _field$split2 = (0, _slicedToArray3.default)(_field$split, 2),
        _field$split2$ = _field$split2[1],
        type = _field$split2$ === undefined ? 'string' : _field$split2$;

    return type;
}

/**
    @return {string} name
*/
function n(field) {
    var _field$split3 = field.split(':'),
        _field$split4 = (0, _slicedToArray3.default)(_field$split3, 1),
        name = _field$split4[0];

    return name;
}

var hasValue = function hasValue(v) {
    return v == null ? false : (typeof v === 'string' ? v.trim() : v) === '' ? false : true;
};
var toString = function toString(v) {
    return hasValue(v) ? v : '';
};
var toBoolean = function toBoolean(v) {
    return hasValue(v) ? JSON.parse(v) : '';
};