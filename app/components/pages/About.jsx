import React from 'react';
import { APP_NAME, APP_URL } from 'app/client_config';
import tt from 'counterpart';

class About extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="column">
                    <div className="float-right"><a href="#" onClick={e => {e.preventDefault(); alert(process.env.VERSION)}}>{tt('g.version')}</a></div>
                    <h2>{tt('about_jsx.about_app', {APP_NAME})}</h2>
                    <p>
                        {tt('about_jsx.about_app_details')}
                        <a href="https://steem.io/">{tt('about_jsx.learn_more_at_app_url', {APP_URL})}</a>.
                    </p>
                    <h2>{tt('about_jsx.resources')}</h2>
                    <h3><a href="https://steem.io/SteemWhitePaper.pdf" onClick={this.navigate}>{tt('navigation.APP_NAME_whitepaper', {APP_NAME})}</a> <small>[PDF]</small></h3>
                    <h3><a href="http://steem.herokuapp.com" target="_blank">{tt('about_jsx.join_our_slack')}</a></h3>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'about.html',
    component: About
};
