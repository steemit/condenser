import React from 'react';
import { Link } from 'react-router';
import NotifiCounter from 'app/components/elements/NotifiCounter';
import tt from 'counterpart';
import {linkBuilder} from 'app/Routes';

export default ({account_name}) => {
    return <ul className="WalletSubMenu menu">
        <li>
            <Link to={linkBuilder.userWallet(account_name)} activeClassName="active">
                {tt('g.balances')} <NotifiCounter fields="send,receive" />
            </Link>
        </li>
        <li>
            <Link to={linkBuilder.userPermissions(account_name)} activeClassName="active">
                {tt('g.permissions')} <NotifiCounter fields="account_update" />
            </Link>
        </li>
        <li>
            <Link to={linkBuilder.userPassword(account_name)} activeClassName="active">{tt('g.password')}</Link>
        </li>
    </ul>
}
