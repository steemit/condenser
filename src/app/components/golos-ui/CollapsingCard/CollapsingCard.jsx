import React from 'react';
import styled from 'styled-components';
import { isNot } from 'styled-is';

import CollapsingBlock from '../CollapsingBlock';

const CollapsingBlockStyled = styled(CollapsingBlock)`
    background: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);

    @media (max-width: 890px) {
        border-radius: 0;
    }
`;

const Body = styled.div`
    ${isNot('noborder')`
        border-top: 1px solid #e9e9e9;
    `}
`;

export default function CollapsingCard(props) {
    return (
        <CollapsingBlockStyled {...props} upperCase>
            <Body noborder={props.noBorder}>{props.children}</Body>
        </CollapsingBlockStyled>
    );
}
