import React from 'react';
import styled from 'styled-components';
import Icon from 'golos-ui/Icon';

const Wrapper = styled.div`
    display: ${props => props.inline ? 'inline-flex' : 'flex'};
    align-items: center;
    cursor: pointer;
`;

const IconOn = Icon.extend`
    color: #2879ff;
`;

const IconOff = Icon.extend`
    color: #d7d7d7;
`;

const Title = styled.div`
    margin-left: 6px;
    font-size: 14px;
`;

const Checked = ({ value, title, inline, onChange }) => (
    <Wrapper inline={inline} onClick={() => onChange(!value)}>
        {value ? (
            <IconOn name="checkbox-on" size="18" />
        ) : (
            <IconOff name="checkbox-off" size="18" />
        )}
        {title ? <Title>{title}</Title> : null}
    </Wrapper>
);

export default Checked;
