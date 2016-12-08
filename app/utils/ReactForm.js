/**
    @arg {string} name - form state will appear in this.state[name]
    @arg {object} instance - `this` for the component
    @arg {array} fields - ['username', 'save', ...]
    @arg {object} initialValues required for checkboxes {save: false, ...}
    @arg {function} validation - values => ({ username: ! values.username ? 'Required' : null, ... })
*/
export default function reactForm({name, instance, fields, initialValues, validation = () => {}}) {
    if(typeof instance !== 'object') throw new TypeError('instance is a required object')
    if(!Array.isArray(fields)) throw new TypeError('fields is a required array')
    if(typeof initialValues !== 'object') throw new TypeError('initialValues is a required object')

    // Give API users access to this.props, this.state, this.etc..
    validation = validation.bind(instance)

    const formState = instance.state = instance.state || {}
    formState[name] = {
        // validate: () => setFormState(instance, fields, validation),
        handleSubmit: submitCallback => event => {
            event.preventDefault()
            const {valid} = setFormState(name, instance, fields, validation)
            if(!valid) return
            const data = getData(fields, instance.state)
            let formValid = true
            const fs = instance.state[name] || {}
            fs.submitting = true

            // User can call this function upon successful submission
            const updateInitialValues = () => {
                setInitialValuesFromForm(name, instance, fields, initialValues)
                formState[name].resetForm()
            }

            instance.setState(
                {[name]: fs},
                () => {
                    const ret = submitCallback({data, event, updateInitialValues}) || {}
                    for(const fieldName of Object.keys(ret)) {
                        const error = ret[fieldName]
                        if(!error) continue
                        const value = instance.state[fieldName] || {}
                        value.error = error
                        value.touched = true
                        if(error) formValid = false
                        instance.setState({[fieldName]: value})
                    }
                    fs.submitting = false
                    fs.valid = formValid
                    instance.setState({[name]: fs})
                }
            )
        },
        resetForm: () => {
            for(const field of fields) {
                const fieldName = n(field)
                const f = instance.state[fieldName]
                const def = initialValues[fieldName]
                f.props.onChange(def)
            }
        },
        clearForm: () => {
            for(const field of fields) {
                const fieldName = n(field)
                const f = instance.state[fieldName]
                f.props.onChange()
            }
        },
    }

    for(const field of fields) {
        const fieldName = n(field)
        const fieldType = t(field)

        const fs = formState[fieldName] = {
            value: null,
            error: null,
            touched: false,
        }

        // Caution: fs.props is expanded <input {...fieldName.props} />, so only add valid props for the component
        fs.props = {name: fieldName}

        {
            const initialValue = initialValues[fieldName]
            if(fieldType === 'checked') {
                fs.value = toString(initialValue)
                fs.props.checked = toBoolean(initialValue)
            } else if(fieldType === 'selected') {
                fs.props.selected = toString(initialValue)
                fs.value = fs.props.selected
            } else {
                fs.props.value = toString(initialValue)
                fs.value = fs.props.value
            }
        }

        fs.props.onChange = e => {
            const value = e && e.target ? e.target.value : e // API may pass value directly
            const v = {...(instance.state[fieldName] || {})}
            const initialValue = initialValues[fieldName]

            if(fieldType === 'bool') {
                v.touched = toBool(value) !== toBool(initialValue)
                v.value = v.props.checked = toBool(value)
            } else if(fieldType === 'option') {
                v.touched = toString(value) !== toString(initialValue)
                v.value = v.props.selected = toString(value)
            } else {
                v.touched = toString(value) !== toString(initialValue)
                v.value = v.props.value = toString(value)
            }

            instance.setState(
                {[fieldName]: v},
                () => {setFormState(name, instance, fields, validation)}
            )
        }

        fs.props.onBlur = () => {
            // Some errors are better shown only after blur === true
            const v = {...(instance.state[fieldName] || {})}
            v.blur = true
            instance.setState({[fieldName]: v})
        }
    }
}

function setFormState(name, instance, fields, validation) {
    let formValid = true
    let formTouched = false
    const v = validation(getData(fields, instance.state))
    for(const field of fields) {
        const fieldName = n(field)
        const validate = v[fieldName]
        const error = validate ? validate : null
        const value = {...(instance.state[fieldName] || {})}
        value.error = error
        formTouched = formTouched || value.touched
        if(error) formValid = false
        instance.setState({[fieldName]: value})
    }
    const fs = {...(instance.state[name] || {})}
    fs.valid = formValid
    fs.touched = formTouched
    instance.setState({[name]: fs})
    return fs
}

function setInitialValuesFromForm(name, instance, fields, initialValues) {
    const data = getData(fields, instance.state)
    for(const field of fields) {
        const fieldName = n(field)
        initialValues[fieldName] = data[fieldName]
    }
}

function getData(fields, state) {
    const data = {}
    for(const field of fields) {
        const fieldName = n(field)
        data[fieldName] = state[fieldName].value
    }
    return data
}

/*
    @arg {string} field - field:type
    <pre>
        type = bool,checkbox,radio
        type = option,select
        type = string
    </pre>
*/
function t(field) {
    let [, type = 'string'] = field.split(':')
    if(/checkbox|radio/.test(type)) type = 'bool'
    if(/select|option/.test(type)) type = 'option'
    return type
}

function n(field) {
    const [name] = field.split(':')
    return name
}

const hasValue = v => v == null ? false : (typeof v === 'string' ? v.trim() : v) === '' ? false : true
const toBool = v => hasValue(v) ? JSON.parse(v) : false
const toString = v => hasValue(v) ? v : ''
