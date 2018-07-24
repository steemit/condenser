import React, { PureComponent } from 'react';
import styled from 'styled-components';

const Root = styled.div`
    overflow: hidden;

    &:after {
        display: block;
        content: '';
        flex-basis: 296px;
        height: 942px;
        margin: -12px -11px -12px -12px;
        background: url('/images/TEMP/right_column_stub.png');
    }
`;

export default class RightColumnStub extends PureComponent {
    render() {
        return <Root />;
    }
}
