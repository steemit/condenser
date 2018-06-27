import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import tt from 'counterpart';
import Icon from 'app/components/elements/Icon';
import Hint from 'app/components/elements/common/Hint';
import RadioGroup from 'app/components/elements/common/RadioGroup';
import { PAYOUT_OPTIONS } from 'app/components/modules/PostForm/PostForm';

export default class PostOptions extends React.PureComponent {
    static propTypes = {
        nsfw: PropTypes.bool.isRequired,
        payoutType: PropTypes.number.isRequired,
        editMode: PropTypes.bool,
        onNsfwClick: PropTypes.func.isRequired,
        onPayoutChange: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this._onAwayClickListen = false;

        this.state = {
            showCoinMenu: false,
        };
    }

    componentWillUnmount() {
        this._unmount = true;

        if (this._onAwayClickListen) {
            window.removeEventListener('mousedown', this._onAwayClick);
        }
    }

    render() {
        const { showCoinMenu } = this.state;

        return (
            <div className="PostOptions">
                <span className="PostOptions__item-wrapper">
                    <span
                        className={cn('PostOptions__item', {
                            PostOptions__item_active: showCoinMenu,
                        })}
                        onClick={this._onCoinClick}
                    >
                        <Icon
                            name="editor/coin"
                            size="1_5x"
                            data-tooltip={tt('post_editor.payout_hint')}
                        />
                    </span>
                    {showCoinMenu ? this._renderCoinMenu() : null}
                </span>
                <span
                    className={cn('PostOptions__item', {
                        PostOptions__item_warning: this.props.nsfw,
                    })}
                    onClick={this.props.onNsfwClick}
                >
                    <Icon
                        name="editor/plus-18"
                        size="1_5x"
                        data-tooltip={tt('post_editor.nsfw_hint')}
                    />
                </span>
            </div>
        );
    }

    _renderCoinMenu() {
        const { editMode, payoutType } = this.props;

        return (
            <Hint align="center" innerRef={this._onBubbleRef}>
                <div className="PostOptions__bubble-text">
                    {tt('post_editor.set_payout_type')}:
                </div>
                <RadioGroup
                    disabled={editMode}
                    options={PAYOUT_OPTIONS.map(({ id, title, hint }) => ({
                        id,
                        title: tt(title),
                        hint: hint ? tt(hint) : null,
                    }))}
                    value={payoutType}
                    onChange={this._onCoinModeChange}
                />
            </Hint>
        );
    }

    _onCoinClick = () => {
        this.setState(
            {
                showCoinMenu: !this.state.showCoinMenu,
            },
            () => {
                const { showCoinMenu } = this.state;

                if (showCoinMenu && !this._onAwayClickListen) {
                    window.addEventListener('mousedown', this._onAwayClick);
                    this._onAwayClickListen = true;
                }
            }
        );
    };

    _onCoinModeChange = coinMode => {
        this.props.onPayoutChange(coinMode);
    };

    _onAwayClick = e => {
        if (this._bubble && !this._bubble.contains(e.target)) {
            setTimeout(() => {
                if (!this._unmount) {
                    this.setState({
                        showCoinMenu: false,
                    });
                }
            }, 50);
        }
    };

    _onBubbleRef = el => {
        this._bubble = el;
    };
}
