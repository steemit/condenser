import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import is from 'styled-is';
import transaction from 'app/redux/Transaction';
import DialogFrame from 'app/components/dialogs/DialogFrame';
import ComplexInput from 'golos-ui/ComplexInput';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import tt from 'counterpart';
import DialogManager from 'app/components/elements/common/DialogManager';

const CURRENCIES = {
    GBG: 'GBG',
    GOLOS: 'GOLOS',
};

const DialogFrameStyled = styled(DialogFrame)`
    .Dialog__content {
        padding-bottom: 14px;
    }
`;

const SubHeader = styled.div`
    margin-top: -15px;
    margin-bottom: 16px;
    text-align: center;
    font-size: 14px;
    color: #959595;
`;

const Body = styled.div`
    display: flex;
    margin: 0 -10px;
`;

const Column = styled.div`
    width: 288px;
    padding: 0 10px;
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

const ErrorBlock = styled.div`
    min-height: 24px;
`;

const ErrorLine = styled.div`
    color: #ff4641;
    animation: fade-in 0.15s;
`;

const LoaderSplash = styled.div`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(155, 155, 155, 0.2);
    opacity: 0;
    animation: fade-in 0.5s forwards;
    animation-delay: 0.2s;
    z-index: 1;
`;

class TransferDialog extends PureComponent {
    static propTypes = {
        pageAccountName: PropTypes.string,
    };

    constructor(props) {
        super(props);

        this.state = {
            target: this.props.pageAccountName || '',
            amount: '',
            currency: CURRENCIES.GBG,
            note: '',
            loader: false,
        };
    }

    render() {
        const { myAccount } = this.props;
        const { target, amount, currency, note, loader } = this.state;

        const buttons = [
            {
                id: CURRENCIES.GBG,
                title: 'GBG',
            },
            {
                id: CURRENCIES.GOLOS,
                title: tt('token_names.LIQUID_TOKEN'),
            },
        ];

        let balance = null;

        if (currency === CURRENCIES.GOLOS) {
            balance = parseFloat(myAccount.get('balance'));
        } else if (currency === CURRENCIES.GBG) {
            balance = parseFloat(myAccount.get('sbd_balance'));
        }

        const amountFixed = amount.trim().replace(/\s+/, '');

        const amountValue = parseFloat(amountFixed);

        let error;

        const match = amountFixed.match(/\.(\d+)/);

        if (match && match[1].length > 3) {
            error = 'Можно использовать только 3 знака после запятой';
        } else if (amountValue && amountValue > balance) {
            error = 'Недостаточно средств';
        } else if (!/^\d*(?:\.\d*)?$/.test(amountFixed)) {
            error = 'Неправильный формат';
        }

        const allow = target && target.trim() && amountValue > 0 && !error && !loader;

        return (
            <DialogFrameStyled
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
                        disabled: !allow,
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
                            <SimpleInput
                                placeholder={'Отправить аккаунту'}
                                value={target}
                                onChange={this._onTargetChange}
                            />
                        </Section>
                        <Section>
                            <Label>Сколько</Label>
                            <ComplexInput
                                placeholder={`Доступно ${balance}`}
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
                            <Note
                                placeholder={'Эта заметка является публичной'}
                                value={note}
                                onChange={this._onNoteChange}
                            />
                        </Section>
                    </Column>
                </Body>
                <ErrorBlock>{error ? <ErrorLine>{error}</ErrorLine> : null}</ErrorBlock>
                {loader ? (
                    <LoaderSplash>
                        <LoadingIndicator type="circle" size={60} />
                    </LoaderSplash>
                ) : null}
            </DialogFrameStyled>
        );
    }

    _onNoteChange = e => {
        this.setState({
            note: e.target.value,
        });
    };

    _onAmountChange = e => {
        this.setState({
            amount: e.target.value.replace(/[^\d .]+/g, ''),
        });
    };

    _onCurrencyChange = currency => {
        this.setState({
            currency,
        });
    };

    _onTargetChange = e => {
        this.setState({
            target: e.target.value,
        });
    };

    _onCloseClick = () => {
        this.props.onClose();
    };

    _onOkClick = () => {
        const { myUser } = this.props;
        const { target, amount, currency, note } = this.state;

        const operation = {
            from: myUser.get('username'),
            to: target.trim(),
            amount: parseFloat(amount.replace(/\s+/, '')).toFixed(3) + ' ' + currency,
            memo: note,
        };

        this.setState({
            loader: true,
        });

        this.props.transfer(operation, err => {
            if (err) {
                this.setState({
                    loader: false,
                });

                if (err === 'Canceled') {
                    return;
                }

                DialogManager.alert(err.toString());
            } else {
                DialogManager.info(`Перевод на аккаунт ${operation.to} успешно завершен!`);
                this.props.onClose();
            }
        });
    };
}

export default connect(
    state => {
        const myUser = state.user.getIn(['current']);
        const myAccount = myUser ? state.global.getIn(['accounts', myUser.get('username')]) : null;

        return {
            myUser,
            myAccount,
        };
    },
    dispatch => ({
        transfer(operation, callback) {
            dispatch(
                transaction.actions.broadcastOperation({
                    type: 'transfer',
                    operation,
                    successCallback() {
                        callback(null);

                        const path = location.pathname.substr(1);

                        if (path.endsWith('/transfers')) {
                            dispatch({
                                type: 'FETCH_STATE',
                                payload: {
                                    pathname: path,
                                },
                            });
                        }
                    },
                    errorCallback(err) {
                        callback(err);
                    },
                })
            );
        },
    })
)(TransferDialog);
