import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Icon from 'app/components/elements/Icon';

export default class VerticalMenu extends React.Component {
    static propTypes = {
        items: PropTypes.arrayOf(PropTypes.object).isRequired,
        title: PropTypes.string,
        className: PropTypes.string,
        hideValue: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    };

    closeMenu = e => {
        // If this was not a left click, or if CTRL or CMD were held, do not close the menu.
        if (e.button !== 0 || e.ctrlKey || e.metaKey) return;

        // Simulate clicking of document body which will close any open menus
        document.body.click();
    };

    render() {
        const { items, title, className, hideValue } = this.props;
        return (
            <ul
                className={
                    'VerticalMenu menu vertical' +
                    (className ? ' ' + className : '')
                }
            >
                {title && <li className="title">{title}</li>}
                {items.map(i => {
                    if (i.value === hideValue) return null;
                    return (
                        <li key={i.value} onClick={this.closeMenu}>
                            {i.link ? (
                                i.link.match(/^http(s?)/) ? (
                                    <a href={i.link} target="_blank">
                                        {i.icon && <Icon name={i.icon} />}
                                        {i.label ? i.label : i.value}
                                        {i.addon}
                                    </a>
                                ) : (
                                    <Link to={i.link} onClick={i.onClick}>
                                        {i.icon && <Icon name={i.icon} />}
                                        {i.label ? i.label : i.value}
                                        {i.addon}
                                    </Link>
                                )
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
