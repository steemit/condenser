/**
    @arg {string} name - form state will appear in this.state[name]
    @arg {object} instance - `this` for the component
    @arg {array} fields - ['username', 'save', ...]
    @arg {object} initialValues required for checkboxes {save: false, ...}
    @arg {function} validation - values => ({ username: ! values.username ? 'Required' : null, ... })
*/
export default function reactForm({name, instance, fields, initialValues, validation = () => ({})}) {
    if(typeof instance !== 'object') throw new TypeError('instance is a required object')
    if(!Array.isArray(fields)) throw new TypeError('fields is a required array')
    if(typeof initialValues !== 'object') throw new TypeError('initialValues is a required object')

    // Gives validation function access to everything in the compoent: this.props, this.state, this.etc..
    validation = validation.bind(instance)

    const formState = instance.state = instance.state || {}
    formState[name] = {
        // validate: () => setFormState(instance, fields, validation), // using continous validation instead

        /** @arg {object} event if passed, event.preventDefault is called. */
        handleSubmit: submitCallback => event => {
            if(event) event.preventDefault()
            const {valid} = setFormState(name, instance, fields, validation)
            if(!valid) return
            const data = getData(fields, instance.state)
            let formValid = true
            const form = {...instance.state[name]}
            form.submitting = true
            form.error = undefined

            // User can call this function upon successful submission
            const updateInitialValues = () => {
                setInitialValuesFromForm(name, instance, fields, initialValues)
                formState[name].resetForm()
            }

            instance.setState(
                {[name]: form},
                () => {
                    let formError
                    Promise.resolve()
                    .then(() => submitCallback({data, event, updateInitialValues}))
                    .catch(ret => {
                        if(typeof ret === 'object') {
                            // Look for field level errors
                            for(const fieldName of Object.keys(ret)) {
                                const error = ret[fieldName]
                                if(!error) continue
                                const value = {...instance.state[fieldName]}
                                value.error = error
                                value.touched = true
                                value.blur = true
                                if(error) formValid = false
                                instance.setState({[fieldName]: value})
                            }
                        } else if(typeof ret === 'string') {
                            formValid = false
                            formError = ret
                        }
                    })
                    .then(() => {// Success return message? (string)
                        instance.setState(prevState => {
                            const nextForm = {...prevState[name]}
                            nextForm.submitting = false
                            nextForm.valid = formValid
                            nextForm.error = formError
                            return {[name]: nextForm}
                        })
                    })
                }
            )
        },
        resetForm: () => {
            let count = 0
            for(const field of fields) {
                const fieldName = n(field)
                const f = instance.state[fieldName]
                const def = initialValues[fieldName]
                f.props.onChange(def, () => ++count !== fields.length)
            }
        },
        clearForm: () => {
            let count = 0
            for(const field of fields) {
                const fieldName = n(field)
                const f = instance.state[fieldName]
                f.props.onChange(undefined, () => ++count !== fields.length)
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

        /**
            @arg {event|string} event e.target.value or string or null / undefined
            @arg {function} done - @private optional callback, return keepStale
                boolean (true) when looping to suppress global form update.
        */
        fs.props.onChange = (e, done) => {
            const value = e && e.target ? e.target.value : e // API may pass value directly
            const v = {...(instance.state[fieldName] || {})}
            const initialValue = initialValues[fieldName]

            if(fieldType === 'checked') {
                v.touched = toString(value) !== toString(initialValue)
                v.value = v.props.checked = toBoolean(value)
                v.value = value
            } else if(fieldType === 'selected') {
                v.touched = toString(value) !== toString(initialValue)
                v.value = v.props.selected = toString(value)
            } else {
                v.touched = toString(value) !== toString(initialValue)
                v.value = v.props.value = toString(value)
            }

            instance.setState(
                {[fieldName]: v},
                () => {
                    // The callback may return true to defer a full form state update
                    const keepStale = done ? done() : false
                    if(!keepStale) {
                        setFormState(name, instance, fields, validation)
                    }
                }
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
    let cnt = 0
    for(const field of fields) {
        const fieldName = n(field)
        const validate = v[fieldName]
        const error = validate ? validate : null
        if(error) formValid = false
        instance.setState(prevState => {
            const value = {...(prevState[fieldName] || {})}
            value.error = error
            const nextState = {[fieldName]: value}

            formTouched = formTouched || value.touched
            if(++cnt === fields.length) {
                const form = {...prevState[name]}
                form.valid = formValid
                form.touched = formTouched
                nextState[name] = form
            }
            return nextState
        })
    }
    return {valid: formValid}
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
        type = checked (for checkbox or radio)
        type = selected (for seelct option)
        type = string
    </pre>
    @return {string} type
*/
function t(field) {
    const [, type = 'string'] = field.split(':')
    return type
}

/**
    @return {string} name
*/
function n(field) {
    const [name] = field.split(':')
    return name
}

const hasValue = v => v == null ? false : (typeof v === 'string' ? v.trim() : v) === '' ? false : true
const toString = v => hasValue(v) ? v : ''
const toBoolean = v => hasValue(v) ? JSON.parse(v) : ''
