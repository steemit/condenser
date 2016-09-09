import React from 'react';
import { translate } from 'app/Translator';
import { LANDING_PAGE_URL, WHITEPAPER_URL } from 'config/client_config';

class About extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="column">
                    <div className="float-right"><a href="#" onClick={e => {e.preventDefault(); alert(process.env.VERSION)}}>{translate('version')}</a></div>
                <h2>{translate('about_steemit')}</h2>
                    <p>
                        {translate('steemit_is_a_social_media_platform_where_everyone_gets_paid')}
                        <a href={LANDING_PAGE_URL}>{translate('learn_more_at_steem_io')}</a>.
                    </p>
                    <h2>{translate('resources')}</h2>
                <h3><a href={WHITEPAPER_URL} onClick={this.navigate}>{translate('steem_whitepaper')}</a> <small>[PDF]</small></h3>
            <h3><a href="http://steem.herokuapp.com" target="_blank">{translate('join_our_slack')}</a></h3>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'about.html',
    component: About
};
