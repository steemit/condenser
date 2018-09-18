import React, { PureComponent } from 'react';
import Card, { CardContent } from 'golos-ui/Card';
import AccountPrice from 'src/app/components/userProfile/common/AccountPrice';
import RightActions from 'src/app/components/userProfile/common/RightActions';
import AccountTokens from 'src/app/components/userProfile/common/AccountTokens';
import CollapsingCard from '../../../golos-ui/CollapsingCard/CollapsingCard';

export default class RightPanel extends PureComponent {
    render() {
        const { params } = this.props;

        return (
            <Card>
                <RightActions pageAccountName={params.accountName || null} />
                <CollapsingCard title="Стоимость аккаунта" noBorder withShadow saveStateKey="price">
                    <AccountPrice accountName={params.accountName} />
                    <AccountTokens accountName={params.accountName} />
                </CollapsingCard>
            </Card>
        );
    }
}
