import Flex from 'golos-ui/Flex';

const Container = Flex.extend.attrs({
    auto: true,
})`
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 1200px) {
        margin: 0 20px;
    }
`;
Container.defaulProps = {
    auto: true
}

export default Container;
