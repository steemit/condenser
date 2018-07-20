import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import is from 'styled-is';
import Icon from 'golos-ui/Icon';

const LikeCount = styled.span`
    color: #959595;
    transition: color 0.15s;
`;

const LikeIcon = Icon.extend`
    margin-right: 8px;
    vertical-align: middle;
    width: 20px;
    height: 20px;
    margin-top: -7px;
    color: #393636;
    transition: color 0.2s;
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

export default class VotePanel extends PureComponent {
    static propTypes = {
        data: PropTypes.object, // Immutable.Map
        me: PropTypes.string,
        whiteTheme: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    };

    render() {
        const { data, me, whiteTheme, className } = this.props;

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
            <Root whiteTheme={whiteTheme} className={className}>
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
            </Root>
        );
    }

    _onLikeClick = () => {
        this.props.onChange(this._myPercent > 0 ? 0 : 1);
    };

    _onDislikeClick = () => {
        this.props.onChange(this._myPercent < 0 ? 0 : -1);
    };
}

function makeTooltip(accounts) {
    if (accounts.length > 10) {
        return accounts.slice(0, 10).join('<br>') + '<br>...';
    } else {
        return accounts.join('<br>');
    }
}
