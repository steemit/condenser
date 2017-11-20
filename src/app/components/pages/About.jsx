import React from 'react';
import { APP_NAME, LANDING_PAGE_URL } from 'app/client_config';
import tt from 'counterpart';

class About extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="column">
                    <h6 className="float-right">v. {process.env.VERSION}</h6>
                    <h2>{tt('about_jsx.about_app', {APP_NAME})}</h2>
                    <p>
                        {tt('about_jsx.about_app_details', {APP_NAME})}
                        <br />
                        <a href={LANDING_PAGE_URL}>{tt('about_jsx.learn_more_at_app_url', {LANDING_PAGE_URL})}</a>.
                    </p>
                    <h2>{tt('about_jsx.resources')}</h2>
                    <h3><a href="https://steem.io/SteemWhitePaper.pdf" onClick={this.navigate}>{tt('navigation.APP_NAME_whitepaper', {APP_NAME})}</a> <small>[PDF]</small></h3>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'about.html',
    component: About
};
