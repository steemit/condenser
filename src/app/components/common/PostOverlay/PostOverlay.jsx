import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Post from 'app/components/pages/Post';
import Icon from 'golos-ui/Icon';

const Bg = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(150, 150, 150, 0.9);
`;

const Root = styled.div`
    position: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    z-index: 300;
    overflow-x: hidden;
    overflow-y: scroll;

    @media screen and (max-width: 60rem) {
        ${Bg} {
            display: none;
        }
    }
`;

const HeaderIcon = Icon.extend`
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    pointer-events: initial;
    color: #8a8a8a;
`;

const CloseIcon = HeaderIcon.extend`
    padding: 8px;
    margin: 26px 12px;
    transition: color 0.15s;
    cursor: pointer;

    &:hover {
        color: #333;
    }
`;

const BackIcon = HeaderIcon.extend`
    display: none;
    padding: 1px;
    color: #0078c4;
`;

const Container = styled.div`
    width: 62rem;

    @media screen and (max-width: 67rem) {
        width: 56rem;
    }

    @media screen and (max-width: 60rem) {
        width: auto;
        border-radius: 0;

        ${BackIcon} {
            display: block;
        }

        ${CloseIcon} {
            display: none;
        }
    }
`;

const PostContainer = Container.extend`
    position: relative;
    padding: 2rem 0.9rem;
    margin: 1rem 0;
    border-radius: 3px;
    background: #fefefe;
    box-shadow: 0 0 5px 0 #404040;
`;

const HeaderContainer = Container.extend`
    position: fixed;
    pointer-events: none;
    z-index: 1;
`;

const Header = styled.div`
    display: flex;
`;

const Filler = styled.div`
    flex-grow: 1;
`;

export default class PostOverlay extends PureComponent {
    static propTypes = {
        permLink: PropTypes.string.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    componentDidMount() {
        document.body.classList.add('with-post-overlay');
    }

    componentWillUnmount() {
        document.body.classList.remove('with-post-overlay');
    }

    render() {
        const { permLink } = this.props;

        return (
            <Root>
                <Bg onClick={this._onCloseClick} />
                <HeaderContainer>
                    <Header>
                        <BackIcon name="chevron-left" onClick={this._onCloseClick} />
                        <Filler />
                        <CloseIcon name="cross" onClick={this._onCloseClick} />
                    </Header>
                </HeaderContainer>
                <PostContainer>
                    <Post post={permLink} />
                </PostContainer>
            </Root>
        );
    }

    _onCloseClick = () => {
        this.props.onClose();
    };
}
