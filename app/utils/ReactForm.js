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
        // validate: () => isValid(instance, fields, validation),
        handleSubmit: (fn) => (e) => {
            e.preventDefault()
            const valid = isValid(name, instance, fields, validation)
            if(!valid) return
            const data = getData(fields, instance.state)
            let formValid = true
            const fs = instance.state[name] || {}
            fs.submitting = true
            instance.setState(
                {[name]: fs},
                () => {
                    const ret = fn(data) || {}
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
        }
    }

    for(const fieldName of fields) {
        formState[fieldName] = {
            // This is expanded <input {...fieldName.props} />, so only add common props here
            props: {
                onChange: e => {
                    const value = e.target ? e.target.value : e // API may pass value directly
                    const v = {...(instance.state[fieldName] || {})}
                    v.props.value = value
                    v.props.checked = typeof initialValues[fieldName] === 'boolean' ? value : undefined
                    v.touched = value !== (initialValues[fieldName] || '')
                    instance.setState(
                        {[fieldName]: v},
                        () => {isValid(name, instance, fields, validation)}
                    )
                },
                // `value` prop on `input` should not be null. Consider using the empty string to clear the component or `undefined` for uncontrolled
                value: initialValues[fieldName] === null ? '' : initialValues[fieldName],
                checked: typeof initialValues[fieldName] === 'boolean' ? initialValues[fieldName] : undefined,
            },
            touched: false,
            error: null,
        }
    }
}

function isValid(name, instance, fields, validation) {
    let formValid = true
    const v = validation(getData(fields, instance.state))
    for(const fieldName of fields) {
        const validate = v[fieldName]
        const error = validate ? validate : null
        const value = {...(instance.state[fieldName] || {})}
        value.error = error
        if(error) formValid = false
        instance.setState({[fieldName]: value})
    }
    const fs = {...(instance.state[name] || {})}
    fs.valid = formValid
    instance.setState({[name]: fs})
    return formValid
}

function getData(fields, state) {
    const data = {}
    for(const fieldName of fields) {
        data[fieldName] = state[fieldName].props.value
    }
    return data
}