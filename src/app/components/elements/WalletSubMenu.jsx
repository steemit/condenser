import React from 'react';
import { Link } from 'react-router';
import tt from 'counterpart';

export default ({ account_name }) => {
    return (
        <ul className="WalletSubMenu menu">
            <li>
                <Link
                    to={`/@${account_name}/transfers`}
                    activeClassName="active"
                >
                    {tt('g.balances')}
                </Link>
            </li>
            <li>
                <Link
                    to={`/@${account_name}/permissions`}
                    activeClassName="active"
                >
                    {tt('g.permissions')}
                </Link>
            </li>
            <li>
                <Link
                    to={`/@${account_name}/password`}
                    activeClassName="active"
                >
                    {tt('g.password')}
                </Link>
            </li>
        </ul>
    );
};
