import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

const activeStyles = `
    color: #333333;
    font-weight: 500;

    :after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: #333333;
    }
`;

const Tab = styled.div`
    position: relative;
    display: inline-flex;
    align-items: center;

    height: 50px;
    margin: 0 15px;

    font-family: ${props => props.theme.fontFamilyBold};
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 1.09px;
    text-transform: uppercase;
    color: #b7b7b9;

    cursor: pointer;

    :first-of-type {
        margin-left: 0;
    }

    :last-of-type {
        margin-right: 0;
    }

    :hover {
        color: #333333;
    }

    ${props => props.active && activeStyles}
    &.${props => props.activeClassName} {
        ${activeStyles}
    }
`;

Tab.propTypes = {
    active: PropTypes.bool,
    activeClassName: PropTypes.string,
};

Tab.defaultProps = {
    active: undefined,
    activeClassName: 'active',
};


export const TabLink = Tab.withComponent(Link);
export default Tab;
