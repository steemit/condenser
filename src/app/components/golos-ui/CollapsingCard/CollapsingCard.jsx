import React from 'react';
import styled from 'styled-components';

import CollapsingBlock from '../CollapsingBlock';

const CollapsingBlockStyled = styled(CollapsingBlock)`
    margin-bottom: 18px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);

    @media (max-width: 890px) {
        margin-bottom: 14px;
        border-radius: 0;
    }
`;

const Body = styled.div`
    border-top: 1px solid #e9e9e9;
`;

export default function CollapsingCard(props) {
    return (
        <CollapsingBlockStyled {...props} upperCase>
            <Body>{props.children}</Body>
        </CollapsingBlockStyled>
    );
}
