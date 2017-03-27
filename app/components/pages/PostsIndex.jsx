/* eslint react/prop-types: 0 */
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import Topics from './Topics';
import constants from 'app/redux/constants';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import PostsList from 'app/components/cards/PostsList';
import {isFetchingOrRecentlyUpdated} from 'app/utils/StateFunctions';
import {Link} from 'react-router';
import MarkNotificationRead from 'app/components/elements/MarkNotificationRead';
import { translate } from 'app/Translator';
import Immutable from "immutable";
import Callout from 'app/components/elements/Callout';
import cookie from "react-cookie";
import { SELECT_TAGS_KEY } from 'config/client_config';
import transaction from 'app/redux/Transaction'
import o2j from 'shared/clash/object2json'

class PostsIndex extends React.Component {

  static propTypes = {
    discussions: PropTypes.object,
    accounts: PropTypes.object,
    status: PropTypes.object,
    routeParams: PropTypes.object,
    requestData: PropTypes.func,
    loading: PropTypes.bool,
    username: PropTypes.string
  };

  static defaultProps = {
    showSpam: false,
    loading: false,
    changed: false,
    errorMessage: '',
    successMessage: '',
  }

  constructor() {
    super();
    this.state = {}
    this.loadMore = this.loadMore.bind(this);
    this.loadSelected = this.loadSelected.bind(this);
    this.updateSubscribe = this.updateSubscribe.bind(this);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'PostsIndex')
  }

  componentDidUpdate(prevProps) {
    if (window.innerHeight && window.innerHeight > 3000 && prevProps.discussions !== this.props.discussions) {
      this.refs.list.fetchIfNeeded();
    }
  }

  getPosts(order, category) {
    let select_tags = cookie.load(SELECT_TAGS_KEY);
    select_tags = typeof select_tags === 'object' ? select_tags.sort().join('/') : '';
    const topic_discussions = this.props.discussions.get(category || select_tags);
    if (!topic_discussions) return null;
    return topic_discussions.get(order);
  }

  updateSubscribe() {
    const {accounts, username} = this.props
    const account = accounts.get(username).toJS()
    let metaData = account ? o2j.ifStringParseJSON(account.json_metadata) : {}
    if (!metaData) metaData = {}
    if (!metaData.profile) metaData.profile = {}

    let select_tags = cookie.load(SELECT_TAGS_KEY);
    metaData.profile.select_tags = typeof select_tags === 'object' ? select_tags : '';
    if (!metaData.profile.select_tags) delete metaData.profile.select_tags;

    this.props.updateAccount({
      json_metadata: JSON.stringify(metaData),
      account: account.name,
      memo_key: account.memo_key,
      errorCallback: (e) => {
        if (e === 'Canceled') {
          this.setState({
            loading: false,
            errorMessage: ''
          })
        } else {
          console.log('updateAccount ERROR', e)
          this.setState({
            loading: false,
            changed: false,
            errorMessage: translate('server_returned_error')
          })
        }
      },
      successCallback: () => {
        this.setState({
          loading: false,
          changed: false,
          errorMessage: '',
          successMessage: translate('saved') + '!',
        })
        // remove successMessage after a while
        setTimeout(() => this.setState({successMessage: ''}), 4000)
      }
    })
  }

  loadMore(last_post) {
    if (!last_post) return;
    let {accountname} = this.props.routeParams
    let {category, order = constants.DEFAULT_SORT_ORDER} = this.props.routeParams;
    if (category === 'feed') {
      accountname = order.slice(1);
      order = 'by_feed';
    }
    if (isFetchingOrRecentlyUpdated(this.props.status, order, category)) return;
    const [author, permlink] = last_post.split('/');
    this.props.requestData({author, permlink, order, category, accountname});
  }

  loadSelected(keys) {
    let {accountname} = this.props.routeParams
    let {category, order = constants.DEFAULT_SORT_ORDER} = this.props.routeParams;
    if (category === 'feed') {
      accountname = order.slice(1);
      order = 'by_feed';
    }
    // if (isFetchingOrRecentlyUpdated(this.props.status, order, category)) return;
    this.props.requestData({order, keys});
  }

  onShowSpam = () => {
    this.setState({showSpam: !this.state.showSpam})
  }

  render() {
    let {category, order = constants.DEFAULT_SORT_ORDER} = this.props.routeParams;
    let topics_order = order;
    let posts = [];
    let emptyText = '';
    let markNotificationRead = null;
    if (category === 'feed') {
      const account_name = order.slice(1);
      order = 'by_feed';
      topics_order = 'trending';
      posts = this.props.accounts.getIn([account_name, 'feed']);
      const isMyAccount = this.props.username === account_name;
      if (isMyAccount) {
        emptyText = <div>
          {translate('user_hasnt_followed_anything_yet', {name: account_name})}
          <br /><br />
          <a href="/trending">{translate('research_it')}</a>
          <br />
          <a href="/welcome">{translate('welcome_to_the_blockchain')}</a>
          <br />
          <a href="https://golos.io/ru--golos/@bitcoinfo/samyi-polnyi-f-a-q-o-golose-spisok-luchshykh-postov-raskryvayushikh-vse-aspekty-proekta-bonusy-v-vide-kreativa">{translate('full_faq')}</a>
        </div>;
        markNotificationRead = <MarkNotificationRead fields="feed" account={account_name} />
      } else {
        emptyText = <div>{translate('user_hasnt_followed_anything_yet', {name: account_name})}</div>;
      }
    } else {
      posts = this.getPosts(order, category);
      if (posts && posts.size === 0) {
        // emptyText = <div>{`No ` + topics_order + (category ? ` #` + category : '') +  ` posts found`}</div>;
        emptyText = <div>{translate('no_topics_by_order_found', {order: translate(topics_order) + (category ? ` #` + category : '')})}</div>;

      }
    }

    const status = this.props.status ? this.props.status.getIn([category || '', order]) : null;
    const fetching = (status && status.fetching) || this.props.loading || this.props.fetching || false;
    const {showSpam} = this.state;
    const account = this.props.username && this.props.accounts.get(this.props.username) || null
    const json_metadata = account ? account.toJS().json_metadata : {}
    const metaData = account ? o2j.ifStringParseJSON(json_metadata) : {}

    return (
      <div className={'PostsIndex row' + (fetching ? ' fetching' : '')}>
        <div className="PostsIndex__left column small-collapse">
          <div className="PostsIndex__topics_compact show-for-small hide-for-large">
            <Topics order={topics_order} current={category} loading={fetching} loadSelected={this.loadSelected} compact />
          </div>
          {markNotificationRead}
          {(!fetching && (posts && !posts.size)) ? <Callout>{emptyText}</Callout> :
            <PostsList
              ref="list"
              posts={posts ? posts : Immutable.List()}
              loading={fetching}
              category={category}
              loadMore={this.loadMore}
              showSpam={showSpam}
            />}
        </div>
        <div className="PostsIndex__topics column shrink show-for-large">
          <Topics
            order={topics_order}
            current={category}
            loading={fetching}
            loadSelected={this.loadSelected}
            compact={false}
            user={this.props.username}
            updateSubscribe={this.updateSubscribe}
            metaData={metaData}
          />
          <small><a onClick={this.onShowSpam}>{translate(showSpam ? 'show_less' : 'show_more')}</a>{' ' + translate('value_posts')}</small>
        </div>
      </div>
    );
  }
}

module.exports = {
  path: ':order(/:category)',
  component: connect(
    (state) => {
      return {
        discussions: state.global.get('discussion_idx'),
        status: state.global.get('status'),
        loading: state.app.get('loading'),
        fetching: state.global.get('fetching'),
        accounts: state.global.get('accounts'),
        username: state.user.getIn(['current', 'username']) || state.offchain.get('account'),
      };
    },
    (dispatch) => {
      return {
        requestData: (args) => dispatch({type: 'REQUEST_DATA', payload: args}),
        updateAccount: ({successCallback, errorCallback, ...operation}) => {
          // console.log(operation)
          const options = {type: 'account_update', operation, successCallback, errorCallback}
          dispatch(transaction.actions.broadcastOperation(options))
        }
      }
    }
  )(PostsIndex)
};
