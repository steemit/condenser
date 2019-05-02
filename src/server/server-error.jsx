import React, { Component } from 'react';

class ServerError extends Component {
    render() {
        return (
            <div
                className="float-center"
                style={{ width: '640px', textAlign: 'center' }}
            >
                <img width="640px" height="480px" src="/images/500.jpg" />
                <div
                    style={{
                        width: '300px',
                        position: 'relative',
                        left: '400px',
                        top: '-400px',
                        textAlign: 'left',
                    }}
                >
                    <h4>Sorry.</h4>
                    <p>Looks like something went wrong on our end.</p>
                    <p>
                        Head back to <a href="/">Steemit</a> homepage.
                    </p>
                </div>
            </div>
        );
    }
}

export default ServerError;
