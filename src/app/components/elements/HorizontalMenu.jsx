import React from 'react';
import { Link } from 'react-router';
import Icon from 'app/components/elements/Icon';
import tt from 'counterpart';

export default class HorizontalMenu extends React.Component {
    static propTypes = {
        items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        title: React.PropTypes.string,
        className: React.PropTypes.string,
        hideValue: React.PropTypes.string,
        includeSearch: React.PropTypes.bool,
    };

    render() {
        const {items, title, className, hideValue, includeSearch} = this.props;
        const headerSearchInput = (
            <li className={"Header__search-input"}>
                <form className="column"
                    action="/static/search.html"
                    method="GET">
                    <div className="input-group">
                        <div className="input-group-button">
                            <button href="/static/search.html" type="submit" title={tt('g.search')}>
                                <Icon name="search" />
                            </button>
                        </div>
                        <input type="text" placeholder="search" className="input-group-field" name="q" autoComplete="off"></input>
                    </div>
                </form>
            </li>
        )
        return <ul className={'HorizontalMenu menu' + (className ? ' ' + className : '')}>
            {title && <li className="title">{title}</li>}
            {items.map(i => {
                if(i.value === hideValue) return null
                return <li key={i.value} className={i.active ? 'active' : ''}>
                    {i.link ? <Link to={i.link} onClick={i.onClick}>
                        {i.icon && <Icon name={i.icon} />}{i.label ? i.label : i.value}
                    </Link> :
                    <span>
                        {i.icon && <Icon name={i.icon} />}{i.label ? i.label : i.value}
                    </span>
                    }
                </li>
            })}
            {includeSearch && headerSearchInput}
        </ul>;
    }
}
