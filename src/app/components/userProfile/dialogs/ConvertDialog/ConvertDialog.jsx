import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import is from 'styled-is';
import tt from 'counterpart';
import { MIN_VOICE_POWER } from 'app/client_config';
import transaction from 'app/redux/Transaction';
import DialogFrame from 'app/components/dialogs/DialogFrame';
import DialogManager from 'app/components/elements/common/DialogManager';
import SplashLoader from 'src/app/components/golos-ui/SplashLoader';
import { Checkbox } from 'src/app/components/golos-ui/Form';
import { parseAmount } from 'src/app/helpers/currency';
import { vestsToGolos, golosToVests } from 'app/utils/StateFunctions';
import Shrink from 'src/app/components/golos-ui/Shrink';
import Slider from 'src/app/components/golos-ui/Slider';
import SimpleInput from 'src/app/components/golos-ui/SimpleInput';
import ComplexInput from 'src/app/components/golos-ui/ComplexInput';
import DialogTypeSelect from 'src/app/components/userProfile/common/DialogTypeSelect';

const POWER_TO_GOLOS_INTERVAL = 13; // weeks

const TYPES = {
    GOLOS: 'GOLOS',
    POWER: 'POWER',
    GBG: 'GBG',
};

const TYPES_SELECT_TRANSLATE = {
    GOLOS: ['Голос', 'Сила голоса'],
    POWER: ['Сила голоса', 'Голос'],
    GBG: ['GBG', 'Голос'],
};

const TYPES_TRANSLATE = {
    GOLOS: 'Голос',
    POWER: 'Сила Голоса',
    GBG: 'GBG',
};

const TYPES_SUCCESS_TEXT = {
    GOLOS: 'Операция успешно завершена!',
    POWER: 'Операция запущена!',
    GBG: 'Операция запущена!',
};

const Container = styled.div`
    width: 580px;
`;

const Content = styled.div`
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

const Body = styled.div`
    height: auto;
    transition: height 0.15s;
    overflow: hidden;
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

const SliderWrapper = styled.div`
    margin-bottom: 3px;
`;

const Footer = styled.div`
    min-height: 25px;
`;

const FooterLine = styled.div`
    animation: fade-in 0.15s;
`;

const ErrorLine = FooterLine.extend`
    color: #ff4641;
`;

const HintLine = FooterLine.extend`
    font-size: 14px;
    color: #666;
`;

class ConvertDialog extends PureComponent {
    state = {
        type: TYPES.GOLOS,
        target: '',
        amount: '',
        amountInFocus: false,
        saveTo: false,
        loader: false,
        disabled: false,
    };

