import React from 'react';

class Search extends React.Component {
    render() {
        // if (!process.env.BROWSER) return null; // rendering on server makes it dissapear on client
        return (
        {/*<iframe style={{width: "100%", height: "100vh", maxWidth: "800px"}} frameBorder="0" src="/static/search.html">
            </iframe>*/}
            <div>Site search if temporary unavailable. Sorry for the inconvenience.</div>
        );
    }
}

module.exports = {
    path: 'search.html',
    component: Search
};
