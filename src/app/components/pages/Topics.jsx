import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import tt from 'counterpart';

class Topics extends React.Component {
    static propTypes = {
        categories: React.PropTypes.object.isRequired,
        order: React.PropTypes.string,
        current: React.PropTypes.string,
        className: React.PropTypes.string,
        compact: React.PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {};
    }

    shouldComponentUpdate(nextProps, nextState) {
        const res =
            this.props.categories !== nextProps.categories ||
            this.props.current !== nextProps.current ||
            this.props.order !== nextProps.order ||
            this.state !== nextState;
        return res;
    }

    render() {
        const {
            props: { order, current, compact, className, username },
        } = this;
        let categories = this.props.categories.get('trending');
        categories = categories.take(50);
        const cn = 'Topics' + (className ? ` ${className}` : '');
        const currentValue = `/${order}/${current}`;
        // order is 'trending'
        //current is 'feed'
        //currentValue is '/trending/feed'
        debugger
        const myFeed = username && (
            <option key={'feed'} value={`/@${username}/feed`}>
                {
                    //tt('g.my_feed')
                    'feed'
                }
            </option>
        );
        if (compact) {
            return (
                <select
                    className={cn}
                    onChange={
                        (e) => 
                        {
                            debugger
                            browserHistory.push(e.target.value)
                        }
                    }
                    value={currentValue}
                >
                    <option key={'*'} value={'/' + order}>
                        {tt('g.all_tags')}
                    </option>
                    {myFeed}
                    {categories.map(cat => {
                        const link = order ? `/${order}/${cat}` : `/${cat}`;
                        return (
                            <option key={cat} value={link}>
                                {cat}
                            </option>
                        );
                    })}
                </select>
            );
        }

        categories = categories.map(cat => {
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
                <div className="c-sidebar__header">
                    <h3 className="c-sidebar__h3" key={'*'}>
                        {tt('g.tags_and_topics')}
                    </h3>
                </div>
                <div className="c-sidebar__content">
                    <ul className="c-sidebar__list">
                        {categories}
                        <li className="c-sidebar__link">
                            <Link
                                className="c-sidebar__link c-sidebar__link--emphasis"
                                to={`/tags`}
                            >
                                {tt('g.show_more_topics')}..
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    categories: state.global.get('tag_idx'),
}))(Topics);
