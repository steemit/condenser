import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import is from 'styled-is';
import { getStoreState } from 'shared/UniversalRender';
import Icon from 'golos-ui/Icon';
import Slider from 'golos-ui/Slider';

const VOTE_PERCENT_THRESHOLD = 1000000;

const LIKE_PERCENT_KEY = 'golos.like-percent';
const DISLIKE_PERCENT_KEY = 'golos.dislike-percent';

const LikeCount = styled.span`
    color: #959595;
    transition: color 0.15s;
`;

const LikeIcon = Icon.extend`
    margin-right: 8px;
    vertical-align: middle;
    width: 20px;
    height: 20px;
    margin-top: -5px;
    color: #393636;
    transition: color 0.2s;
`;

const LikeSliderIcon = LikeIcon.extend`
    margin-top: -3px;
    color: #2879ff;

    ${is('dislike')`
        color: #ff4e00;
        margin-top: 0;
        margin-bottom: -3px;
        transform: scale(1, -1);
    `};
`;

const LikeIconNeg = LikeIcon.extend`
    margin-top: 0;
    margin-bottom: -7px;
    transform: scale(1, -1);
`;

const LikeBlock = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    padding-right: 4px;

    &:hover,
    &:hover ${LikeCount}, &:hover ${LikeIcon}, &:hover ${LikeIconNeg} {
        color: #000;
    }

    ${is('active')`
        ${LikeIcon}, ${LikeCount} {
            color: #2879ff !important;
        } 
    `} ${is('activeNeg')`
        ${LikeIconNeg}, ${LikeCount} {
            color: #ff4e00 !important;
        } 
    `};
`;

const LikeBlockNeg = LikeBlock.extend`
    margin-left: 5px;
`;

const Money = styled.div`
    height: 26px;
    padding: 0 9px;
    margin: 0 10px;
    border: 1px solid #959595;
    border-radius: 100px;
    color: #393636;
    cursor: default;
`;

const Root = styled.div`
    position: relative;
    display: flex;

    ${is('whiteTheme')`
        ${Money} {
            color: #fff;
            border-color: #fff;
        }

        ${LikeCount}, ${LikeIcon}, ${LikeIconNeg} {
            color: #fff !important;
        }    
    `};
`;

const IconTriangle = Icon.extend`
    width: 5px;
    margin-top: 1px;
    margin-left: 2px;
    vertical-align: top;
    color: #393636;
    cursor: pointer;
    user-select: none;
`;

const SliderBlock = styled.div`
    position: absolute;
    display: flex;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 14px;
    margin: -7px -2px -5px;
    align-items: center;
    border-radius: 100px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
    background: #fff;
    animation: fade-in 0.2s;
`;

const SliderStyled = styled(Slider)`
    flex-grow: 1;
    flex-shrink: 1;
`;

const OkButton = styled.div`
    margin-left: 10px;
    color: #333;
    cursor: pointer;
    user-select: none;
    font-size: 14px;

    &:hover {
        color: #000;
    }
