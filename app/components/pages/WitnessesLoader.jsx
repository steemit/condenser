import React, { Component } from 'react';

let Witnesses = null;

class WitnessesLoader extends Component {
    componentDidMount() {
        if (!Witnesses && process.env.BROWSER) {
            require.ensure('./Witnesses', require => {
                Witnesses = require('./Witnesses').default;

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
        if (Witnesses) {
            return <Witnesses {...this.props} />;
        }

        return <div />;
    }
}

module.exports = {
    path: '/~witnesses(/:witness)',
    component: WitnessesLoader,
};
