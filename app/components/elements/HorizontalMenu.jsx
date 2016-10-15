import React from 'react';
import { Link } from 'react-router'
import {connect} from 'react-redux';
import Icon from 'app/components/elements/Icon.jsx';

class HorizontalMenu extends React.Component {
    static propTypes = {
        items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        title: React.PropTypes.string,
        className: React.PropTypes.string,
        hideValue: React.PropTypes.string,
    };

    render() {
        // if this is ico page hide this section
        if (this.props.location && this.props.location.pathname.indexOf("/ico") != -1) return null
        const {items, title, className, hideValue} = this.props;
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
        </ul>;
    }
}
export default connect(
    (state, props) => {
        return {
            ...props,
            location: state.app.get('location')
        }
    }
)(HorizontalMenu);
