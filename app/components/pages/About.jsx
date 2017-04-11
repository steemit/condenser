import React from 'react';

class About extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="column">
                    <div className="float-right"><a href="#" onClick={e => {e.preventDefault(); alert(process.env.VERSION)}}>Version</a></div>
                    <h2>About Steemit</h2>
                    <p>
                        Steemit is a social media platform where everyone gets paid for creating and curating content. It leverages a robust digital points system, called Steem, that supports real value for digital rewards through market price discovery and liquidity.
                        <a href="https://steem.io/">Learn more at steem.io</a>.
                    </p>
                    <h2>Resources</h2>
                    <h3><a href="https://steem.io/SteemWhitePaper.pdf" onClick={this.navigate}>Steem Whitepaper</a> <small>[PDF]</small></h3>
                    <h3><a href="http://steem.herokuapp.com" target="_blank" rel="noopener noreferrer">Join our Slack</a></h3>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'about.html',
    component: About
};
