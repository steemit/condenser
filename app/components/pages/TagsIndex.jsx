import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
import { browserHistory } from 'react-router';
import { numberWithCommas } from 'app/utils/StateFunctions';

export default class TagsIndex extends React.Component {
    static propTypes = {
        tagsAll: React.PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {search: '', order: props.order || 'name'};
        this.onChangeSort = this.onChangeSort.bind(this)
    }

    shouldComponentUpdate(nextProps, nextState) {
        const res = this.props.tagsAll !== nextProps.tagsAll ||
            this.state !== nextState;
        return res;
    }

    onChangeSearch = e => {
        this.setState({search: e.target.value})
    }

    onChangeSort = (e, order) => {
        e.preventDefault()
        this.setState({order})
    }

    compareTags = (a, b, type) => {
        switch(type) {
            case 'name': return a.get('name').localeCompare(b.get('name'));
            case 'posts': return parseInt(a.get('top_posts')) <=  parseInt(b.get('top_posts')) ? 1 : -1;
            case 'comments': return parseInt(a.get('comments')) <=  parseInt(b.get('comments')) ? 1 : -1;
            case 'payouts': return parseInt(a.get('total_payouts')) <=  parseInt(b.get('total_payouts')) ? 1 : -1;
        }
    }

    render() {
        const {tagsAll} = this.props;
        //console.log('-- TagsIndex.render -->', tagsAll.toJS());
        const {search, order} = this.state;
        let tags = tagsAll;
        if (search) tags = tags.filter(tag => tag.get('name').indexOf(search.toLowerCase()) !== -1);
        tags = tags.filter(
            // there is a blank tag present, as well as some starting with #. filter them out.
            tag => /^[a-z]/.test(tag.get('name'))
        ).sort((a,b) => {
            return this.compareTags(a, b, order)
        }).map(tag => {
            const name = tag.get('name');
            const link = `/trending/${name}`;
            return (<tr key={name}>
                <td>
                    <Link to={link} activeClassName="active">{name}</Link>
                </td>
                <td>{numberWithCommas(tag.get('top_posts').toString())}</td>
                <td>{numberWithCommas(tag.get('comments').toString())}</td>
                <td>{numberWithCommas(tag.get('total_payouts'))}</td>
            </tr>);
        }).toArray();
        return (
            <div className="TagsIndex row">
                <div className="column">
                    <div className="medium-2 medium-offset-10">
                        <input type="text" placeholder="Filter" value={search} onChange={this.onChangeSearch} />
                    </div>
                    <table>
                        <thead>
                        <tr>
                            <th><Link to="#" onClick={e => this.onChangeSort(e, 'name')}>Tag</Link></th>
                            <th><Link to="#" onClick={e => this.onChangeSort(e, 'posts')}>Posts</Link></th>
                            <th><Link to="#" onClick={e => this.onChangeSort(e, 'comments')}>Comments</Link></th>
                            <th><Link to="#" onClick={e => this.onChangeSort(e, 'payouts')}>Payouts</Link></th>
                        </tr>
                        </thead>
                        <tbody>
                        {tags}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'tags(/:order)',
    component: connect(state => ({
        tagsAll: state.global.get('tags')
    }))(TagsIndex)
};
