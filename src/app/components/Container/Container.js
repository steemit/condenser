import Flex from './../Flex';

const Container = Flex.extend.attrs({
    auto: true
})`
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 1200px) {
        margin: 0 20px;
    }
`;

export default Container;
