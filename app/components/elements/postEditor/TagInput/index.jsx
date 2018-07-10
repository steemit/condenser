import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import tt from 'counterpart';
import Icon from 'app/components/elements/Icon';
import Hint from 'app/components/elements/common/Hint';
import { validateTag } from 'app/utils/tags';
import KEYS from 'app/utils/keyCodes';
import { TAGS_LIMIT } from '../../../../utils/tags';
import './index.scss';

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
        const { className } = this.props;

        return (
            <div className={cn('TagInput', className)}>
                <input
                    className="TagInput__input"
                    value={this.state.value}
                    type="text"
                    ref="input"
                    maxLength="25"
                    placeholder={tt('post_editor.tags_input_placeholder')}
                    onFocus={this._onFocus}
                    onBlur={this._onBlur}
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
                {this._renderErrorBlock()}
            </div>
        );
    }

    _renderErrorBlock() {
        const { tags } = this.props;
        const { inputError, temporaryHintText } = this.state;

        if (this.refs.input === document.activeElement && tags.length === 5) {
            return (
                <Hint warning align="left">
                    {tt(
                        'category_selector_jsx.use_limitied_amount_of_categories',
                        { amount: TAGS_LIMIT }
                    )}
                </Hint>
            );
        }

        if (inputError) {
            return (
                <Hint error align="left">
                    {inputError}
                </Hint>
            );
        }

        if (temporaryHintText) {
            return (
                <Hint info align="left">
                    {temporaryHintText}
                </Hint>
            );
        }
    }

    _onFocus = () => {
        const { tags } = this.props;

        if (!tags.length && !this._hintTimeout) {
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
        }

        this.forceUpdate();
    };

    _onBlur = () => {
        this.forceUpdate();
    };

    _onInputChange = e => {
        const value = e.target.value;

        if (/\s/.test(value) || Math.abs(this.state.value.length - value.length) >= 2) {
            const tags = value.split(/\s+/).filter(t => t);

            let inputError;

            for (let tag of tags) {
                inputError = this._checkTag(tag);

                if (inputError) {
                    break;
                }
            }

            if (inputError) {
                this.setState({
                    value,
                    inputError,
                });
            } else {
                this._addTags(tags);
            }
        } else {
            this.setState({
                value,
                inputError: value ? this._checkTag(value) : null,
            });
        }
    };

    _addTags(addTags) {
        const { tags } = this.props;

        const newTags = [...tags];

        for (let newTag of addTags) {
            if (newTag && !tags.includes(newTag)) {
                newTags.push(newTag);
            }
        }

        this.setState({
            value: '',
            inputError: null,
        });

        this.props.onChange(newTags);
    }

    _addTag(tag) {
        this._addTags([tag]);
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
}
