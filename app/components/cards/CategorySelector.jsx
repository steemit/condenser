import React from 'react';
import {connect} from 'react-redux'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import {cleanReduxInput} from 'app/utils/ReduxForms'

class CategorySelector extends React.Component {
    static propTypes = {
        // HTML props
        id: React.PropTypes.string, // DOM id for active component (focusing, etc...)
        autoComplete: React.PropTypes.string,
        placeholder: React.PropTypes.string,
        onChange: React.PropTypes.func.isRequired,
        onBlur: React.PropTypes.func.isRequired,
        isEdit: React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        value: React.PropTypes.string,
        tabIndex: React.PropTypes.number,

        // redux connect (overwrite in HTML)
        trending: React.PropTypes.object.isRequired, // Immutable.List
    }
    static defaultProps = {
        autoComplete: 'on',
        placeholder: 'Tag (up to 5 tags), the first tag is your main category.',
        id: 'CategorySelectorId',
        isEdit: false,
    }
    constructor() {
        super()
        this.state = {createCategory: true}
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'CategorySelector')
        this.categoryCreateToggle = e => {
            e.preventDefault()
            this.props.onChange()
            this.setState({ createCategory: !this.state.createCategory })
            setTimeout(() => this.refs.categoryRef.focus(), 300)
        }
        this.categorySelectOnChange = e => {
            e.preventDefault()
            const {value} = e.target
            const {onBlur} = this.props // call onBlur to trigger validation immediately
            if (value === 'new') {
                this.setState({createCategory: true})
                setTimeout(() => {if(onBlur) onBlur(); this.refs.categoryRef.focus()}, 300)
            } else
                this.props.onChange(e)
        }
    }
    render() {
        const {trending, tabIndex, disabled} = this.props
        const categories = trending.slice(0, 11).filterNot(c => validateCategory(c))
        const {createCategory} = this.state

        const categoryOptions = categories.map((c, idx) =>
            <option value={c} key={idx}>{c}</option>)

        const impProps = {...this.props}
        const categoryInput =
            <input type="text" {...cleanReduxInput(impProps)} ref="categoryRef" tabIndex={tabIndex} disabled={disabled} />

        const categorySelect = (
            <select {...cleanReduxInput(this.props)} onChange={this.categorySelectOnChange} ref="categoryRef" tabIndex={tabIndex} disabled={disabled}>
                <option value="">Select a tag...</option>
                {categoryOptions}
                <option value="new">{this.props.placeholder}</option>
            </select>
        )
        return (
            <span>
                {createCategory ? categoryInput : categorySelect}
            </span>
        )
    }
}
export function validateCategory(category, required = true) {
    if(!category || category.trim() === '') return required ? 'Required' : null
    const cats = category.trim().split(' ')
    return (
        // !category || category.trim() === '' ? 'Required' :
        cats.length > 5 ? 'Please use only five categories' :
        cats.find(c => c.length > 24)           ? 'Maximum tag length is 24 characters' :
        cats.find(c => c.split('-').length > 2) ? 'Use only one dash' :
        cats.find(c => c.indexOf(',') >= 0)     ? 'Use spaces to separate tags' :
        cats.find(c => /[A-Z]/.test(c))         ? 'Use only lowercase letters' :
        cats.find(c => !/^[a-z0-9-]+$/.test(c)) ? 'Use only lowercase letters, digits and one dash' :
        cats.find(c => !/^[a-z]/.test(c))       ? 'Must start with a letter' :
        cats.find(c => !/[a-z0-9]$/.test(c))    ? 'Must end with a letter or number' :
        null
    )
}
export default connect((state, ownProps) => {
    const trending = state.global.get('category_idx').get('trending')
    return {
        trending,
        ...ownProps,
    }
})(CategorySelector);
