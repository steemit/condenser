import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import is from 'styled-is';
import tt from 'counterpart';
import transaction from 'app/redux/Transaction';
import DialogFrame from 'app/components/dialogs/DialogFrame';
import SimpleInput from 'golos-ui/SimpleInput';
import ComplexInput from 'golos-ui/ComplexInput';
import DialogManager from 'app/components/elements/common/DialogManager';
import SplashLoader from 'src/app/components/golos-ui/SplashLoader';
import { Checkbox } from 'src/app/components/golos-ui/Form';
import { parseAmount } from 'src/app/helpers/currency';
import DialogTypeSelect from 'src/app/components/userProfile/common/DialogTypeSelect';
import { fetchCurrentStateAction } from 'src/app/redux/actions/fetch';

const TYPES = {
    SAVE: 'SAVE',
    RECEIVE: 'RECEIVE',
};

const CURRENCIES = {
    GBG: 'GBG',
    GOLOS: 'GOLOS',
};

const Content = styled.div`
    width: 348px;
    padding: 10px 30px 14px;
`;

const SubHeader = styled.div`
    margin: 10px 0 20px;
    text-align: center;
    font-size: 14px;
    color: #959595;
`;

const Body = styled.div``;

const Section = styled.div`
    margin: 10px 0;

    ${is('flex')`
        display: flex;
    `};
`;

const Label = styled.div`
    margin-bottom: 9px;
    font-size: 14px;
`;

const ErrorBlock = styled.div`
    min-height: 25px;
`;

const ErrorLine = styled.div`
    color: #ff4641;
    animation: fade-in 0.15s;
`;

class SafeDialog extends PureComponent {
    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(null);
    }

    state = {
        type: TYPES.SAVE,
        target: '',
        amount: '',
        currency: CURRENCIES.GBG,
        amountInFocus: false,
        saveTo: false,
        loader: false,
        disabled: false,
    };

    render() {
        const { myAccount } = this.props;
        const {
            target,
            amount,
            currency,
            loader,
            disabled,
            amountInFocus,
            type,
            saveTo,
        } = this.state;

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

        let currencyKey = null;

        if (type === TYPES.SAVE) {
            if (currency === CURRENCIES.GOLOS) {
                currencyKey = 'balance';
            } else if (currency === CURRENCIES.GBG) {
                currencyKey = 'sbd_balance';
            }
        } else {
            if (currency === CURRENCIES.GOLOS) {
                currencyKey = 'savings_balance';
            } else if (currency === CURRENCIES.GBG) {
                currencyKey = 'savings_sbd_balance';
            }
        }

        const balance = parseFloat(myAccount.get(currencyKey));

        const { value, error } = parseAmount(amount, balance, !amountInFocus);

        const targetCheck = saveTo ? target && target.trim() : true;

        const allow = targetCheck && value > 0 && !error && !loader && !disabled;

        return (
            <DialogFrame
                title={'Сейф'}
                titleSize={20}
                icon="locked"
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
                <DialogTypeSelect
                    activeId={type}
                    buttons={[
                        { id: TYPES.SAVE, title: 'Перевести' },
                        { id: TYPES.RECEIVE, title: 'Вывести' },
                    ]}
                    onClick={this._onTypeClick}
                />
                <Content>
                    <SubHeader>
                        {type === TYPES.SAVE
                            ? 'Перевод в сейф делается для безопасности и сохранности ваших средств, если есть подозрение, что пароль мог быть скомпрометирован. Токены в сейф попадают мгновенно.'
                            : 'Вывод средств происходит в течение трех дней'}
                    </SubHeader>
                    <Body>
                        <Section>
                            <Label>Сколько</Label>
                            <ComplexInput
                                placeholder={`Доступно ${balance.toFixed(3)}`}
                                spellCheck="false"
                                value={amount}
                                activeId={currency}
                                buttons={buttons}
                                onChange={this._onAmountChange}
                                onFocus={this._onAmountFocus}
                                onBlur={this._onAmountBlur}
                                onActiveChange={this._onCurrencyChange}
                            />
                        </Section>
                        <Section flex>
                            <Checkbox
                                title="Перевести на другой аккаунт"
                                inline
                                value={saveTo}
                                onChange={this._onSaveTypeChange}
                            />
                        </Section>
                        {saveTo ? (
                            <Section>
                                <Label>Кому</Label>
                                <SimpleInput
                                    name="account"
                                    spellCheck="false"
                                    placeholder={'Отправить аккаунту'}
                                    value={target}
                                    onChange={this._onTargetChange}
                                />
                            </Section>
                        ) : null}
                    </Body>
                    <ErrorBlock>{error ? <ErrorLine>{error}</ErrorLine> : null}</ErrorBlock>
                </Content>
                {loader ? <SplashLoader /> : null}
            </DialogFrame>
        );
    }

    confirmClose() {
        if (this.state.amount.trim() || (this.state.saveTo ? this.state.target.trim() : false)) {
            DialogManager.dangerConfirm('Вы действительно хотите закрыть окно?').then(y => {
                if (y) {
                    this.props.onClose();
                }
            });

            return false;
        } else {
            return true;
        }
    }

    _onSaveTypeChange = checked => {
        this.setState({
            saveTo: checked,
        });
    };

    _onAmountChange = e => {
        this.setState({
            amount: e.target.value.replace(/[^\d .]+/g, '').replace(/,/g, '.'),
        });
    };

    _onAmountFocus = () => {
        this.setState({
            amountInFocus: true,
        });
    };

    _onAmountBlur = () => {
        this.setState({
            amountInFocus: false,
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
        const { target, amount, currency, type, saveTo, loader, disabled } = this.state;

        if (loader || disabled) {
            return;
        }

        this.setState({
            loader: true,
            disabled: true,
        });

        const iAm = myUser.get('username');

        const operation = {
            from: iAm,
            to: saveTo ? target.trim() : iAm,
            amount: parseFloat(amount.replace(/\s+/, '')).toFixed(3) + ' ' + currency,
            memo: '',
            request_id: Math.floor((Date.now() / 1000) % 4294967296),
        };

        const actionType = type === TYPES.SAVE ? 'transfer_to_savings' : 'transfer_from_savings';

        this.props.transfer(actionType, operation, err => {
            if (err) {
                this.setState({
                    loader: false,
                    disabled: false,
                });

                if (err !== 'Canceled') {
                    DialogManager.alert(err.toString());
                }
            } else {
                this.setState({
                    loader: false,
                });

                DialogManager.info('Операция успешно завершена!').then(() => {
                    this.props.onClose();
                });
            }
        });
    };

    _onTypeClick = type => {
        this.setState({
            type: type,
            amount: '',
            saveTo: false,
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
        transfer(type, operation, callback) {
            dispatch(
                transaction.actions.broadcastOperation({
                    type,
                    operation,
                    successCallback() {
                        callback(null);

                        if (location.pathname.endsWith('/transfers')) {
                            dispatch(fetchCurrentStateAction());
                        }
                    },
                    errorCallback(err) {
                        callback(err);
                    },
                })
            );
        },
    })
)(SafeDialog);
