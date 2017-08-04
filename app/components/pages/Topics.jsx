import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
import { browserHistory } from 'react-router';
import tt from 'counterpart';
import { detransliterate } from 'app/utils/ParsersAndFormatters';
import { IGNORE_TAGS, SELECT_TAGS_KEY } from 'app/client_config';
import cookie from "react-cookie";

class Topics extends React.Component {
    static propTypes = {
        categories: React.PropTypes.object.isRequired,
        user: React.PropTypes.string,
        metaData: React.PropTypes.object,
        loading: React.PropTypes.bool,
        order: React.PropTypes.string,
        current: React.PropTypes.string,
        loadSelected: React.PropTypes.func,
        updateSubscribe: React.PropTypes.func,
        className: React.PropTypes.string,
        compact: React.PropTypes.bool
    };

    constructor(props) {
        super(props);

        const cookieKeys = cookie.load(SELECT_TAGS_KEY) || [];
        const profileKeys = props.metaData && props.metaData.profile && props.metaData.profile.select_tags || [];
        let keys = cookieKeys
        if (typeof keys !== 'object' || !keys.length) {
          keys = profileKeys
        }
        this.state = {
          expanded: false,
          selected: keys,
          selectedExpanded: false,
          needUpdateSubscribe: cookieKeys.join('') !== profileKeys.join('') || false
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        const res = this.props.categories !== nextProps.categories ||
            this.props.current !== nextProps.current ||
            this.props.order !== nextProps.order || this.state !== nextState;
        return res;
    }

    onSaveTags = () => {
      if (this.props.updateSubscribe)
        this.props.updateSubscribe()
    }

    onSelectTag = key => {
      let keys = this.state.selected
      const index = keys.indexOf(key)
      if (index !== -1)
        keys.splice(index, 1)
      else
        keys.push(key)
      keys.sort()
      this.setState({selected: keys})
      cookie.save(SELECT_TAGS_KEY, keys, {path: "/", expires: new Date(Date.now() + 60 * 60 * 24 * 365 * 10 * 1000)});
      if (! this.props.loading && this.props.loadSelected)
        this.props.loadSelected(keys)

      const profileKeys = this.props.metaData && this.props.metaData.profile && this.props.metaData.profile.select_tags || [];
      this.setState({needUpdateSubscribe: keys.join('') !== profileKeys.join('')})
    }

    expand = (e) => {
        e.preventDefault();
        this.setState({expanded: true});
        return false;
    }

    onSelectExpand = (e) => {
        e.preventDefault();
        this.setState({selectedExpanded: ! this.state.selectedExpanded});
        return false;
    }

    render() {
        const {
            props: {order, current, compact, className, user},
            state: {expanded, selected, selectedExpanded},
            onSelectTag, onSaveTags, expand, onSelectExpand
        } = this;

        if (!this.props.categories)
            return

        let categories = this.props.categories.get('trending');
        if (!(expanded) || compact) categories = categories.take(50);

        const cn = 'Topics' + (className ? ` ${className}` : '');
        const currentValue = `/${order}/${current}`;
        const selectedKeys = selected.map(key => {
          const link = order ? `/${order}/${key}` : `/${key}`;
          return <div key={`selected-${key}`}>
            <a className="action" onClick={() => onSelectTag(key)}>×</a><Link to={link} className="tagname" activeClassName="active" title={detransliterate(key)}>{detransliterate(key)}</Link>
          </div>
        })
        const expandFilterButton = selectedKeys.length > 2 &&
          selectedExpanded ?
            <a onClick={onSelectExpand} className="expand">{tt('g.collapse')} &uarr;</a> :
            <a onClick={onSelectExpand} className="expand">{tt('g.expand')} &darr;</a>
        ;
        let isSelected = false

        if (compact) {
            return <select className={cn} onChange={(e) => browserHistory.push(e.target.value)} value={currentValue}>
                <option key={'*'} value={'/' + order}>{tt('g.topics')}...</option>
                {categories.map(cat => {
                    const catKey = cat
                    if (/[а-яёґєії]/.test(cat)) cat = 'ru--' + detransliterate(cat, true)
                    const link = order ? `/${order}/${cat}` : `/${cat}`;
                    return <option key={catKey} value={link}>{detransliterate(cat)}</option>
                })}
            </select>;
        }

        if (IGNORE_TAGS) categories = categories.filter(val => IGNORE_TAGS.indexOf(val) === -1);
        categories = categories.map(cat => {
            const catKey = cat
            if (/[а-яёґєії]/.test(cat)) cat = 'ru--' + detransliterate(cat.toLowerCase(), true)
            if (/^(u\w{4}){3,}\w+/.test(cat)) return null;
            if (/ru--lesnik-sluchaijnayavst/.test(cat)) return null;
            const link = order ? `/${order}/${cat}` : `/${cat}`;
            isSelected = selected.indexOf(cat) !== -1
            return cat ? (<li key={catKey} className={isSelected ? 'Topics__selected__remove' : 'Topics__selected__add'}>
                        <a className="action" onClick={() => onSelectTag(cat)}>{isSelected ? '×' : '+'}</a>
                        <Link to={link} className="tagname" activeClassName="active" title={detransliterate(cat)}>{detransliterate(cat)}</Link>
                    </li>) : null;
        });
        return (
            <ul className={cn}>
                <li className={`Topics__filter ${selectedExpanded ? 'filter_expanded' : 'filter_fixed'}`} key="filter">
                  <b>{tt('g.tags_filter')}</b>{' ('+ selectedKeys.length + ')'}&nbsp;&nbsp;&nbsp;
                  <input
                    onClick={onSaveTags}
                    disabled={! this.state.needUpdateSubscribe}
                    type="button"
                    className="button"
                    value={tt('g.save')}
                  />
                  {selectedKeys.length ? selectedKeys : <div><span>{tt('g.no_tags_selected')}</span></div>}
                </li>
                <li className="Topics__filter__expand" key="filter__expand_action">{expandFilterButton}</li>
                <li className="Topics__title" key={'*'}>{tt('g.tags_and_topics')}</li>
                {categories}
                {!expanded && <li className="show-more">
                        <Link to={`/tags`}>{tt('g.show_more_topics')}...</Link>
                    </li>
                }
            </ul>
        );
    }
}

export default connect(state => ({
    categories: state.global.get('tag_idx')
}))(Topics);
