import React from 'react';
import { Link } from 'react-router';
import tt from 'counterpart';

export default class LpHeader extends React.Component {
    render() {
        return (
            <header className="LpHeader">
                <div className="top-bar">
                    <div className="top-bar-left">
                    </div>
                    <div className="top-bar-right">
                        <ul className="menu">
                            <li><Link to="/trending" activeClassName="active">{tt('g.browse')}</Link></li>
                        </ul>
                    </div>
                </div>
            </header>
        );
    }
}
