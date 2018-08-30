import React, { Component } from 'react';

let Market = null;

class MarketLoader extends Component {
    componentDidMount() {
        if (process.env.BROWSER && !Market) {
            require.ensure('./Market', require => {
                Market = require('./Market').default;

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
        if (Market) {
            return <Market {...this.props} />;
        }

        return <div />;
    }
}

export default {
    path: 'market',
    component: MarketLoader,
};
