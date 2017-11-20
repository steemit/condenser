import React from 'react';
import {connect} from 'react-redux'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import {cleanReduxInput} from 'app/utils/ReduxForms'
import tt from 'counterpart';

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
        id: 'CategorySelectorId',
        isEdit: false,
    }
    constructor() {
        super()
        this.state = {createCategory: true}
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'CategorySelector')
        this.categoryCreateToggle = (e) => {
            e.preventDefault()
            this.props.onChange()
            this.setState({ createCategory: !this.state.createCategory })
            setTimeout(() => this.refs.categoryRef.focus(), 300)
        }
        this.categorySelectOnChange = (e) => {
            e.preventDefault()
            const {value} = e.target
            const {onBlur} = this.props // call onBlur to trigger validation immediately
            if (value === 'new') {
                this.setState({createCategory: true})
                setTimeout(() => { if(onBlur) onBlur(); this.refs.categoryRef.focus() }, 300)
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
            <option value="">{tt('category_selector_jsx.select_a_tag')}...</option>
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
    if(!category || category.trim() === '') return required ? tt('g.required') : null
    const cats = category.trim().split(' ')
    return (
        // !category || category.trim() === '' ? 'Required' :
        cats.length > 5 ? tt('category_selector_jsx.use_limited_amount_of_categories', {amount: 5}) :
        cats.find(c => c.length > 24) ? tt('category_selector_jsx.maximum_tag_length_is_24_characters') :
        cats.find(c => c.split('-').length > 2) ? tt('category_selector_jsx.use_one_dash') :
        cats.find(c => c.indexOf(',') >= 0) ? tt('category_selector_jsx.use_spaces_to_separate_tags') :
        cats.find(c => /[A-Z]/.test(c)) ? tt('category_selector_jsx.use_only_lowercase_letters') :
        cats.find(c => !/^[a-z0-9-#]+$/.test(c)) ? tt('category_selector_jsx.use_only_allowed_characters') :
        cats.find(c => !/^[a-z-#]/.test(c)) ? tt('category_selector_jsx.must_start_with_a_letter') :
        cats.find(c => !/[a-z0-9]$/.test(c)) ? tt('category_selector_jsx.must_end_with_a_letter_or_number') :
        null
    )
}
export default connect((state, ownProps) => {
    const trending = state.getIn(['global', 'tag_idx', 'trending'])
    // apply translations
    // they are used here because default prop can't acces intl property
    const placeholder = tt('category_selector_jsx.tag_your_story');
    return { trending, placeholder, ...ownProps, }
})(CategorySelector);
