import React from 'react';
import SvgImage from 'app/components/elements/SvgImage';

class NotFound extends React.Component {
    render() {
        return (
            <div className="float-center" style={{width: '640px'}}>
                <a href="/"><SvgImage name="404" width="640px" height="480px" /></a>
            </div>
        );
    }
}

module.exports = {
    path: '*',
    component: NotFound
};
