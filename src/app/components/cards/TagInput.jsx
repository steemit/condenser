import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import { cleanReduxInput } from 'app/utils/ReduxForms';
import tt from 'counterpart';
import { List } from 'immutable';

const MAX_TAGS = 8;

class TagInput extends React.Component {
    static propTypes = {
        // HTML props
        id: PropTypes.string, // DOM id for active component (focusing, etc...)
        autoComplete: PropTypes.string,
        placeholder: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        onBlur: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        value: PropTypes.string,
        tabIndex: PropTypes.number,
    };
    static defaultProps = {
        autoComplete: 'on',
        id: 'TagInputId',
    };
    constructor() {
        super();
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'TagInput');
    }

    render() {
        const { tabIndex, disabled, onChange } = this.props;
        const impProps = { ...this.props };
        const inputSanitized = cleanReduxInput(impProps);

        const allTags = inputSanitized.value.split(' ');
        // Strip tags containing 'hive-'
        const tagsToDisplay = allTags.filter(tag => {
            return !tag.includes('hive-');
        });
        const hiddenTags = allTags.filter(tag => !tagsToDisplay.includes(tag));

        const input = (
            <input
                type="text"
                onChange={e => {
                    e.preventDefault();
                    // Re-insert any hidden tags first.
                    const newTags = hiddenTags
                        .concat(e.target.value.split(' '))
                        .join(' ');
                    const updatedEvent = {
                        ...e,
                        target: {
                            ...e.target,
                            value: newTags,
                        },
                    };
                    onChange(updatedEvent);
                }}
                ref="tagInputRef"
                tabIndex={tabIndex}
                disabled={disabled}
                autoCapitalize="none"
            />
        );

        return <span>{input}</span>;
    }
}
export function validateTagInput(value, required = true) {
    if (!value || value.trim() === '')
        return required ? tt('g.required') : null;
    const cats = value.trim().split(' ');
    return (
        // !value || value.trim() === '' ? 'Required' :
        cats.length > MAX_TAGS
            ? tt('category_selector_jsx.use_limited_amount_of_categories', {
                  amount: MAX_TAGS,
              })
            : cats.find(c => c.length > 24)
              ? tt('category_selector_jsx.maximum_tag_length_is_24_characters')
              : cats.find(c => c.split('-').length > 2)
                ? tt('category_selector_jsx.use_one_dash')
                : cats.find(c => c.indexOf(',') >= 0)
                  ? tt('category_selector_jsx.use_spaces_to_separate_tags')
                  : cats.find(c => /[A-Z]/.test(c))
                    ? tt('category_selector_jsx.use_only_lowercase_letters')
                    : cats.find(c => !/^[a-z0-9-#]+$/.test(c))
                      ? tt('category_selector_jsx.use_only_allowed_characters')
                      : cats.find(c => !/^[a-z-#]/.test(c))
                        ? tt('category_selector_jsx.must_start_with_a_letter')
                        : cats.find(c => !/[a-z0-9]$/.test(c))
                          ? tt(
                                'category_selector_jsx.must_end_with_a_letter_or_number'
                            )
                          : null
    );
}
export default connect((state, ownProps) => {
    // apply translations
    // they are used here because default prop can't acces intl property
    const placeholder = tt('category_selector_jsx.tag_your_story');
    return { placeholder, ...ownProps };
})(TagInput);
