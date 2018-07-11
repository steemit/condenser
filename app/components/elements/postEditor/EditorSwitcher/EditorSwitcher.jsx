import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import './EditorSwitcher.scss';

export default class EditorSwitcher extends PureComponent {
    static propTypes = {
        items: PropTypes.array.isRequired,
        activeId: PropTypes.number,
        onChange: PropTypes.func.isRequired,
    };

    render() {
        const { items, activeId } = this.props;

        return (
            <div className="EditorSwitcher">
                {items.map(item => (
                    <div
                        key={item.id}
                        className={cn('EditorSwitcher__item', {
                            EditorSwitcher__item_active: item.id === activeId,
                        })}
                        onClick={
                            item.id === activeId
                                ? null
                                : () => this.props.onChange(item.id)
                        }
                    >
                        {item.text}
                    </div>
                ))}
                <i className="EditorSwitcher__filler" />
            </div>
        );
    }
}
