import React, { Component } from 'react';
import SvgImage from 'app/components/elements/SvgImage';

class ServerError extends Component {

    render() {
        return (
            <div className="float-center" style={{width: '640px', textAlign: 'center'}}>
                <a href="/"><SvgImage name="500" width="640px" height="480px" /></a>
            </div>
        );
    }

}

export default ServerError;
