import React, { PureComponent } from 'react';
import AccountPrice from 'src/app/components/userProfile/common/AccountPrice';
import RightActions from 'src/app/components/userProfile/common/RightActions';
import AccountTokens from 'src/app/components/userProfile/common/AccountTokens';

export default class RightPanel extends PureComponent {
    render() {
        const { params } = this.props;

        return (
            <div>
                <AccountPrice accountName={params.accountName} />
                <RightActions pageAccountName={params.accountName || null} />
                <AccountTokens accountName={params.accountName} />
            </div>
        );
    }
}
