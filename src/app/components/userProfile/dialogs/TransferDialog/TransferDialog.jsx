import React, { PureComponent } from 'react';
import styled from 'styled-components';
import DialogFrame from 'app/components/dialogs/DialogFrame';
import ComplexInput from 'golos-ui/ComplexInput';
import tt from 'counterpart';

const SubHeader = styled.div`
    margin-top: -15px;
    margin-bottom: 16px;
    text-align: center;
    font-size: 14px;
    color: #959595;
`;

const Body = styled.div`
    display: flex;
    margin: 0 -15px;
`;

const Column = styled.div`
    width: 288px;
    padding: 0 10px;
    //flex-basis: 288px;
    //flex-shrink: 0;
    //flex-grow: 1;
    //overflow: hidden;
`;

const SimpleInput = styled.input``;

const Section = styled.div`
    margin-bottom: 10px;
`;

const Label = styled.div`
    margin-bottom: 4px;
    font-weight: 500;
    font-size: 14px;
`;

const Note = styled.textarea`

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
                <Body>
                    <Column>
                        <Section>
                            <Label>Кому</Label>
                            <SimpleInput placeholder={'Отправить аккаунту'} />
                        </Section>
                        <Section>
                            <Label>Сколько</Label>
                            <ComplexInput />
                        </Section>
                    </Column>
                    <Column>
                        <Note placeholder={'Эта заметка является публичной'} />
                    </Column>
                </Body>
            </DialogFrame>
        );
    }

    _onCloseClick = () => {
        debugger
    };
}
