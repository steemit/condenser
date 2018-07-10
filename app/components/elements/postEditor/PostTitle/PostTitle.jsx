import React, { PureComponent } from 'react';
import KEYS from 'app/utils/keyCodes';
import Hint from 'app/components/elements/common/Hint';
import './PostTitle.scss';

export default class PostTitle extends PureComponent {
    render() {
        const { value, placeholder } = this.props;
        const error = this.props.validate(value);

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
                    <Hint error align="left">
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
