import React, { PureComponent } from 'react';

let PostForm = null;

export default class PostFormLoader extends PureComponent {
    componentDidMount() {
        if (!PostForm) {
            require.ensure('app/components/modules/PostForm/PostForm', require => {
                PostForm = require('app/components/modules/PostForm/PostForm').default;
                this.forceUpdate();
            });
        }
    }

    render() {
        if (this._error) {
            return this._error;
        }

        if (PostForm) {
            return <PostForm {...this.props} />
        }

        return <div />;
    }
}
