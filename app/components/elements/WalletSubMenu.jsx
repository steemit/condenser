import React from 'react';
import { Link } from 'react-router';
import NotifiCounter from 'app/components/elements/NotifiCounter';
import tt from 'counterpart';


export default ({account_name}) => {
    return <ul className="WalletSubMenu menu">
        <li>
            <Link to={`/@${account_name}/transfers`} activeClassName="active">
                {tt('balances')} <NotifiCounter fields="send,receive" />
            </Link>
        </li>
        <li>
            <Link to={`/@${account_name}/permissions`} activeClassName="active">
                {tt('permissions')} <NotifiCounter fields="account_update" />
            </Link>
        </li>
        <li>
            <Link to={`/@${account_name}/password`} activeClassName="active">{tt('password')}</Link>
        </li>
    </ul>
}
