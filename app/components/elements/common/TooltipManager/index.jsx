import React from 'react';
import cn from 'classnames';
import debounce from 'lodash/debounce';

const RAISE_TIME = 350;
let key = 0;

export default class TooltipManager extends React.PureComponent {
    state = {};

    componentDidMount() {
        document.addEventListener('mousemove', this._onMouseMove, true);
        document.addEventListener('resize', this._resetTooltips);
        document.addEventListener('mousedown', this._resetTooltips, true);
        document.addEventListener('keydown', this._resetTooltips, true);
        window.addEventListener('scroll', this._resetTooltips);
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this._onMouseMove, true);
        document.removeEventListener('resize', this._resetTooltips);
        document.removeEventListener('mousedown', this._resetTooltips, true);
        document.removeEventListener('keydown', this._resetTooltips, true);
        window.removeEventListener('scroll', this._resetTooltips);

        this._resetTooltips();
    }

    render() {
        const { tooltip } = this.state;

        return (
            <div>
                {tooltip ? (
                    <div
                        key={tooltip.key}
                        className={cn('Tooltip', tooltip.addClass)}
                        style={tooltip.style}
                    >
                        {tooltip.text}
                    </div>
                ) : null}
            </div>
        );
    }

    _onMouseMove = debounce(e => {
        const tooltip = e.target.closest('[data-tooltip]');
        const text = tooltip ? tooltip.dataset.tooltip.trim() : null;

        if (tooltip && text === this._hoverText) {
            this._hoverElement = tooltip;
            return;
        }

        this._resetTooltips();

        if (tooltip && text) {
            this._hoverElement = tooltip;
            this._hoverText = text;

            this._timeout = setTimeout(() => {
                this._showTooltip();
            }, RAISE_TIME);
        }
    }, 50);

    _showTooltip() {
        const element = this._hoverElement;
        const bound = element.getBoundingClientRect();

        this._elementBound = bound;

        this.setState({
            tooltip: {
                key: ++key,
                text: this._hoverText,
                addClass:
                    bound.left < 100
                        ? 'Tooltip_left'
                        : bound.right > window.innerWidth - 100
                            ? 'Tooltip_right'
                            : null,
                style: {
                    top: Math.round(bound.top + window.scrollY),
                    left: Math.round(bound.left + bound.width / 2),
                },
            },
        });

        this._checkInterval = setInterval(this._checkElement, 500);
    }

    _checkElement = () => {
        if (!this._hoverElement.isConnected) {
            this._resetTooltips();
            return;
        }

        const b = this._elementBound;
        const bound = this._hoverElement.getBoundingClientRect();

        if (b.top !== bound.top || b.left !== bound.left) {
            this._resetTooltips();
        }
    };

    _resetTooltips = () => {
        this._hoverElement = null;
        this._hoverText = null;
        this._elementBound = null;

        this._onMouseMove.cancel();
        clearTimeout(this._timeout);

        if (this.state.tooltip) {
            this._hideTooltip();
        }
    };

    _hideTooltip() {
        clearInterval(this._checkInterval);

        this.setState({
            tooltip: null,
        });
    }
}
