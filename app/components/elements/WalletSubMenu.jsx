import React from 'react';
import { Link } from 'react-router';
import NotifiCounter from 'app/components/elements/NotifiCounter';
import { translate } from 'app/Translator';


export default ({account_name}) => {
    return <ul className="WalletSubMenu menu">
        <li>
            <Link to={`/@${account_name}/transfers`} activeClassName="active">
                {translate('balances')} <NotifiCounter fields="send,receive" />
            </Link>
        </li>
        <li>
            <Link to={`/@${account_name}/permissions`} activeClassName="active">
                {translate('permissions')} <NotifiCounter fields="account_update" />
            </Link>
        </li>
        <li>
            <Link to={`/@${account_name}/password`} activeClassName="active">{translate('password')}</Link>
        </li>
    </ul>
}
