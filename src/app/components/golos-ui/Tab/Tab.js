import styled from 'styled-components';
import PropTypes from 'prop-types';
import { IndexLink, Link } from 'react-router';

const activeStyles = `
    color: #333333;
    cursor: default;
`;

const Tab = styled.div`
    position: relative;
    display: inline-flex;
    align-items: center;

    height: 50px;
    padding: 0 6px;
    margin: 0 3px;

    font-family: ${({ theme }) => theme.fontFamily};
    font-size: 14px;
    font-weight: 500;
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

    ${({ active }) => active && activeStyles}
    &.${({ activeClassName }) => activeClassName} {
        ${activeStyles}
    }
`;

Tab.propTypes = {
    active: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.bool
    ]),
    activeClassName: PropTypes.string,
};

Tab.defaultProps = {
    active: undefined,
    activeClassName: 'active',
};

export const TabLinkIndex = Tab.withComponent(IndexLink);
export const TabLink = Tab.withComponent(Link);
export default Tab;
