import PropTypes from 'prop-types';
import styled from 'styled-components';

const Flex = styled.div`
    display: flex;
    flex: ${({ auto }) => (auto ? '1 1 auto' : 'initial')};
    flex-direction: ${({ column }) => (column ? 'column' : 'row')};
    align-items: ${({ align }) => align};
    justify-content: ${({ justify }) => justify};
    flex-wrap: ${({ wrap }) => wrap};
`;

Flex.propTypes = {
    auto: PropTypes.bool,
    column: PropTypes.bool,
    align: PropTypes.oneOf([
        'stretch',
        'center',
        'baseline',
        'flex-start',
        'flex-end',
    ]),
    justify: PropTypes.oneOf([
        'center',
        'space-around',
        'space-between',
        'flex-start',
        'flex-end',
    ]),
    wrap: PropTypes.oneOf([
        'initial',
        'nowrap',
        'unset',
        'wrap',
        'wrap-reverse',
    ]),
};

export default Flex;
