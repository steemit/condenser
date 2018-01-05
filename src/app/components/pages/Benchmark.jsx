import React from 'react';


class Benchmark extends React.Component {
    render() {
        return (
            <div className="row">
                <h1> Hi </h1>
                <div className="column column-12">HELLO</div>
            </div>
        );
    }
}

module.exports = {
    path: '/benchmark',
    component: Benchmark,
};