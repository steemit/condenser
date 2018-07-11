import styled from 'styled-components';
import is from 'styled-is';
import Flex from 'golos-ui/Flex';

const Container = styled(Flex).attrs({
    auto: true,
})`
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 1200px) {
        margin: 0 20px;
    }

    ${is('small')`
        @media (max-width: 576px) {
            margin: 0 auto;
        }
    `};
`;

export default Container;
