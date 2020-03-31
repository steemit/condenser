import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Icon from 'app/components/elements/Icon';

export default class ShareMenu extends React.Component {
    static propTypes = {
        menu: PropTypes.arrayOf(PropTypes.object).isRequired,
    };

    render() {
        const { menu } = this.props;
        return (
            <span className="shareMenu">
                <ul>
                    {menu.map(i => (
                        <li key={i.title}>
                            <Link to="#" onClick={i.onClick} title={i.title}>
                                <Icon name={i.icon} />
                            </Link>
                        </li>
                    ))}
                </ul>
            </span>
        );
    }
}
