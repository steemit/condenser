import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import tt from 'counterpart';
import PropTypes from 'prop-types';
import NativeSelect from 'app/components/elements/NativeSelect';

const Topics = ({
    order,
    current,
    compact,
    className,
    username,
    categories,
}) => {
    const handleChange = selectedOption => {
        browserHistory.push(selectedOption.value);
    };

    const currentlySelected = (currentTag, username, currentOrder = false) => {
        const opts = {
            feed: `/@${username}/feed`,
            tagOnly: `/trending/${currentTag}`,
            orderOnly: `/${currentOrder}`,
            tagWithOrder: `/${currentOrder}/${currentTag}`,
            default: `/trending`,
        };
        if (currentTag === 'feed') return opts['feed'];
        if (currentTag && currentOrder) return opts['tagWithOrder'];
        if (!currentTag && currentOrder) return opts['orderOnly'];
        if (currentTag && !currentOrder) return opts['tagOnly'];
        return opts['default'];
    };

    if (compact) {
        const extras = username => {
            const ex = {
                allTags: order => ({
                    value: `/${order}`,
                    label: `${tt('g.all_tags_mobile')}`,
                }),
                myFeed: name => ({
                    value: `/@${name}/feed`,
                    label: `${tt('g.my_feed')}`,
                }),
            };
            return username
                ? [ex.allTags(order), ex.myFeed(username)]
                : [ex.allTags(order)];
        };

        const opts = extras(username).concat(
            categories
                .map(cat => {
                    const link = order ? `/${order}/${cat}` : `/${cat}`;
                    return { value: link, label: cat };
                })
                .toJS()
        );

        return (
            <NativeSelect
                currentlySelected={currentlySelected(current, username, order)}
                options={opts}
                onChange={handleChange}
            />
        );
    } else {
        const categoriesLinks = categories.map(cat => {
            const link = order ? `/${order}/${cat}` : `/hot/${cat}`;
            return (
                <li className="c-sidebar__list-item" key={cat}>
                    <Link
                        to={link}
                        className="c-sidebar__link"
                        activeClassName="active"
                    >
                        {cat}
                    </Link>
                </li>
            );
        });
        return (
            <div className="c-sidebar__module">
                <div className="c-sidebar__content">
                    <ul className="c-sidebar__list">
                        <li className="c-sidebar__list-item">
                            <div className="c-sidebar__header">
                                <Link
                                    to={'/' + order}
                                    className="c-sidebar__link"
                                    activeClassName="active"
                                >
                                    {tt('g.all_tags')}
                                </Link>
                            </div>
                        </li>
                        {categoriesLinks}
                        <li className="c-sidebar__link">
                            <Link
                                className="c-sidebar__link c-sidebar__link--emphasis"
                                to={`/tags`}
                            >
                                {tt('g.show_more_topics')}&hellip;
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
};

Topics.propTypes = {
    categories: PropTypes.object.isRequired,
    order: PropTypes.string.isRequired,
    current: PropTypes.string,
    compact: PropTypes.bool.isRequired,
};

Topics.defaultProps = {
    current: '',
};

export default Topics;
