import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
import { translate } from 'app/Translator';
import { TERMS_OF_SERVICE_URL, PRIVACY_POLICY_URL } from 'config/client_config';

const Footer = props => (
    <footer className="Footer row expanded">
        <div className="large-6 columns">
            <ul className="menu">
               <li><Link to="/about.html">{translate('about')}</Link></li>
               <li><Link to={PRIVACY_POLICY_URL} rel="nofollow">{translate('privacy_policy')}</Link></li>
               <li><Link to={TERMS_OF_SERVICE_URL} rel="nofollow">{translate('terms_of_service')}</Link></li>
               <li><Link to="/~witnesses">{translate('witnesses')}</Link></li>
            </ul>
        </div>
        <div className="large-6 columns">
            <div className="Footer__section float-right">
            </div>
        </div>
    </footer>
)

Footer.propTypes = {
}

export default connect(state => {
    return {
    };
})(Footer);
