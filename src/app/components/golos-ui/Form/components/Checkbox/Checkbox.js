import React from 'react';
import styled from 'styled-components';
import is from 'styled-is';

import Icon from 'golos-ui/Icon';

const Wrapper = styled.div`
    display: flex;
    cursor: pointer;

    color: ${({checked}) => checked ? '#2879FF' : '#D7D7D7'};
`;

const Checked = ({ value, onChange }) => (
    <Wrapper checked={value} onClick={() => onChange(!value)}>
        {value ? <Icon name="checkbox-on" size="18"/> : <Icon name="checkbox-off" size="18"/>}
    </Wrapper>
);
export default Checked;
