import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { numberWithCommas } from 'app/utils/StateFunctions';
import tt from 'counterpart';

export default class TagsIndex extends React.Component {
    static propTypes = {
        tagsAll: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = { order: props.order || 'name' };
        this.onChangeSort = this.onChangeSort.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        const res =
            this.props.tagsAll !== nextProps.tagsAll ||
            this.state !== nextState;
        return res;
    }

    onChangeSort = (e, order) => {
        e.preventDefault();
        this.setState({ order });
    };

    compareTags = (a, b, type) => {
        switch (type) {
            case 'name':
                return a.get('name').localeCompare(b.get('name'));
            case 'posts':
                return parseInt(a.get('top_posts')) <=
                    parseInt(b.get('top_posts'))
                    ? 1
                    : -1;
            case 'comments':
                return parseInt(a.get('comments')) <=
                    parseInt(b.get('comments'))
                    ? 1
                    : -1;
            case 'payouts':
                return parseInt(a.get('total_payouts')) <=
                    parseInt(b.get('total_payouts'))
                    ? 1
                    : -1;
        }
    };

    render() {
        const { tagsAll } = this.props;
        //console.log('-- TagsIndex.render -->', tagsAll.toJS());
        const { order } = this.state;
        let tags = tagsAll;

        const rows = tags
            .filter(
                // there is a blank tag present, as well as some starting with #. filter them out.
                tag => /^[a-z]/.test(tag.get('name'))
            )
            .sort((a, b) => {
                return this.compareTags(a, b, order);
            })
            .map(tag => {
                const name = tag.get('name');
                const link = `/trending/${name}`;
                return (
                    <tr key={name}>
                        <td>
                            <Link to={link} activeClassName="active">
                                {name}
                            </Link>
                        </td>
                        <td>
                            {numberWithCommas(tag.get('top_posts').toString())}
                        </td>
                        <td>
                            {numberWithCommas(tag.get('comments').toString())}
                        </td>
                        <td>{numberWithCommas(tag.get('total_payouts'))}</td>
                    </tr>
                );
            })
            .toArray();

        const cols = [
            ['name', tt('g.tag')],
            ['posts', tt('g.posts')],
            ['comments', tt('g.comments')],
            ['payouts', tt('g.payouts')],
        ].map(col => {
            return (
                <th key={col[0]}>
                    {order === col[0] ? (
                        <strong>{col[1]}</strong>
                    ) : (
                        <Link
                            to="#"
                            onClick={e => this.onChangeSort(e, col[0])}
                        >
                            {col[1]}
                        </Link>
                    )}
                </th>
            );
        });

        return (
            <div className="TagsIndex row">
                <div className="column">
                    <br />
                    <h4>{tt('g.trending_topics')}</h4>
                    <table>
                        <thead>
                            <tr>{cols}</tr>
                        </thead>
                        <tbody>{rows}</tbody>
                    </table>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'tags(/:order)',
    component: connect(state => ({
        tagsAll: state.global.get('tags'),
    }))(TagsIndex),
};
