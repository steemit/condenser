import React, { Component } from 'react';
import SvgImage from 'app/components/elements/SvgImage';

class ServerError extends Component {

    render() {
        return (
            <div className="float-center" style={{width: '640px', textAlign: 'center'}}>
                <a href="/">
                    <SvgImage name="500" width="640px" height="480px" />
                    <div style={{width: '300px', position: 'relative', left: '400px', top: '-400px', textAlign: 'left'}}>
                        <h4>An error occurred processing your request.</h4>
                        <p>We're sorry for the trouble. We've been notified of the error and will correct it as soon as possible.<br />
                        Please try your request again in a moment.</p>
                    </div>
                </a>
            </div>
        );
    }

}

export default ServerError;
