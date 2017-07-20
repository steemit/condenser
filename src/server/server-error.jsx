import React, { Component } from 'react';
import SvgImage from 'app/components/elements/SvgImage';

class ServerError extends Component {

    render() {
        return (
            <div className="float-center" style={{width: '640px', textAlign: 'center'}}>
                <a href="/">
                    <SvgImage name="500" width="640px" height="480px" />
                    <div style={{width: '300px', position: 'relative', left: '400px', top: '-400px', textAlign: 'left'}}>
                        <h4>Sorry, this page isn't available.</h4>
                        <p>The link you followed may be broken, or the page may have been removed. Go back to <a href="https://steemit.com">Steemit</a></p>
                    </div>
                </a>
            </div>
        );
    }

}

export default ServerError;