`;

export default class VotePanel extends PureComponent {
    static propTypes = {
        data: PropTypes.object, // Immutable.Map
        me: PropTypes.string,
        whiteTheme: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    };

    state = {
        sliderAction: null,
        showSlider: false,
        votePercent: 0,
    };

    componentWillUnmount() {
        window.removeEventListener('click', this._onAwayClick);
    }

    render() {
        const { data, me, whiteTheme, className } = this.props;
        const { sliderAction, showSlider, votePercent } = this.state;

        this._myPercent = 0;
        const votes = data.get('active_votes');
        const likes = [];
        const dislikes = [];

        for (let vote of votes.toJS()) {
            if (vote.percent > 0) {
                likes.push(vote.voter);
            }

            if (vote.percent < 0) {
                dislikes.push(vote.voter);
            }

            if (vote.voter === me) {
                this._myPercent = vote.percent;
            }
        }

        return (
            <Root whiteTheme={whiteTheme} className={className} innerRef={this._onRef}>
                <LikeBlock
                    active={this._myPercent > 0}
                    data-tooltip={makeTooltip(likes)}
                    data-tooltip-html
                    onClick={this._onLikeClick}
                >
                    <LikeIcon name="like" />
                    <LikeCount>
                        {likes.length}
                        <IconTriangle name="triangle" />
                    </LikeCount>
                </LikeBlock>
                <Money>$1.07</Money>
                <LikeBlockNeg
                    activeNeg={this._myPercent < 0}
                    data-tooltip={makeTooltip(dislikes)}
                    data-tooltip-html
                    onClick={this._onDislikeClick}
                >
                    <LikeIconNeg name="like" />
                    <LikeCount>
                        {dislikes.length}
                        <IconTriangle name="triangle" />
                    </LikeCount>
                </LikeBlockNeg>
                {showSlider ? (
                    <SliderBlock className={className}>
                        <LikeSliderIcon name="like" dislike={sliderAction === 'dislike' ? 1 : 0} />
                        <SliderStyled
                            value={votePercent}
                            red={sliderAction === 'dislike'}
                            onChange={this._onPercentChange}
                        />
                        <OkButton onClick={this._onOkVoteClick}>OK</OkButton>
                    </SliderBlock>
                ) : null}
            </Root>
        );
    }

    _hideSlider() {
        this.setState({
            showSlider: false,
        });

        window.removeEventListener('click', this._onAwayClick);
    }

    _onRef = el => {
        this._root = el;
    };

    _onLikeClick = () => {
        if (this._myPercent > 0) {
            this.props.onChange(0);
        } else {
            if (isNeedShowSlider()) {
                this.setState({
                    votePercent: getSavedPercent(LIKE_PERCENT_KEY),
                    sliderAction: 'like',
                    showSlider: true,
                });

                window.addEventListener('click', this._onAwayClick);
            } else {
                this.props.onChange(1);
            }
        }
    };

    _onAwayClick = e => {
        if (this._root && !this._root.contains(e.target)) {
            this._hideSlider();
        }
    };

    _onDislikeClick = () => {
        if (this._myPercent < 0) {
            this.props.onChange(0);
        } else {
            if (isNeedShowSlider()) {
                this.setState({
                    votePercent: getSavedPercent(DISLIKE_PERCENT_KEY),
                    sliderAction: 'dislike',
                    showSlider: true,
                });

                window.addEventListener('click', this._onAwayClick);
            } else {
                this.props.onChange(-1);
            }
        }
    };

    _onPercentChange = percent => {
        const { sliderAction } = this.state;

        this.setState({
            votePercent: percent,
        });
    };

    _onOkVoteClick = () => {
        const { sliderAction, votePercent } = this.state;

        const multiplier = sliderAction === 'like' ? 1 : -1;
        this.props.onChange(multiplier * (votePercent / 100));
        savePercent(sliderAction === 'like' ? LIKE_PERCENT_KEY : DISLIKE_PERCENT_KEY, votePercent);

        this._hideSlider();
    };
}

function makeTooltip(accounts) {
    if (accounts.length > 10) {
        return accounts.slice(0, 10).join('<br>') + '<br>...';
    } else {
        return accounts.join('<br>');
    }
}

function isNeedShowSlider() {
    const state = getStoreState();

    const current = state.user.get('current');

    if (!current) {
        return false;
    }

    const netVesting =
        current.get('vesting_shares') -
        current.get('delegated_vesting_shares') +
        current.get('received_vesting_shares');

    return netVesting > VOTE_PERCENT_THRESHOLD;
}

function getSavedPercent(key) {
    try {
        const percent = JSON.parse(localStorage.getItem(key));

        if (Number.isFinite(percent)) {
            return percent;
        }
    } catch (err) {}

    return 100;
}

function savePercent(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {}
}
