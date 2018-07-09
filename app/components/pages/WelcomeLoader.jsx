import React, { Component } from 'react';

let Welcome = null;

class WelcomeLoader extends Component {
    componentDidMount() {
        if (!Welcome && process.env.BROWSER) {
            require.ensure('./Welcome', require => {
                Welcome = require('./Welcome').default;

                if (!this._unmount) {
                    this.forceUpdate();
                }
            });
        }
    }

    componentWillUnmount() {
        this._unmount = true;
    }

    render() {
        if (Welcome) {
            return <Welcome {...this.props} />;
        }

        return <div />;
    }
}

module.exports = {
    path: 'welcome',
    component: WelcomeLoader,
};
