import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PieChart from 'src/app/components/common/PieChart';
import CollapsingCard from 'src/app/components/golos-ui/CollapsingCard';
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

const Label = styled.div`
    display: flex;
    height: 52px;
    box-sizing: content-box;
    align-items: center;
    padding: 0 20px;
    border-bottom: 1px solid #e9e9e9;

    &:last-child {
        border-bottom: none;
    }
`;

const ColorMark = styled.div`
    width: 14px;
    height: 14px;
    margin-right: 12px;
    border-radius: 2px;
    flex-shrink: 0;
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

class TokenDistribution extends PureComponent {
    state = {
        hoverIndex: null,
        collapsed: false,
    };

    render() {
        const { golos, golosSafe, gold, goldSafe, power, gbgPerGolos, globalProps } = this.props;
        const { hoverIndex } = this.state;

        const labels = [
            {
                title: 'Голос',
                color: '#2879ff',
                value: golos,
            },
            {
                title: 'Голос (сейф)',
                color: '#583652',
                value: golosSafe,
            },
            {
                title: 'Золотой',
                color: '#ffb839',
                value: gold,
                rate: gbgPerGolos,
            },
            {
                title: 'Золотой (сейф)',
                color: '#583652',
                value: goldSafe,
            },
            {
                title: 'Сила голоса',
                color: '#78c2d0',
                value: vestsToGolos(power, globalProps),
            },
        ];

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
                            <Label
                                key={label.title}
                                onMouseEnter={() => this._onHover(i)}
                                onMouseLeave={() => this._onHoverOut(i)}
                            >
                                <ColorMark style={{ backgroundColor: label.color }} />
                                <LabelTitle>{label.title}</LabelTitle>
                                <LabelValue>{label.value}</LabelValue>
                            </Label>
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
        gbgPerGolos: state.global.getIn(['rates', 'gbgPerGolos']),
        globalProps: state.global.get('props').toJS(),
    };
})(TokenDistribution);
