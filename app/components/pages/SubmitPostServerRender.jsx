import React from 'react';

class SubmitPostServerRender extends React.Component {
    render() {
        return (
            <div className="text-center">
                Loading...
            </div>
        );
    }
}

module.exports = {
    path: 'submit.html',
    component: SubmitPostServerRender
};
