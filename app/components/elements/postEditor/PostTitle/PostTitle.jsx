import React from 'react';
import Hint from 'app/components/elements/common/Hint';

export default class PostTitle extends React.PureComponent {
    render() {
        const { value } = this.props;
        const error = this.props.validate(value);

        return (
            <div className="PostTitle">
                <input
                    className="PostTitle__input"
                    placeholder="Заголовок"
                    value={value}
                    onChange={this._onChange}
                />
                {error ? (
                    <Hint warning align="left">
                        {error}
                    </Hint>
                ) : null}
            </div>
        );
    }

    _onChange = e => {
        this.props.onChange(e.target.value);
    };
}
