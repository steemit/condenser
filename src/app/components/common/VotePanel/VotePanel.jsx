import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import tt from 'counterpart';
import styled from 'styled-components';
import is from 'styled-is';
import { getStoreState } from 'app/clientRender';
import { calcVotesStats } from 'app/utils/StateFunctions';
import Icon from 'golos-ui/Icon';
import Slider from 'golos-ui/Slider';
import { getPayout } from 'src/app/helpers/currency';

const VOTE_PERCENT_THRESHOLD = 1000000;

const LIKE_PERCENT_KEY = 'golos.like-percent';
const DISLIKE_PERCENT_KEY = 'golos.dislike-percent';

const SLIDER_OFFSET = 8;

const LikeWrapper = styled.i`
    margin-right: 8px;
`;

const LikeCount = styled.span`
    color: #959595;
    transition: color 0.15s;
`;

const LikeIcon = Icon.extend`
    vertical-align: middle;
    width: 20px;
    height: 20px;
    margin-top: -5px;
    color: #393636;
    transition: color 0.2s;
`;

const OkIcon = Icon.extend`
    width: 16px;
    margin-right: 8px;
    color: #a8a8a8;
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
        color: #2879ff;
    }

    ${is('red')`
        &:hover {
            color: #ff4e00;
        }
    `};
`;

const CancelIcon = Icon.extend`
    width: 12px;
    margin-left: 8px;
    color: #e1e1e1;
    transition: color 0.15s;
    cursor: pointer;

    &:hover {
        color: #333;
    }
`;

const LikeIconNeg = LikeIcon.extend`
    margin-top: 0;
    margin-bottom: -5px;
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
    `};

    ${is('activeNeg')`
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
    height: 40px;
    top: -50px;
    left: 0;
    width: 100%;
    min-width: 220px;
    padding: 0 14px;
    margin: 0 -${SLIDER_OFFSET}px;
    align-items: center;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
    background: #fff;
    animation: vote-from-down 0.2s;

    @keyframes vote-from-down {
        from {
            opacity: 0;
            transform: translate3d(0, 10px, 0);
        }
        to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
        }
    }
`;

const SliderBlockTip = styled.div`
    position: absolute;
    bottom: 0;
    left: ${a => a.left || '50%'};
    margin-left: -5px;
    margin-bottom: -5px;
    width: 10px;
    height: 10px;
    transform: rotate(45deg);
    background: #fff;
    box-shadow: 2px 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

const SliderStyled = styled(Slider)`
    flex-grow: 1;
    flex-shrink: 1;
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
        const { showSlider, sliderAction } = this.state;

        const votes = data.get('active_votes');
        const votesSummaryIm = data.get('votesSummary');
        const votesSummary = votesSummaryIm ? votesSummaryIm.toJS() : calcVotesStats(votes.toJS(), me);
        this._myVote = votesSummary.myVote;

        return (
            <Root whiteTheme={whiteTheme} className={className} innerRef={this._onRef}>
                <LikeBlock
                    active={this._myVote === 'like' || sliderAction === 'like'}
                    data-tooltip={
                        showSlider
                            ? null
                            : makeTooltip(votesSummary.firstLikes, votesSummary.likes > 10)
                    }
                    data-tooltip-html
                    onClick={this._onLikeClick}
                >
                    <LikeWrapper innerRef={this._onLikeRef}>
                        <LikeIcon name="like" />
                    </LikeWrapper>
                    <LikeCount>
                        {votesSummary.likes}
                        <IconTriangle name="triangle" />
                    </LikeCount>
                </LikeBlock>
                <Money>{getPayout(data)}</Money>
                <LikeBlockNeg
                    activeNeg={this._myVote === 'dislike' || sliderAction === 'dislike'}
                    data-tooltip={
                        showSlider
                            ? null
                            : makeTooltip(votesSummary.firstDislikes, votesSummary.dislikes > 10)
                    }
                    data-tooltip-html
                    onClick={this._onDislikeClick}
                >
                    <LikeWrapper innerRef={this._onDisLikeRef}>
                        <LikeIconNeg name="like" />
                    </LikeWrapper>
                    <LikeCount>
                        {votesSummary.dislikes}
                        <IconTriangle name="triangle" />
                    </LikeCount>
                </LikeBlockNeg>
                {showSlider ? this._renderSlider() : null}
            </Root>
        );
    }

    _renderSlider() {
        const { sliderAction, votePercent } = this.state;

        const like = sliderAction === 'like' ? this._like : this._disLike;

        const box = this._root.getBoundingClientRect();
        const likeBox = like.getBoundingClientRect();

        const tipLeft = SLIDER_OFFSET + (likeBox.left - box.left + likeBox.width / 2);

        return (
            <SliderBlock>
                <SliderBlockTip left={`${tipLeft}px`} />
                <OkIcon
                    name="check"
                    red={sliderAction === 'dislike' ? 1 : 0}
                    data-tooltip={tt('g.vote')}
                    onClick={this._onOkVoteClick}
                />
                <SliderStyled
                    value={votePercent}
                    red={sliderAction === 'dislike'}
                    onChange={this._onPercentChange}
                />
                <CancelIcon
                    name="cross"
                    data-tooltip={tt('g.cancel')}
                    onClick={this._onCancelVoteClick}
                />
            </SliderBlock>
        );
    }

    _hideSlider() {
        this.setState({
            showSlider: false,
            sliderAction: null,
        });

        window.removeEventListener('click', this._onAwayClick);
    }

    _onRef = el => {
        this._root = el;
    };

    _onLikeRef = el => {
        this._like = el;
    };

    _onDisLikeRef = el => {
        this._disLike = el;
    };

    _onLikeClick = () => {
        if (this.state.showSlider) {
            this._hideSlider();
        } else if (this._myVote === 'like') {
            this.props.onChange(0);
        } else if (isNeedShowSlider()) {
            this.setState({
                votePercent: getSavedPercent(LIKE_PERCENT_KEY),
                sliderAction: 'like',
                showSlider: true,
            });

            window.addEventListener('click', this._onAwayClick);
        } else {
            this.props.onChange(1);
        }
    };

    _onDislikeClick = () => {
        if (this.state.showSlider) {
            this._hideSlider();
        } else if (this._myVote === 'dislike') {
            this.props.onChange(0);
        } else if (isNeedShowSlider()) {
            this.setState({
                votePercent: getSavedPercent(DISLIKE_PERCENT_KEY),
                sliderAction: 'dislike',
                showSlider: true,
            });

            window.addEventListener('click', this._onAwayClick);
        } else {
            this.props.onChange(-1);
        }
    };

    _onAwayClick = e => {
        if (this._root && !this._root.contains(e.target)) {
            this._hideSlider();
        }
    };

    _onPercentChange = percent => {
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

    _onCancelVoteClick = () => {
        this._hideSlider();
    };
}

function makeTooltip(accounts, isMore) {
    return accounts.join('<br>') + (isMore ? '<br>...' : '');
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
