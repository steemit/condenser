import React from 'react';
import cn from 'classnames';
import tt from 'counterpart';
import Icon from 'app/components/elements/Icon';
import Hint from 'app/components/elements/common/Hint';
import RadioGroup from 'app/components/elements/common/RadioGroup';
import { PAYOUT_OPTIONS } from 'app/components/modules/PostForm/PostForm';

export default class PostOptions extends React.PureComponent {
    static propTypes = {
        value: React.PropTypes.object.isRequired,
        editMode: React.PropTypes.bool,
        onChange: React.PropTypes.func.isRequired,
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
        const { plus18 } = this.props.value;
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
                        PostOptions__item_warning: plus18,
                    })}
                    onClick={this._onPlus18Click}
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
        const { editMode, value } = this.props;

        return (
            <Hint align="center" innerRef={this._onBubbleRef}>
                <div className="PostOptions__bubble-text">
                    Установки награды за свой пост:
                </div>
                <RadioGroup
                    disabled={editMode}
                    items={PAYOUT_OPTIONS.map(({ id, title, hint }) => ({
                        id,
                        title: tt(title),
                        hint: hint ? tt(hint) : null,
                    }))}
                    value={value.coinMode}
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

    _onPlus18Click = () => {
        this.props.onChange({
            coinMode: this.props.value.coinMode,
            plus18: !this.props.value.plus18,
        });
    };

    _onCoinModeChange = coinMode => {
        this.props.onChange({
            coinMode: coinMode,
            plus18: this.props.value.plus18,
        });
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
