import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import tt from 'counterpart';
import Icon from 'app/components/elements/Icon';
import Hint from 'app/components/elements/common/Hint';
import { validateTag } from 'app/utils/tags';
import KEYS from 'app/utils/keyCodes';

export default class TagInput extends React.PureComponent {
    static propTypes = {
        tags: PropTypes.array.isRequired,
        className: PropTypes.string,
        onChange: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            value: '',
            inputError: null,
            temporaryHintText: null,
        };
    }

    componentWillUnmount() {
        if (this._hintTimeout) {
            clearTimeout(this._hintTimeout);
        }
    }

    render() {
        const { tags, className } = this.props;
        const { inputError, temporaryHintText } = this.state;

        return (
            <div className={cn('TagInput', className)}>
                <input
                    className="TagInput__input"
                    value={this.state.value}
                    type="text"
                    ref="input"
                    placeholder={tt('post_editor.tags_input_placeholder')}
                    onFocus={
                        !tags.length && !this._hintTimeout
                            ? this._onFocus
                            : null
                    }
                    onChange={this._onInputChange}
                    onKeyDown={this._onInputKeyDown}
                />
                <i
                    className="TagInput__input-plus"
                    data-tooltip={tt('g.add')}
                    onClick={this._onPlusClick}
                >
                    <Icon name="editor/plus" />
                </i>
                {inputError ? (
                    <Hint warning align="left">
                        {inputError}
                    </Hint>
                ) : temporaryHintText ? (
                    <Hint info align="left">
                        {temporaryHintText}
                    </Hint>
                ) : null}
            </div>
        );
    }

    _onInputChange = e => {
        const value = e.target.value;

        this.setState({
            value,
            inputError: value ? this._checkTag(value) : null,
        });
    };

    _addTag(tag) {
        const { tags } = this.props;

        const newTags = [...tags];

        if (tag && !tags.includes(tag)) {
            newTags.push(tag);
        }

        this.setState({
            value: '',
        });

        this.props.onChange(newTags);
    }

    _onInputKeyDown = e => {
        if (e.which === KEYS.ENTER) {
            e.preventDefault();
            this._onPlusClick();
        }
    };

    _onPlusClick = () => {
        if (!this.state.inputError) {
            this._addTag(this.refs.input.value);
        }

        this.refs.input.focus();
    };

    _checkTag(tag) {
        if (/\s/.test(tag)) {
            return 'Тег не может содержать пробелы';
        }

        return validateTag(tag);
    }

    _onFocus = () => {
        this._hintTimeout = setTimeout(() => {
            this.setState({
                temporaryHintText: tt('category_selector_jsx.main_tag_hint'),
            });

            this._hintTimeout = setTimeout(() => {
                this.setState({
                    temporaryHintText: null,
                });
            }, 4000);
        }, 200);
    };
}
