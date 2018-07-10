import React, { PureComponent } from 'react';
import KEYS from 'app/utils/keyCodes';
import Hint from 'app/components/elements/common/Hint';
import './PostTitle.scss';
import tt from 'counterpart';

export default class PostTitle extends PureComponent {
    state = {
        showDotAlert: false,
        dotAlertAlreadyShown: false,
    };

    componentWillReceiveProps(newProps) {
        const { dotAlertAlreadyShown, showDotAlert } = this.state;

        if (
            !dotAlertAlreadyShown &&
            !showDotAlert &&
            /[.,;:]$/.test(newProps.value)
        ) {
            this.setState({
                showDotAlert: true,
                dotAlertAlreadyShown: true,
            });

            this._dotTimeout = setTimeout(() => {
                this.setState({
                    showDotAlert: false,
                });
            }, 5000);
        }
    }

    componentWillUnmount() {
        clearTimeout(this._dotTimeout);
    }

    render() {
        const { value, placeholder } = this.props;
        const { showDotAlert } = this.state;
        let error = this.props.validate(value);
        let isDotWarning = false;

        if (!error && showDotAlert) {
            error = tt('post-editor.cant_ends_with_special_char');
            isDotWarning = true;
        }

        return (
            <div className="PostTitle">
                <input
                    className="PostTitle__input"
                    placeholder={placeholder}
                    value={value}
                    onKeyDown={this._onKeyDown}
                    onChange={this._onChange}
                />
                {error ? (
                    <Hint
                        error={!isDotWarning}
                        warning={isDotWarning}
                        align="left"
                        width={isDotWarning ? 392 : null}
                    >
                        {error}
                    </Hint>
                ) : null}
            </div>
        );
    }

    _onKeyDown = e => {
        if (e.which === KEYS.TAB || e.which === KEYS.ENTER) {
            e.preventDefault();
            this.props.onTab();
        }
    };

    _onChange = e => {
        this.props.onChange(e.target.value);
    };
}
