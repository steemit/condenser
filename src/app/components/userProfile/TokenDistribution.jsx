import React, { PureComponent } from 'react';
import styled from 'styled-components';
import PieChart from 'src/app/components/common/PieChart';
import CollapsingCard from '../golos-ui/CollapsingCard/CollapsingCard';

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

export default class TokenDistribution extends PureComponent {
    state = {
        collapsed: false,
    };

    render() {
        const labels = [
            {
                title: 'Голос',
                color: '#2879ff',
                value: '0.001',
            },
            {
                title: 'Золотой',
                color: '#ffb839',
                value: '3,394.904',
            },
            {
                title: 'Сила голоса',
                color: '#78c2d0',
                value: '21,394.84',
            },
            {
                title: 'Сейф',
                color: '#583652',
                value: '3,394.904',
            },
        ];

        return (
            <CollapsingCard title={'Распределение токенов'}>
                <Body>
                    <ChartBlock>
                        <ChartWrapper>
                            <PieChart
                                parts={[
                                    { value: 3, color: '#ffb839' },
                                    { value: 2, color: '#78c2d0' },
                                    { value: 1, color: '#583652' },
                                    { value: 9, color: '#2879ff' },
                                ]}
                            />
                        </ChartWrapper>
                    </ChartBlock>
                    <Labels>
                        {labels.map(label => (
                            <Label key={label.title}>
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
}
