export const cleanReduxInput = i => {
    // Remove all props that don't belong.  Triggers React warnings.
    const {name, placeholder, label, value, checked, onChange, onBlur, onFocus} = i
    const ret = {name, placeholder, label, value, checked, onChange, onBlur, onFocus}
    if(ret.value == null) delete ret.value
    if(ret.label == null) delete ret.label
    if(ret.type == null) delete ret.type
    return ret
}
