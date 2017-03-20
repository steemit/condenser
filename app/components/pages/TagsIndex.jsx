import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
import { browserHistory } from 'react-router';
import { detransliterate } from 'app/utils/ParsersAndFormatters';
import { translate } from 'app/Translator';
import { IGNORE_TAGS, SELECT_TAGS_KEY } from 'config/client_config';
import cookie from "react-cookie";

export default class TagsIndex extends React.Component {
    static propTypes = {
        tagsList: React.PropTypes.object.isRequired,
        tagsAll: React.PropTypes.object.isRequired,
        order: React.PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {search: '', selected: cookie.load(SELECT_TAGS_KEY) || []};
    }

    shouldComponentUpdate(nextProps, nextState) {
        const res = this.props.tagsList !== nextProps.tagsList ||
            this.props.tagsAll !== nextProps.tagsAll ||
            this.props.order !== nextProps.order || this.state !== nextState;
        return res;
    }

    onSelectTag = key => {
      let keys = this.state.selected
      const index = keys.indexOf(key)
      if (index !== -1)
        keys.splice(index, 1)
      else
        keys.push(key)

      this.setState({selected: keys})
      cookie.save(SELECT_TAGS_KEY, keys, {path: "/"});
    }

    onChangeSearch = e => {
        this.setState({search: e.target.value})
    }

    render() {
        const {tagsAll} = this.props;
        //console.log('-- TagsIndex.render -->', tagsAll.toJS());
        //tagsAll.map(v => {
        //    console.log('-- map -->', v.toJS());
        //});
        const {
          state: {search, selected}, onSelectTag
        } = this;
        const order = this.props.routeParams.order;
        let tags = tagsAll;
        let isSelected = false

        if (IGNORE_TAGS) tags = tags.filter(tag => IGNORE_TAGS.indexOf(tag.get('name')) === -1);
        if (search) tags = tags.filter(tag => tag.get('name').indexOf(search.toLowerCase()) !== -1);
        tags = tags.filter(
            // there is a blank tag present, as well as some starting with #. filter them out.
            tag => /^[a-z]/.test(tag.get('name'))
        ).sort((a,b) => {
            return a.get('name').localeCompare(b.get('name'));
        }).map(tag => {
            const tagKey = tag.get('name');
            let name = tagKey;
            if (/[а-яёґєії]/.test(name)) name = 'ru--' + detransliterate(name.toLowerCase(), true)
            const link = order ? `/${order}/${name}` : `/hot/${name}`;
            isSelected = selected.indexOf(name) !== -1
            // const tag_info = tagsAll.get(tag);
            return (<tr key={tagKey}>
                <td className={isSelected ? 'isSelected' : ''}>
                  <a className="action" onClick={() => onSelectTag(name)}>{isSelected ? '×' : '+'}</a>
                  <Link to={link} activeClassName="active">{detransliterate(name)}</Link>
                </td>
                <td>{tag.get('top_posts')}</td>
                <td>{tag.get('comments')}</td>
                <td>{tag.get('total_payouts')}</td>
            </tr>);
        }).toArray();
        return (
            <div className="TagsIndex row">
                <div className="column">
                    <div className="medium-2 medium-offset-10">
                        <input type="text" placeholder={translate('filter')} value={search} onChange={this.onChangeSearch} />
                    </div>
                    <table>
                        <thead>
                        <tr>
                            <th>{translate('tag')}</th>
                            <th>{translate('posts')}</th>
                            <th>{translate('comments')}</th>
                            <th>{translate('payouts')}</th>
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
        tagsList: state.global.get('tag_idx'),
        tagsAll: state.global.get('tags')
    }))(TagsIndex)
};
