import React, { PureComponent } from 'react';
import AccountPrice from 'src/app/components/userProfile/AccountPrice';
import RightActions from 'src/app/components/userProfile/RightActions';
import TokenDistribution from 'src/app/components/userProfile/TokenDistribution';

export default class RightPanel extends PureComponent {
    render() {
        return (
            <div>
                <AccountPrice />
                <RightActions />
                <TokenDistribution />
            </div>
        );
    }
}
