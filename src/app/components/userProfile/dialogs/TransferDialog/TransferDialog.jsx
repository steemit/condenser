import React, { PureComponent } from 'react';
import styled from 'styled-components';
import DialogFrame from 'app/components/dialogs/DialogFrame';
import tt from 'counterpart';

const SubHeader = styled.div`
    text-align: center;
    font-size: 14px;
    color: #959595;
`;

export default class TransferDialog extends PureComponent {
    render() {
        return (
            <DialogFrame
                className="LinkOptionsDialog"
                title={'Передать пользователю'}
                icon="coins"
                buttons={[
                    {
                        text: tt('g.cancel'),
                        onClick: this._onCloseClick,
                    },
                    {
                        text: 'Передать',
                        primary: true,
                        onClick: this._onOkClick,
                    },
                ]}
                onCloseClick={this._onCloseClick}
            >
                <SubHeader>Отправить средства на другой счет.</SubHeader>
            </DialogFrame>
        );
    }

    _onCloseClick = () => {
        debugger
    };
}
