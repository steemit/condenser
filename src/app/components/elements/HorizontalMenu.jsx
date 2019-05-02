import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Icon from 'app/components/elements/Icon';
import tt from 'counterpart';

export default class HorizontalMenu extends React.Component {
    static propTypes = {
        items: PropTypes.arrayOf(PropTypes.object).isRequired,
        title: PropTypes.string,
        className: PropTypes.string,
        hideValue: PropTypes.string,
        includeSearch: PropTypes.bool,
    };

    render() {
        const {
            items,
            title,
            className,
            hideValue,
            includeSearch,
        } = this.props;
        return (
            <ul
                className={
                    'HorizontalMenu menu' + (className ? ' ' + className : '')
                }
            >
                {title && <li className="title">{title}</li>}
                {items.map(i => {
                    if (i.value === hideValue) return null;
                    return (
                        <li key={i.value} className={i.active ? 'active' : ''}>
                            {i.link ? (
                                <Link to={i.link} onClick={i.onClick}>
                                    {i.icon && <Icon name={i.icon} />}
                                    {i.label ? i.label : i.value}
                                </Link>
                            ) : (
                                <span>
                                    {i.icon && <Icon name={i.icon} />}
                                    {i.label ? i.label : i.value}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>
        );
    }
}
