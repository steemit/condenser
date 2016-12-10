import { detransliterate } from 'app/utils/ParsersAndFormatters';
export const cleanReduxInput = i => {
    // Remove all props that don't belong.  Triggers React warnings.
    const {name, placeholder, label, value, checked, onChange, onBlur, onFocus} = i
    let ret = {name, placeholder, label, value, checked, onChange, onBlur, onFocus}
    if(ret.value == null) delete ret.value
    if(ret.label == null) delete ret.label
    if(ret.type == null) delete ret.type
    if (ret.name =='category'){
      if (/ru--/.test(ret.value))
        ret.value = ret.value
          .split(' ')
          .map(item => /^ru--/.test(item) ? detransliterate(item) : item)
          .join(' ')
    }
    return ret
}
