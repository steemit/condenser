import React, { PureComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';

const Root = styled.div``;
const DelegationLine = styled.div``;

export default class DelegationsList extends PureComponent {
    render() {
        return (
            <Root>
                <DelegationLine>1</DelegationLine>
                <DelegationLine>2</DelegationLine>
                <DelegationLine>3</DelegationLine>
                <DelegationLine>4</DelegationLine>
            </Root>
        );
    }
}
