import React, { PureComponent } from 'react';
import AccountPrice from 'src/app/components/userProfile/common/AccountPrice';
import RightActions from 'src/app/components/userProfile/common/RightActions';
import TokenDistribution from 'src/app/components/userProfile/common/TokenDistribution';

export default class RightPanel extends PureComponent {
    render() {
        const { params } = this.props;

        return (
            <div>
                <AccountPrice />
                <RightActions pageAccountName={params.accountName || null} />
                <TokenDistribution accountName={params.accountName} />
            </div>
        );
    }
}
