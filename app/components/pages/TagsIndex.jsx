import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
import { browserHistory } from 'react-router';
import { numberWithCommas } from 'app/utils/StateFunctions';
import tt from 'counterpart';
import { detransliterate } from 'app/utils/ParsersAndFormatters';
import { IGNORE_TAGS, SELECT_TAGS_KEY } from 'app/client_config';
import cookie from "react-cookie";

export default class TagsIndex extends React.Component {
    static propTypes = {
        tagsAll: React.PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {order: props.order || 'name', selected: cookie.load(SELECT_TAGS_KEY) || []};
        this.onChangeSort = this.onChangeSort.bind(this)
    }

    shouldComponentUpdate(nextProps, nextState) {
        const res = this.props.tagsAll !== nextProps.tagsAll ||
            this.state !== nextState;
        return res;
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

    onSelectTag = key => {
      let keys = this.state.selected
      const index = keys.indexOf(key)
      if (index !== -1)
        keys.splice(index, 1)
      else
        keys.push(key)

      this.setState({selected: keys})
      cookie.save(SELECT_TAGS_KEY, keys, {path: "/", expires: new Date(Date.now() + 60 * 60 * 24 * 365 * 10 * 1000)});
    }

    render() {
        const {tagsAll} = this.props;
        const { state: { order, selected }, onSelectTag } = this;
        let tags = tagsAll;
        let isSelected = false

        if (IGNORE_TAGS) tags = tags.filter(tag => IGNORE_TAGS.indexOf(tag.get('name')) === -1);

        const rows = tags.filter(
            // there is a blank tag present, as well as some starting with #. filter them out.
            tag => /^[a-z]/.test(tag.get('name'))
        ).sort((a,b) => {
            return this.compareTags(a, b, order)
        }).map(tag => {
            let name = tag.get('name');
            const link = `/trending/${name}`;

            if (/[а-яёґєії]/.test(name)) {
              name = 'ru--' + detransliterate(name.toLowerCase(), true)
            }
            isSelected = selected.indexOf(name) !== -1

            return (<tr key={tag.get('name')}>
                <td className={isSelected ? 'isSelected' : ''}>
                    <a className="action" onClick={() => onSelectTag(name)}>{isSelected ? '×' : '+'}</a>
                    <Link to={link} activeClassName="active">{detransliterate(name)}</Link>
                </td>
                <td>{numberWithCommas(tag.get('top_posts').toString())}</td>
                <td>{numberWithCommas(tag.get('comments').toString())}</td>
                <td>{numberWithCommas(tag.get('total_payouts'))}</td>
            </tr>);
        }).toArray();

        const cols = [
            ['name', tt('g.tag')],
            ['posts', tt('g.posts')],
            ['comments', tt('g.comments')],
            ['payouts', tt('g.payouts')]
        ].map( col => {
            return <th key={col[0]}>
                    {order === col[0]
                        ? <strong>{col[1]}</strong>
                        : <Link to="#" onClick={e => this.onChangeSort(e, col[0])}>{col[1]}</Link>}
                </th>
        })

        return (
            <div className="TagsIndex row">
                <div className="column">
                    <br />
                    <h4>{tt('g.trending_topics')}</h4>
                    <table>
                        <thead>
                        <tr>
                            {cols}
                        </tr>
                        </thead>
                        <tbody>
                            {rows}
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
