import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import is from 'styled-is';
import tt from 'counterpart';
import { MIN_VOICE_POWER } from 'app/client_config';
import transaction from 'app/redux/Transaction';
import DialogFrame from 'app/components/dialogs/DialogFrame';
import DialogManager from 'app/components/elements/common/DialogManager';
import SimpleInput from 'src/app/components/golos-ui/SimpleInput';
import ComplexInput from 'src/app/components/golos-ui/ComplexInput';
import SplashLoader from 'src/app/components/golos-ui/SplashLoader';
import DialogTypeSelect from 'src/app/components/userProfile/common/DialogTypeSelect';
import { parseAmount2 } from 'src/app/helpers/currency';
import { vestsToSteem, steemToVests } from 'app/utils/StateFunctions';
import Shrink from 'src/app/components/golos-ui/Shrink';
import DelegationsList from './DelegationsList';
import { api } from 'golos-js';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import DelegationEdit from './DelegationEdit';

const TYPES = {
    DELEGATE: 'DELEGATE',
    CANCEL: 'CANCEL',
};

const Container = styled.div`
    width: 580px;
`;

const Content = styled.div`
    padding: 10px 30px 14px;
`;

const SubHeader = styled.div`
    padding: 30px;
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

const Columns = styled.div`
    display: flex;
    margin: 0 -10px;
