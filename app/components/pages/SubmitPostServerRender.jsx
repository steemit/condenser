import React from 'react';
import tt from 'counterpart';

class SubmitPostServerRender extends React.Component {
    render() {
        return (
            <div className="text-center">
                {tt('loading')}...
            </div>
        );
    }
}

module.exports = {
    path: 'submit.html',
    component: SubmitPostServerRender
};
