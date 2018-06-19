import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import HintIcon from 'app/components/elements/common/HintIcon/HintIcon';
import radioOn from './radio-on.svg';
import radioOff from './radio-off.svg';

export default class RadioGroup extends React.PureComponent {
    static propTypes = {
        items: PropTypes.array.isRequired,
        disabled: PropTypes.bool,
        className: PropTypes.string,
        name: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
            .isRequired,
        onChange: PropTypes.func.isRequired,
    };

    render() {
        const { items, name, value, className, disabled } = this.props;

        return <div className={cn('RadioGroup', { RadioGroup_disabled: disabled }, className)}>
                {items.map(item => (
                    <div key={item.id} className="RadioGroup__item">
                        <label
                            className="RadioGroup__label"
                            onClick={
                                disabled
                                    ? null
                                    : () => this._onItemClick(item)
                            }
                        >
                            <input
                                type="radio"
                                name={name}
                                className="RadioGroup__input"
                                disabled={disabled}
                                checked={item.id === value}
                                onChange={noop}
                            />
                            <i
                                className={cn(
                                    'RadioGroup__svg-wrapper',
                                    {
                                        'RadioGroup__svg-wrapper_value':
                                            item.id === value,
                                    }
                                )}
                                dangerouslySetInnerHTML={{
                                    __html:
                                        item.id === value
                                            ? radioOn
                                            : radioOff,
                                }}
                            />
                            <span className="RadioGroup__label-text">
                                {item.title}
                            </span>
                        </label>
                        {item.hint ? (
                            <span className="RadioGroup__hint">
                                <HintIcon hint={item.hint} />
                            </span>
                        ) : null}
                    </div>
                ))}
            </div>;
    }

    _onItemClick = item => {
        this.props.onChange(item.id);
    };
}

function noop() {}
