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

const SimpleInput = styled.input`
    display: block;
    width: 100%;
    height: 34px;
    padding: 0 11px;
    border: 1px solid #e1e1e1;
    outline: none;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.25s;

    &:focus {
        border-color: #8a8a8a;
    }
`;

const Section = styled.div`
    margin-bottom: 10px;
`;

const Label = styled.div`
    margin: 14px 0 9px;
    font-size: 14px;
`;

const Note = styled.textarea`
    display: block;
    width: 100%;
    height: 116px;
    padding: 7px 11px;
    border: 1px solid #e1e1e1;
    outline: none;
    border-radius: 6px;
    resize: none;
    font-size: 14px;
    box-shadow: none !important;
`;

export default class TransferDialog extends PureComponent {
    state = {
        amount: '',
        currency: 'gbg',
    };

    render() {
        const { amount, currency } = this.state;

        const buttons = [
            {
                id: 'gbg',
                title: 'GBG',
            },
            {
                id: 'golos',
                title: tt('token_names.LIQUID_TOKEN'),
            },
        ];

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
                            <ComplexInput
                                placeholder={'Доступно 5.543'}
                                value={amount}
                                activeId={currency}
                                buttons={buttons}
                                onChange={this._onAmountChange}
                                onActiveChange={this._onCurrencyChange}
                            />
                        </Section>
                    </Column>
                    <Column>
                        <Section>
                            <Label>Заметка</Label>
                            <Note placeholder={'Эта заметка является публичной'} />
                        </Section>
                    </Column>
                </Body>
            </DialogFrame>
        );
    }

    _onCloseClick = () => {
        debugger;
    };

    _onAmountChange = value => {
        this.setState({
            amount: value,
        });
    };

    _onCurrencyChange = currency => {
        this.setState({
            currency,
        });
    }
}
