import React from 'react';
import { browserHistory } from 'react-router';
import Icon from 'app/components/elements/Icon.jsx';

export default class VerticalMenu extends React.Component {
    static propTypes = {
        items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        title: React.PropTypes.string,
        className: React.PropTypes.string,
        hideValue: React.PropTypes.string,
    };

    navigate = (e) => {
        const a = e.target.nodeName.toLowerCase() === 'a' ? e.target : e.target.parentNode;
        this.setState({show: false});
        if (a.host !== window.location.host) return;
        e.preventDefault();
        document.body.click();
        browserHistory.push(a.pathname + a.search + a.hash);
    };

    render() {
        const {items, title, className, hideValue} = this.props;
        return <ul className={'VerticalMenu menu vertical' + (className ? ' ' + className : '')}>
            {title && <li className="title">{title}</li>}
            {items.map(i => {
                if(i.value === hideValue) return null
                return <li key={i.value}>
                    {i.link ? <a href={i.link} onClick={i.onClick ? i.onClick : this.navigate}>
                        {i.icon && <Icon name={i.icon} />}{i.label ? i.label : i.value}
                    </a> :
                    <span>
                        {i.icon && <Icon name={i.icon} />}{i.label ? i.label : i.value}
                    </span>
                    }
                </li>
            })}
        </ul>;
    }
}
