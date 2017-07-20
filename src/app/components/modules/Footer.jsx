import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
import tt from 'counterpart';

const Footer = props => (
    <footer className="Footer row expanded">
        <div className="large-6 columns">
            <ul className="menu">
               <li><Link to="/about.html">{tt('navigation.about')}</Link></li>
               <li><Link to="/privacy.html" rel="nofollow">{tt('navigation.privacy_policy')}</Link></li>
               <li><Link to="/tos.html" rel="nofollow">{tt('navigation.terms_of_service')}</Link></li>
               <li><Link to="/~witnesses">{tt('navigation.witnesses')}</Link></li>
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
