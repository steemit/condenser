import styled from 'styled-components';

const SimpleInput = styled.input`
    display: block;
    width: 100%;
    height: 34px;
    padding: 0 11px;
    border: 1px solid #e1e1e1;
    outline: none;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.25s;

    &:focus {
        border-color: #8a8a8a;
    }
`;

export default SimpleInput;
