import React, { PureComponent, Fragment } from 'react';
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
import { vestsToSteem, steemToVests } from 'app/utils/StateFunctions';
import Shrink from 'src/app/components/golos-ui/Shrink';
import Slider from 'src/app/components/golos-ui/Slider';

const TYPES = {
    GOLOS: 'GOLOS',
    POWER: 'POWER',
    GBG: 'GBG',
};

const TYPES_TRANSLATE = {
    GOLOS: ['Голос', 'Сила голоса'],
    POWER: ['Сила голоса', 'Голос'],
    GBG: ['GBG', 'Голос'],
};

const TYPES_SUCCESS_TEXT = {
    GOLOS: 'Операция успешно завершена!',
    POWER: 'Операция запущена!',
    GBG: 'Операция запущена!',
};

const Container = styled.div`
    width: 580px;
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
    font-size: 15px;
    color: #b7b7ba;
    user-select: none;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:first-child {
        border-left: none;
    }

    ${is('active')`
        color: #333;
    `};
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
        loader: false,
        disabled: false,
    };

    render() {
        const { myAccount, globalProps } = this.props;
        const { target, amount, loader, disabled, amountInFocus, type, saveTo } = this.state;

        let balanceString = null;
        let balanceReal = null;

        if (type === TYPES.GOLOS) {
            balanceString = myAccount.get('balance');
        } else if (type === TYPES.POWER) {
            const { golos, gests } = getVesting(myAccount, globalProps);
            balanceReal = gests;
            balanceString = golos;
        } else if (type === TYPES.GBG) {
            balanceString = myAccount.get('sbd_balance');
        }

        const balance = parseFloat(balanceString);

        const { value, error } = parseAmount(amount, balance, !amountInFocus);

        const targetCheck = saveTo ? target && target.trim() : true;

        const allow = targetCheck && value > 0 && !error && !loader && !disabled;

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
                    <TypeSelect>
                        {this._renderTypeButton(TYPES.GOLOS)}
                        {this._renderTypeButton(TYPES.POWER)}
                        {this._renderTypeButton(TYPES.GBG)}
                    </TypeSelect>
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
                                <SimpleInput
                                    placeholder={`Доступно ${balanceString}`}
                                    spellCheck="false"
                                    value={amount}
                                    onChange={this._onAmountChange}
                                    onFocus={this._onAmountFocus}
                                    onBlur={this._onAmountBlur}
                                />
                            </Section>
                            {this._renderAdditionalSection(balanceReal)}
                        </Body>
                        <ErrorBlock>{error ? <ErrorLine>{error}</ErrorLine> : null}</ErrorBlock>
                    </Content>
                </Container>
                {loader ? <SplashLoader /> : null}
            </DialogFrame>
        );
    }

    _renderTypeButton(renderType) {
        const { type } = this.state;
        const isActive = type === renderType;

        const [from, to] = TYPES_TRANSLATE[renderType];

        return (
            <TypeButton
                active={isActive}
                onClick={isActive ? null : () => this._onClickType(renderType)}
            >
                {from + ' → ' + to}
            </TypeButton>
        );
    }

    _renderAdditionalSection(balanceReal) {
        const { globalProps } = this.props;
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
                const cur = Math.floor(
                    steemToVests(parseFloat(amount.replace(/\s+/, '')), globalProps) * 1000000
                );
                const max = Math.floor(balanceReal * 1000000);

                return (
                    <Slider
                        value={cur}
                        max={max}
                        showCaptions
                        hideHandleValue
                        onChange={this._onSliderChange}
                    />
                );
        }
    }

    confirmClose() {
        const { type, amount, saveTo, target } = this.state;

        let amountChanged = false;

        if (type === TYPES.POWER) {
            amountChanged = amount.trim() !== this._powerInitialAmount;
        } else {
            amountChanged = Boolean(amount.trim());
        }

        if (amountChanged || (saveTo ? target.trim() : false)) {
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

        switch (type) {
            case TYPES.GOLOS:
                return saveTo ? 192 : 117;
            case TYPES.POWER:
                return 135;
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

            const vesting = steemToVests(
                parseFloat(amount.replace(/\s+/, '')),
                this.props.globalProps
            );

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

        console.log('call transfer', operationType, operation);

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
        if (type === TYPES.POWER) {
            const { golos } = getVesting(this.props.myAccount, this.props.globalProps);

            this._powerInitialAmount = golos;

            this.setState({
                type: TYPES.POWER,
                amount: golos,
                saveTo: false,
            });
        } else {
            this.setState({
                type: type,
                amount: '',
                saveTo: false,
            });
        }
    };

    _onSliderChange = value => {
        this.setState({
            amount: vestsToSteem((value / 1000000).toFixed(6) + ' GESTS', this.props.globalProps),
        });
    };
}

export default connect(
    state => {
        const myUser = state.user.get('current');
        const myAccount = myUser ? state.global.getIn(['accounts', myUser.get('username')]) : null;

        return {
            myUser,
            myAccount,
            globalProps: state.global.get('props').toJS(),
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
        gests: availableVesting,
        golos: vestsToSteem(availableVesting.toFixed(6) + ' GESTS', props),
    };
}
