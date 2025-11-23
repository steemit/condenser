"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var cleanReduxInput = exports.cleanReduxInput = function cleanReduxInput(i) {
    // Remove all props that don't belong.  Triggers React warnings.
    var name = i.name,
        placeholder = i.placeholder,
        label = i.label,
        value = i.value,
        checked = i.checked,
        onChange = i.onChange,
        onBlur = i.onBlur,
        onFocus = i.onFocus;

    var ret = {
        name: name,
        placeholder: placeholder,
        label: label,
        value: value,
        checked: checked,
        onChange: onChange,
        onBlur: onBlur,
        onFocus: onFocus
    };
    if (ret.value == null) delete ret.value;
    if (ret.label == null) delete ret.label;
    if (ret.type == null) delete ret.type;
    return ret;
};