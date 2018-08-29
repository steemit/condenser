import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PieChart from 'src/app/components/common/PieChart';
import CollapsingCard from 'src/app/components/golos-ui/CollapsingCard';
import CollapsingBlock from 'src/app/components/golos-ui/CollapsingBlock';
import { vestsToGolos } from 'app/utils/StateFunctions';

const Body = styled.div``;

const ChartBlock = styled.div`
    display: flex;
    justify-content: center;
    padding: 20px 0;
    border-bottom: 1px solid #e9e9e9;
`;

const ChartWrapper = styled.div`
    width: 170px;
    height: 170px;
`;

const Labels = styled.div``;

const CollapsingBlockStyled = styled(CollapsingBlock)`
    border-bottom: 1px solid #e9e9e9;

    &:last-child {
        border-bottom: none;
    }
`;

const Label = styled.div`
    display: flex;
    height: 52px;
    box-sizing: content-box;
    align-items: center;
`;

const ColorMark = styled.div`
    width: 14px;
    height: 14px;
    margin-right: 12px;
    border-radius: 2px;
    flex-shrink: 0;
`;

const SubColorMark = styled(ColorMark)`
    width: 8px;
    height: 8px;
    margin-left: 4px;
    margin-right: 15px;
    border-radius: 50%;
`;

const LabelTitle = styled.div`
    flex-grow: 1;
    overflow: hidden;
    white-space: nowrap;
    font-size: 14px;
    text-overflow: ellipsis;
`;

const LabelValue = styled.div`
    flex-shrink: 0;
    font-size: 14px;
    font-weight: bold;
    letter-spacing: 0.7px;
`;

const LabelBody = styled.div`
    padding: 0 20px 10px;
`;

const SubLabel = styled.div`
    display: flex;
    height: 30px;
    box-sizing: content-box;
    align-items: center;
    margin-right: 24px;

    ${LabelTitle} {
        font-size: 13px;
    }

    ${LabelValue} {
        font-size: 13px;
        font-weight: 500;
    }
`;

class AccountTokens extends PureComponent {
    state = {
        hoverIndex: null,
        collapsed: false,
    };

    constructor(props) {
        super(props);

        this._globalProps = props.globalProps.toJS();
    }

    componentWillReceiveProps(newProps) {
        if (this.props.globalProps !== newProps.globalProps) {
            this._globalProps = newProps.globalProps.toJS();
        }
    }

    render() {
        const { golos, golosSafe, gold, goldSafe, power, powerDelegated, gbgPerGolos } = this.props;
        const { hoverIndex } = this.state;

        const labels = [
            {
                id: 'golos',
                title: 'Голос',
                color: '#2879ff',
                values: [
                    {
                        title: 'Свои',
                        value: golos,
                    },
                    {
                        title: 'Сейф',
                        value: golosSafe,
                    },
                ],
            },
            {
                id: 'gold',
                title: 'Золотой',
                color: '#ffb839',
                rate: gbgPerGolos,
                values: [
                    {
                        title: 'Свои',
                        value: gold,
                    },
                    {
                        title: 'Сейф',
                        value: goldSafe,
                    },
                ],
            },
            {
                id: 'power',
                title: 'Сила голоса',
                color: '#78c2d0',
                values: [
                    {
                        title: 'Свои',
                        value: vestsToGolos(power, this._globalProps),
                    },
                    {
                        title: 'Делегированные',
                        value: vestsToGolos(powerDelegated, this._globalProps),
                    },
                ],
            },
        ];

        for (let label of labels) {
            let sum = 0;

            for (let { value } of label.values) {
                sum += parseFloat(value);
            }

            label.value = sum.toFixed(3);
        }

        return (
            <CollapsingCard title={'Распределение токенов'} saveStateKey="tokens">
                <Body>
                    <ChartBlock>
                        <ChartWrapper>
                            <PieChart
                                parts={labels.map((label, i) => ({
                                    isBig: i === hoverIndex,
                                    value: parseFloat(label.value) / (label.rate || 1),
                                    color: label.color,
                                }))}
                            />
                        </ChartWrapper>
                    </ChartBlock>
                    <Labels>
                        {labels.map((label, i) => (
                            <CollapsingBlockStyled
                                key={label.id}
                                initialCollapsed
                                saveStateKey={`tokens_${label.id}`}
                                title={() => (
                                    <Label
                                        key={label.id}
                                        onMouseEnter={() => this._onHover(i)}
                                        onMouseLeave={() => this._onHoverOut(i)}
                                    >
                                        <ColorMark style={{ backgroundColor: label.color }} />
                                        <LabelTitle>{label.title}</LabelTitle>
                                        <LabelValue>{label.value}</LabelValue>
                                    </Label>
                                )}
                            >
                                <LabelBody>
                                    {label.values.map(subLabel => (
                                        <SubLabel>
                                            <SubColorMark
                                                style={{ backgroundColor: label.color }}
                                            />
                                            <LabelTitle>{subLabel.title}</LabelTitle>
                                            <LabelValue>{subLabel.value}</LabelValue>
                                        </SubLabel>
                                    ))}
                                </LabelBody>
                            </CollapsingBlockStyled>
                        ))}
                    </Labels>
                </Body>
            </CollapsingCard>
        );
    }

    _onHover = idx => {
        this.setState({
            hoverIndex: idx,
        });
    };

    _onHoverOut = idx => {
        if (this.state.hoverIndex === idx) {
            this.setState({
                hoverIndex: null,
            });
        }
    };
}

export default connect((state, props) => {
    const account = state.global.getIn(['accounts', props.accountName]);

    return {
        golos: account.get('balance').split(' ')[0],
        golosSafe: account.get('savings_balance').split(' ')[0],
        gold: account.get('sbd_balance').split(' ')[0],
        goldSafe: account.get('savings_sbd_balance').split(' ')[0],
        power: account.get('vesting_shares'),
        powerDelegated: account.get('delegated_vesting_shares'),
        gbgPerGolos: state.global.getIn(['rates', 'GBG', 'GOLOS']),
        globalProps: state.global.get('props'),
    };
})(AccountTokens);
