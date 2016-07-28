import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';

const Footer = props => (
    <footer className="Footer row expanded">
        <div className="large-6 columns">
            <ul className="menu">
               <li><Link to="/about.html">About</Link></li>
               <li><Link to="/privacy.html" rel="nofollow">Privacy Policy</Link></li>
               <li><Link to="/tos.html" rel="nofollow">Terms of Service</Link></li>
               <li><Link to="/~witnesses">Witnesses</Link></li>
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
