import React from 'react';
import tt from 'counterpart';

class SubmitPostServerRender extends React.Component {
    render() {
        return (
            <div className="text-center">
                {tt('g.loading')}...
            </div>
        );
    }
}

export default {
    path: 'submit',
    component: SubmitPostServerRender
};
