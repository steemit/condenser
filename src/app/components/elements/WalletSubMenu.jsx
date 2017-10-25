import React from 'react';
import { Link } from 'react-router';
import NotifiCounter from 'app/components/elements/NotifiCounter';
import tt from 'counterpart';
import {pathTo} from 'app/Routes';

export default ({account_name}) => {
    return <ul className="WalletSubMenu menu">
        <li>
            <Link to={pathTo.userWallet(account_name)} activeClassName="active">
                {tt('g.balances')} <NotifiCounter fields="send,receive" />
            </Link>
        </li>
        <li>
            <Link to={pathTo.userPermissions(account_name)} activeClassName="active">
                {tt('g.permissions')} <NotifiCounter fields="account_update" />
            </Link>
        </li>
        <li>
            <Link to={pathTo.userPassword(account_name)} activeClassName="active">{tt('g.password')}</Link>
        </li>
    </ul>
}