    constructor(props) {
        super(props);

        this._globalProps = props.globalProps.toJS();
    }

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(null);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.globalProps !== newProps.globalProps) {
            this._globalProps = newProps.globalProps.toJS();
        }
    }

    render() {
        const { myAccount } = this.props;
        const { target, amount, loader, disabled, amountInFocus, type, saveTo } = this.state;

        let balance = null;
        let balanceString = null;

        if (type === TYPES.GOLOS) {
            balanceString = myAccount.get('balance');
            balance = parseFloat(balanceString);
        } else if (type === TYPES.POWER) {
            const { golos } = getVesting(myAccount, this._globalProps);

            balance = Math.max(0, parseFloat(golos) - MIN_VOICE_POWER);
            balanceString = balance.toFixed(3);
        } else if (type === TYPES.GBG) {
            balanceString = myAccount.get('sbd_balance');
            balance = parseFloat(balanceString);
        }

        const balanceString2 = balanceString.match(/^[^\s]*/)[0];

        const { value, error } = parseAmount(amount, balance, !amountInFocus);

        const targetCheck = saveTo ? target && target.trim() : true;

        const allow = targetCheck && value > 0 && !error && !loader && !disabled;

        let hint = null;

        if (type === TYPES.POWER && value > 0) {
            const perWeek = value / POWER_TO_GOLOS_INTERVAL;
            const perWeekStr = perWeek.toFixed(3);

            hint = `Выплаты составят примерно ${perWeekStr} GOLOS в неделю.`;
        }

        return (
            <DialogFrame
                title={'Конвертировать'}
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
                    <DialogTypeSelect
                        activeId={type}
                        buttons={[
                            {
                                id: TYPES.GOLOS,
                                title: makeTitle(TYPES_SELECT_TRANSLATE[TYPES.GOLOS]),
                            },
                            {
                                id: TYPES.POWER,
                                title: makeTitle(TYPES_SELECT_TRANSLATE[TYPES.POWER]),
                            },
                            { id: TYPES.GBG, title: makeTitle(TYPES_SELECT_TRANSLATE[TYPES.GBG]) },
                        ]}
                        onClick={this._onClickType}
                    />
                    <SubHeader>
                        <Shrink height={72}>
                            {this._getHintText().map((line, i) => (
                                <SubHeaderLine key={i}>{line}</SubHeaderLine>
                            ))}
                        </Shrink>
                    </SubHeader>
                    <Content>
                        <Body style={{ height: this._getBodyHeight() }}>
                            <Section>
                                <Label>Сколько</Label>
                                <ComplexInput
                                    placeholder={`Доступно ${balanceString2}`}
                                    spellCheck="false"
                                    value={amount}
                                    onChange={this._onAmountChange}
                                    onFocus={this._onAmountFocus}
                                    onBlur={this._onAmountBlur}
                                    activeId={type}
                                    buttons={[{ id: type, title: TYPES_TRANSLATE[type] }]}
                                />
                            </Section>
                            {this._renderAdditionalSection(balance)}
                        </Body>
                        <Footer>
                            {error ? (
                                <ErrorLine>{error}</ErrorLine>
                            ) : hint ? (
                                <HintLine>{hint}</HintLine>
                            ) : null}
                        </Footer>
                    </Content>
                </Container>
                {loader ? <SplashLoader /> : null}
            </DialogFrame>
        );
    }

    _renderAdditionalSection(balance) {
        const { type, target, saveTo, amount } = this.state;

        switch (type) {
            case TYPES.GOLOS:
                return (
                    <Fragment>
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
                    </Fragment>
                );
            case TYPES.POWER:
                const cur = Math.round(parseFloat(amount.replace(/\s+/, '')) * 1000);
                const max = Math.round(balance * 1000);

                return (
                    <SliderWrapper>
                        <Slider
                            value={cur}
                            max={max}
                            showCaptions
                            hideHandleValue
                            onChange={this._onSliderChange}
                        />
                    </SliderWrapper>
                );
        }
    }

    confirmClose() {
        const { amount, saveTo, target } = this.state;

        if (amount.trim() || (saveTo ? target.trim() : false)) {
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

    _getBodyHeight() {
        const { type, saveTo } = this.state;

        // This height constants taken by experimental way from actual height in browser
        // Heights needs from smooth height animation
        switch (type) {
            case TYPES.GOLOS:
                return saveTo ? 192 : 117;
            case TYPES.POWER:
                return 138;
            case TYPES.GBG:
                return 85;
        }
    }

    _getHintText() {
        const { type } = this.state;

        switch (type) {
            case TYPES.GOLOS:
                return [
                    'Сила Голоса неперемещаемая, её количество увеличивается при долгосрочном хранении. Чем больше у Вас Силы Голоса, тем сильней вы влияете на вознаграждения за пост и тем больше зарабатываете за голосование.',
                ];
            case TYPES.POWER:
                return [
                    'Сила Голоса неперемещаемая, её количество увеличивается при долгосрочном хранении. Чем больше у Вас Силы Голоса, тем сильней вы влияете на вознаграждения за пост и тем больше зарабатываете за голосование.',
                    'Силу Голоса нельзя передать, и Вам потребуются 20 недель, чтобы перевести её обратно в токены GOLOS.',
                ];
            case TYPES.GBG:
                return [
                    'Конвертация золотых будет происходить в течении 3.5 дней с момента запуска. Отменить её нельзя. После запуска конвертации, конвертируемые монеты станут недоступны.',
                    'Токены Золотой ликвидны и их можно передавать между аккаунтами. Перед запуском конвертации, проверьте опции Купить или Продать Золотой, на внутренней бирже. Также, токен Золотой, доступен к выводу (и торговле) на внешних биржах.',
                    'Неделя отсрочки, путем автоматической конвертации, необходима, в целях предотвращения злоупотребления спекуляцией, по средней ценовой котировке.',
                ];
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

        let operationType;
        let operation;

        if (type === TYPES.GOLOS) {
            operationType = 'transfer_to_vesting';
            operation = {
                from: iAm,
                to: saveTo ? target.trim() : iAm,
                amount: parseFloat(amount.replace(/\s+/, '')).toFixed(3) + ' GOLOS',
                memo: '',
                //request_id: Math.floor((Date.now() / 1000) % 4294967296),
            };
        } else if (type === TYPES.POWER) {
            operationType = 'withdraw_vesting';

            const vesting = golosToVests(parseFloat(amount.replace(/\s+/, '')), this._globalProps);

            operation = {
                account: iAm,
                vesting_shares: vesting + ' GESTS',
            };
        } else if (type === TYPES.GBG) {
            operationType = 'convert';
            operation = {
                owner: iAm,
                amount: parseFloat(amount.replace(/\s+/, '')).toFixed(3) + ' GBG',
                requestid: Math.floor(Date.now() / 1000),
            };
        }

        this.props.transfer(operationType, operation, err => {
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

                DialogManager.info(TYPES_SUCCESS_TEXT[type]).then(() => {
                    this.props.onClose();
                });
            }
        });
    };

    _onClickType = type => {
        this.setState({
            type: type,
            amount: '',
            saveTo: false,
        });
    };

    _onSliderChange = value => {
        let amount = '';

        if (value > 0) {
            amount = (value / 1000).toFixed(3);
        }

        this.setState({
            amount,
        });
    };
}

export default connect(
    state => {
        const globalProps = state.global.get('props');
        const myUser = state.user.get('current');
        const myAccount = myUser ? state.global.getIn(['accounts', myUser.get('username')]) : null;

        return {
            myUser,
            myAccount,
            globalProps,
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

function getVesting(account, props) {
    const vesting = parseFloat(account.get('vesting_shares'));
    const delegated = parseFloat(account.get('delegated_vesting_shares'));

    const availableVesting = vesting - delegated;

    return {
        golos: vestsToGolos(availableVesting.toFixed(6) + ' GESTS', props),
    };
}

function makeTitle([a, b]) {
    return a + ' → ' + b;
}
