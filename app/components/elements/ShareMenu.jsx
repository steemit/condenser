import React from 'react'
import { Link } from 'react-router'
import Icon from 'app/components/elements/Icon.jsx';

export default class ShareMenu extends React.Component {

    static propTypes = {
        menu: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        title: React.PropTypes.string
    };

    render(){
        const title = this.props.title;
        const items = this.props.menu;
        return <span className={"shareMenu"}>
            <ul className={'shareItems'}>
            {title && <li className="title">{title}</li>}
                {items.map(i => {
                    return <li key={i.value}>
                        {i.link ? <Link to={i.link} onClick={i.onClick}>
                            {i.icon && <Icon name={i.icon} />}{}
                            &nbsp; {i.addon}
                        </Link> :
                            <span>
                        {i.icon && <Icon name={i.icon} />}{i.label ? i.label : i.value}
                    </span>
                        }
                    </li>
                })}
            </ul>
        </span>
    }
}
