import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import is from 'styled-is';
import tt from 'counterpart';
import transaction from 'app/redux/Transaction';
import DialogFrame from 'app/components/dialogs/DialogFrame';
import DialogManager from 'app/components/elements/common/DialogManager';
import SplashLoader from 'src/app/components/golos-ui/SplashLoader';
import { Checkbox } from 'src/app/components/golos-ui/Form';
import { parseAmount } from 'src/app/helpers/currency';
import { vestsToSteem } from 'app/utils/StateFunctions';
import Shrink from 'src/app/components/golos-ui/Shrink';

const TYPES = {
    GOLOS: 'GOLOS',
    POWER: 'POWER',
};

const TYPES_TRANSLATE = {
    GOLOS: 'Голос',
    POWER: 'Силу голоса',
};

const Container = styled.div`
    width: 540px;
`;

const TypeSelect = styled.div`
    display: flex;
    margin-top: 14px;
    border-top: 1px solid #e1e1e1;
    border-bottom: 1px solid #e1e1e1;
`;

const TypeButton = styled.div.attrs({ role: 'button' })`
    flex-basis: 200px;
    flex-grow: 1;
    height: 38px;
    line-height: 38px;
    text-align: center;
    border-left: 1px solid #e1e1e1;
    color: #b7b7ba;
    user-select: none;
    cursor: pointer;

    &:first-child {
        border-left: none;
    }

    ${is('active')`
        color: #333;
    `};
`;

const Content = styled.div`
    width: 420px;
    padding: 10px 30px 14px;
`;

const SubHeader = styled.div`
    padding: 30px 30px 15px;
    border-bottom: 1px solid #e1e1e1;
    text-align: center;
    font-size: 14px;
    color: #959595;
`;

const SubHeaderLine = styled.div`
    margin-bottom: 10px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const Body = styled.div``;

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

class ConvertDialog extends PureComponent {
    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(null);
    }

    state = {
        type: TYPES.GOLOS,
        target: '',
        amount: '',
        amountInFocus: false,
        saveTo: false,
        collapsed: true,
        loader: false,
        disabled: false,
    };

    render() {
        const { myAccount } = this.props;
        const {
            target,
            amount,
            loader,
            disabled,
            collapsed,
            amountInFocus,
            type,
            saveTo,
        } = this.state;

        let balanceString = null;

        if (type === TYPES.GOLOS) {
            balanceString = myAccount.get('balance');
        } else if (type === TYPES.POWER) {
            balanceString = vestsToSteem(
                myAccount.get('vesting_shares'),
                this.props.globalProps.toJS()
            );
        }

        const balance = parseFloat(balanceString);

        const { value, error } = parseAmount(amount, balance, !amountInFocus);

        const targetCheck = saveTo ? target && target.trim() : true;

        const allow = targetCheck && value > 0 && !error && !loader && !disabled;

        const headerLines =
            type === TYPES.GOLOS
                ? [
                      'Сила Голоса неперемещаемая, её количество увеличивается при долгосрочном хранении. Чем больше у Вас Силы Голоса, тем сильней вы влияете на вознаграждения за пост и тем больше зарабатываете за голосование.',
                  ]
                : [
                      'Сила Голоса неперемещаемая, её количество увеличивается при долгосрочном хранении. Чем больше у Вас Силы Голоса, тем сильней вы влияете на вознаграждения за пост и тем больше зарабатываете за голосование.',
                      'Силу Голоса нельзя передать, и Вам потребуются 20 недель, чтобы перевести её обратно в токены GOLOS.',
                  ];

        return (
            <DialogFrame
                title={'Конвертировать в'}
                titleSize={20}
                icon="refresh"
                buttons={[
                    {
                        text: tt('g.cancel'),
                        onClick: this._onCloseClick,
                    },
                    {
                        text: 'Конвертировать',
                        primary: true,
                        disabled: !allow,
                        onClick: this._onOkClick,
                    },
                ]}
                onCloseClick={this._onCloseClick}
            >
                <Container>
                    <TypeSelect>
                        <TypeButton
                            active={type === TYPES.GOLOS}
                            onClick={type === TYPES.GOLOS ? null : this._onClickGolosType}
                        >
                            {TYPES_TRANSLATE[TYPES.GOLOS]}
                        </TypeButton>
                        <TypeButton
                            active={type === TYPES.POWER}
                            onClick={type === TYPES.POWER ? null : this._onClickPowerType}
                        >
                            {TYPES_TRANSLATE[TYPES.POWER]}
                        </TypeButton>
                    </TypeSelect>
                    <SubHeader>
                        <Shrink height={72}>
                            {headerLines.map((line, i) => (
                                <SubHeaderLine key={i}>{line}</SubHeaderLine>
                            ))}
                        </Shrink>
                    </SubHeader>
                    <Content>
                        <Body>
                            <Section>
                                <Label>Сколько</Label>
                                <SimpleInput
                                    placeholder={`Доступно ${balanceString}`}
                                    spellCheck="false"
                                    value={amount}
                                    onChange={this._onAmountChange}
                                    onFocus={this._onAmountFocus}
                                    onBlur={this._onAmountBlur}
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
                </Container>
                {loader ? <SplashLoader /> : null}
            </DialogFrame>
        );
    }

    confirmClose() {
        if (this.state.amount.trim() || this.state.saveTo ? this.state.target.trim() : true) {
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
        const { target, amount, type, saveTo, loader, disabled } = this.state;

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
            amount: parseFloat(amount.replace(/\s+/, '')).toFixed(3) + ' ' + type,
            memo: '',
            request_id: Math.floor((Date.now() / 1000) % 4294967295),
        };

        const actionType = type === TYPES.GOLOS ? 'transfer_to_savings' : 'transfer_from_savings';

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

    _onClickGolosType = () => {
        this.setState({
            type: TYPES.GOLOS,
            amount: '',
            saveTo: false,
            collapsed: true,
        });
    };

    _onClickPowerType = () => {
        this.setState({
            type: TYPES.POWER,
            amount: '',
            saveTo: false,
            collapsed: true,
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
            globalProps: state.global.get('props'),
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
)(ConvertDialog);
