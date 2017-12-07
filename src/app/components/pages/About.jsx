import React from 'react';
import { APP_NAME, APP_URL } from 'app/client_config';
import tt from 'counterpart';
import { pathTo } from 'app/Routes';

class About extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="column">
                    <div className="float-right">
                        <a
                            href="#"
                            onClick={e => {
                                e.preventDefault();
                                alert(process.env.VERSION);
                            }}
                        >
                            {tt('g.version')}
                        </a>
                    </div>
                    <h2>{tt('about_jsx.about_app', { APP_NAME })}</h2>
                    <p>
                        {tt('about_jsx.about_app_details', { APP_NAME })}
                        <br />
                        <a href="https://steem.io/">
                            {tt('about_jsx.learn_more_at_app_url')}
                        </a>.
                    </p>
                    <h2>{tt('about_jsx.resources')}</h2>
                    <h3>
                        <a
                            href="https://steem.io/SteemWhitePaper.pdf"
                            onClick={this.navigate}
                        >
                            {tt('navigation.APP_NAME_whitepaper', { APP_NAME })}
                        </a>{' '}
                        <small>[PDF]</small>
                    </h3>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: pathTo.about(),
    component: About,
};
