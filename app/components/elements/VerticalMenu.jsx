import React from 'react';
import { Link } from 'react-router'
import Icon from 'app/components/elements/Icon.jsx';

export default class VerticalMenu extends React.Component {
    static propTypes = {
        items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        title: React.PropTypes.string,
        className: React.PropTypes.string,
        hideValue: React.PropTypes.string,
    };

    closeMenu = () => {
        document.body.click();
    }

    render() {
        const {items, title, className, hideValue} = this.props;
        return <ul className={'VerticalMenu menu vertical' + (className ? ' ' + className : '')}>
            {title && <li className="title">{title}</li>}
            {items.map(i => {
                if(i.value === hideValue) return null
                return <li key={i.value} onClick={this.closeMenu}>
                    {i.link ? <Link to={i.link} onClick={i.onClick}>
                        {i.icon && <Icon name={i.icon} />}{i.label ? i.label : i.value}
                    </Link> :
                    <span>
                        {i.icon && <Icon name={i.icon} />}{i.label ? i.label : i.value}
                    </span>
                    }
                </li>
            })}
        </ul>;
    }
}