`;

const Column = styled.div`
    flex-basis: 100px;
    flex-grow: 1;
    margin: 0 10px;
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

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
`;

class DelegateVestingDialog extends PureComponent {
    state = {
        type: TYPES.DELEGATE,
        target: '',
        amount: '',
        amountInFocus: false,
        loader: false,
        disabled: false,
        delegationError: null,
        delegationData: null,
        editAccountName: null,
    };

    componentDidMount() {
        this.props.onRef(this);

        this._loadDelegationsData();
    }

    componentWillUnmount() {
        this.props.onRef(null);
    }

    render() {
        const { myAccount, globalProps } = this.props;
        const { target, amount, loader, disabled, amountInFocus, type } = this.state;

        const { golos } = getVesting(myAccount, globalProps);

        const availableBalance = Math.max(0, Math.round((parseFloat(golos) - MIN_VOICE_POWER) * 1000));
        const availableBalanceString = (availableBalance / 1000).toFixed(3);

        const { value, error } = parseAmount2(amount, availableBalance, !amountInFocus, 1000);

        const allow = target.trim() && value > 0 && !error && !loader && !disabled;

        const hint = null;

        const params = {
            availableBalance,
            availableBalanceString,
        };

        const buttons = [
            {
                text: tt('g.cancel'),
                onClick: this._onCloseClick,
            },
        ];

        if (type === TYPES.DELEGATE) {
            buttons.push({
                text: 'Конвертировать',
                primary: true,
                disabled: !allow,
                onClick: this._onOkClick,
            });
        }

        return (
            <DialogFrame
                title={'Делегировать Силу Голоса'}
                titleSize={20}
                icon="refresh"
                buttons={buttons}
                onCloseClick={this._onCloseClick}
            >
                <Container>
                    <DialogTypeSelect
                        activeId={type}
                        buttons={[
                            { id: TYPES.DELEGATE, title: 'Делегировать' },
                            { id: TYPES.CANCEL, title: 'Текущие' },
                        ]}
                        onClick={this._onTypeClick}
                    />
                    {type === TYPES.DELEGATE ? (
                        <Fragment>
                            <SubHeader>
                                <Shrink height={72}>
                                    {this._getHintText().map((line, i) => (
                                        <SubHeaderLine key={i}>{line}</SubHeaderLine>
                                    ))}
                                </Shrink>
                            </SubHeader>
                            <Content>
                                <Body style={{ height: this._getBodyHeight() }}>
                                    {this._renderDelegateBody(params)}
                                </Body>
                                <Footer>
                                    {error ? (
                                        <ErrorLine>{error}</ErrorLine>
                                    ) : hint ? (
                                        <HintLine>{hint}</HintLine>
                                    ) : null}
                                </Footer>
                            </Content>
                        </Fragment>
                    ) : (
                        <Content>{this._renderCancelBody(params)}</Content>
                    )}
                </Container>
                {loader ? <SplashLoader /> : null}
            </DialogFrame>
        );
    }

    _renderDelegateBody({ availableBalanceString }) {
        const { target, amount } = this.state;

        return (
            <Columns>
                <Column>
                    <Section>
                        <Label>Кому</Label>
                        <SimpleInput
                            name="account"
                            spellCheck="false"
                            placeholder={'Делегировать аккаунту'}
                            value={target}
                            onChange={this._onTargetChange}
                        />
                    </Section>
                </Column>
                <Column>
                    <Section>
                        <Label>Сколько</Label>
                        <ComplexInput
                            placeholder={`Доступно ${availableBalanceString}`}
                            spellCheck="false"
                            value={amount}
                            activeId="power"
                            buttons={[{ id: 'power', title: 'СГ' }]}
                            onChange={this._onAmountChange}
                            onFocus={this._onAmountFocus}
                            onBlur={this._onAmountBlur}
                        />
                    </Section>
                </Column>
            </Columns>
        );
    }

    _renderCancelBody({ availableBalance }) {
        const { myUser, globalProps } = this.props;
        const { delegationError, delegationData, editAccountName } = this.state;

        if (delegationError) {
            return String(delegationError);
        }

        if (!delegationData) {
            return (
                <LoaderWrapper>
                    <LoadingIndicator type="circle" size={60} />
                </LoaderWrapper>
            );
        }

        let delegation = null;
        let vestingShares = null;

        if (editAccountName) {
            for (let data of delegationData) {
                if (data.delegatee === editAccountName) {
                    delegation = data;
                    vestingShares = Math.round(
                        parseFloat(vestsToSteem(data.vesting_shares, globalProps)) * 1000
                    );
                }
            }
        }

        return (
            <Fragment>
                <DelegationsList
                    myAccountName={myUser.get('username')}
                    globalProps={globalProps}
                    data={delegationData}
                    onEditClick={this._onDelegationEdit}
                    onCancelClick={this._onDelegationCancel}
                />
                {delegation ? (
                    <DelegationEdit
                        value={vestingShares}
                        max={availableBalance + vestingShares}
                        onSave={this._onDelegationEditSave}
                        onCancel={this._onDelegationEditCancel}
                    />
                ) : null}
            </Fragment>
        );
    }

    confirmClose() {
        const { amount, target } = this.state;

        if (amount.trim() || target.trim()) {
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
        const { type } = this.state;

        // This height constants taken by experimental way from actual height in browser
        // Heights needs from smooth height animation
        // TODO
        return 'auto';
    }

    _getHintText() {
        const { type } = this.state;

        switch (type) {
            case TYPES.DELEGATE:
                return [
                    'Часть своей Силы Голоса вы решили делегировать другим пользователям. В любой момент вы можете отменить делегирование.',
                    'Как дела? Тестовая строка',
                    'Как дела? Тестовая строка - 2',
                ];
            case TYPES.CANCEL:
                return [
                    'Сила Голоса неперемещаемая, её количество увеличивается при долгосрочном хранении. Чем больше у Вас Силы Голоса, тем сильней вы влияете на вознаграждения за пост и тем больше зарабатываете за голосование.',
                    'Силу Голоса нельзя передать, и Вам потребуются 20 недель, чтобы перевести её обратно в токены GOLOS.',
                ];
        }
    }

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
        const { target, amount, loader, disabled } = this.state;

        if (loader || disabled) {
            return;
        }

        this.setState({
            loader: true,
            disabled: true,
        });

        const iAm = myUser.get('username');

        const vesting = steemToVests(parseFloat(amount.replace(/\s+/, '')), this.props.globalProps);

        const operation = {
            delegator: iAm,
            delegatee: target.trim(),
            vesting_shares: vesting + ' GESTS',
        };

        this.props.delegate(operation, err => {
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

                DialogManager.info('Операция успешно завершена!');

                this._loadDelegationsData();
            }
        });
    };

    _updateDelegation(delegatee, value) {
        const { myUser } = this.props;

        const vesting = value > 0 ? steemToVests(value / 1000, this.props.globalProps) : '0.000000';

        const iAm = myUser.get('username');

        const operation = {
            delegator: iAm,
            delegatee: delegatee,
            vesting_shares: vesting + ' GESTS',
        };

        this.setState({
            disabled: true,
            loader: true,
        });

        this.props.delegate(operation, err => {
            if (err) {
                this.setState({
                    disabled: false,
                    loader: false,
                });

                if (err !== 'Canceled') {
                    DialogManager.alert(err.toString());
                }
            } else {
                this.setState({
                    disabled: false,
                    loader: false,
                    editAccountName: null,
                });

                this._loadDelegationsData();
            }
        });
    }

    _onTypeClick = type => {
        this.setState({
            type: type,
            amount: '',
            saveTo: false,
        });
    };

    async _loadDelegationsData() {
        const { myUser } = this.props;

        try {
            const result = await api.getVestingDelegationsAsync(
                myUser.get('username'),
                '',
                100,
                'delegated'
            );

            this.setState({
                delegationError: null,
                delegationData: result,
            });
        } catch (err) {
            this.setState({
                delegationError: err,
                delegationData: null,
            });
        }
    }

    _onDelegationEdit = accountName => {
        this.setState({
            editAccountName: accountName,
        });
    };

    _onDelegationCancel = async accountName => {
        if (await DialogManager.confirm()) {
            this._updateDelegation(accountName, 0);
        }
    };

    _onDelegationEditSave = value => {
        this._updateDelegation(this.state.editAccountName, value);
    };

    _onDelegationEditCancel = () => {
        this.setState({
            editAccountName: null,
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
        delegate(operation, callback) {
            dispatch(
                transaction.actions.broadcastOperation({
                    type: 'delegate_vesting_shares',
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
)(DelegateVestingDialog);

function getVesting(account, props) {
    const vesting = parseFloat(account.get('vesting_shares'));
    const delegated = parseFloat(account.get('delegated_vesting_shares'));

    const availableVesting = vesting - delegated;

    return {
        gests: availableVesting,
        golos: vestsToSteem(availableVesting.toFixed(6) + ' GESTS', props),
    };
}
