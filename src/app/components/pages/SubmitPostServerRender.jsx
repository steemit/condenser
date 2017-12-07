import React from 'react';
import tt from 'counterpart';
import { pathTo } from 'app/Routes';

class SubmitPostServerRender extends React.Component {
    render() {
        return <div className="text-center">{tt('g.loading')}...</div>;
    }
}

module.exports = {
    path: pathTo.compose(),
    component: SubmitPostServerRender,
};
