import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types'
import reactForm from 'app/utils/ReactForm';
import {List, Map, fromJS} from 'immutable';
import { Link } from 'react-router';
import Icon from 'app/components/elements/Icon';
import transaction from 'app/redux/Transaction';
import user from 'app/redux/User';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import {validate_account_name} from 'app/utils/ChainValidation';
import Userpic from 'app/components/elements/Userpic';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Tooltip from 'app/components/elements/Tooltip';
import tt from 'counterpart';
import { api, memo as memoFunc } from 'golos-js'


class MessageBox extends Component {

    static propTypes = {
        // connector props
        username: PropTypes.string,
        history: PropTypes.object,
        loading: PropTypes.bool,
        fetching: PropTypes.bool,
    };

    constructor(props) {
        super()
        this.state = {
            conversations: Map(),
            selected: null,
            searchField: '',
            filtered: Map(),
            lookupValues: [],
            isLookingUp: false,
            sending: false
        };
        this.initForm(props)
    }

    initForm(props) {
        reactForm({
            instance: this,
            name: 'converstaionForm',
            fields: ['memo'],
            initialValues: props.initialValues,
            validation: values => ({
              memo: null
            })
        })
    }

    prepareConversations(np, ns) {
        const { history, username } = np;
        if (history && history.size) {
            let tmp = {};
            history.reverse().map(item => {
                if (item.getIn([1, 'op', 0]) !== 'transfer') return;
                const data = item.getIn([1, 'op', 1]).toJS();
                const conversant = username === data.from ? data.to : data.from;
                if (typeof tmp[conversant] !== 'object') tmp[conversant] = [];
                if (/^#/.test(data.memo)) {
                    tmp[conversant].push({
                        isnew: false,
                        from: data.from,
                        to: data.to,
                        amount: data.amount,
                        memo: data.memo,
                        timestamp: item.getIn([1, 'timestamp'])
                    });
                }
            });
            this.setState({conversations: Map(fromJS(tmp))});
        }
    }

    componentWillMount() {
      this.props.dispatchGetHistory({account: this.props.username});
    }

    componentDidMount() {}

    componentWillReceiveProps(np, ns) {
      this.prepareConversations(np, ns);
    }

    onSelectListItem = key => {
      this.setState({selected: key});
    }

    errorCallback = errorStr => {
      this.setState({trxError: errorStr, loading: false});
    }

    clearError = () => {
      this.setState({trxError: undefined});
    }

    onChangeMemo = (e) => {
      const {value} = e.target;
      this.state.memo.props.onChange(value);
    }

    dispatchSubmit = (formPayload) => {
        const { dispatchSendMessage, username } = this.props
        const { to, memo } = formPayload
        let memoStr = `# ${memo}`
        dispatchSendMessage({
            operation: {
                from: username,
                to,
                amount: '0.001 GOLOS',
                memo: memoStr
            },
            errorCallback: this.errorCallback
        });
    }

    lookupAccount(name) {
        let lookupValues = [];
        let isLookingUp = true;
        let promise;
        if (name.length > 0) {
            promise = api.lookupAccountsAsync(name, 7).then(res => {
                return res && res.length ? res : [];
            });
        }
        if (promise) {
            promise
            .then(lookupValues => this.setState({lookupValues, isLookingUp: false}))
            .catch(() => this.setState({lookupValues, isLookingUp: false}));
            this.setState({lookupValues, isLookingUp});
        } else {
            isLookingUp = false;
            this.setState({lookupValues, isLookingUp});
        }
    }

    onChangeSearch = (e) => {
        const searchField = e.target.value;
        if (this.state.isLookingUp) return;
        let filtered = Map();
        let lookupValues = this.state.lookupValues;
        if (searchField.length) {
            const {conversations} = this.state;
            filtered = conversations.filter((value, key) => {return key.indexOf(searchField) !== -1});
            if (searchField.length > 2) {
                const inFiletered = filtered.filter((value, key) => {return key.indexOf(searchField) === 0});
                if (inFiletered.size == 0) {
                  this.lookupAccount(searchField);
                }
            }
            else {
              lookupValues = [];
            }
        }
        else {
          lookupValues = [];
        }
        this.setState({
          searchField,
          filtered,
          lookupValues,
        });
    }

    fillLookupObject(items, username) {
      let tmp = {};
      for (let i in items) {
          if (typeof tmp[items[i]] !== 'object') tmp[items[i]] = [];
          tmp[items[i]].push({
              isnew: true,
              from: username,
              to: items[i],
              memo: ' ',
              timestamp: new Date()
          });
      }
      return tmp;
    }

    render() {
        const {
            conversations,
            filtered,
            selected,
            searchField,
            lookupValues,
            isLookingUp,
            memo,
            converstaionForm : {handleSubmit}
        } = this.state;
        const { username, memo_private } = this.props;
        const fetching = this.props.loading || this.props.fetching || false;

        let result = Map(fromJS(this.fillLookupObject(lookupValues, username))).merge(searchField.length ? filtered : conversations).sort(
          (a, b) => new Date(a.getIn([0, 'timestamp'])) < new Date(b.getIn([0, 'timestamp']))
        );
        let selectedKey = selected;
        if (!selectedKey) {
            selectedKey = result.keySeq().first();
        }
        const conversationsList = [];
        result.map((value, key) => {
            const isNew = value.getIn([0, 'isnew']);
            let memo = value.getIn([0, 'memo']);
            memo = typeof memo !== 'string' ? JSON.stringify(memo) : memo;
            if (/^#/.test(memo)) {
                const memoStr = memoFunc.decode(memo_private, memo).substr(1);
                conversationsList.push(
                    <li key={`conversant-${key}`} className={key == selectedKey ? 'selected' : ''} onClick={() => this.onSelectListItem(key)}>
                        <Tooltip className="timestamp" t={new Date(value.getIn([0, 'timestamp'])).toLocaleString()}>
                            <TimeAgoWrapper date={value.getIn([0, 'timestamp'])} />
                        </Tooltip>
                        <Userpic account={key} />
                        <div className="right-side">
                            <strong>{key}</strong>
                            <small>{isNew ? '*' : memoStr}</small>
                        </div>
                    </li>
                )
            }
        });

        const conversantionBody = [];
        result.get(selectedKey, Map()).reverse().map((value, key) => {
            const isNew = value.get('isnew');
            const memo = value.get('memo');
            const memoStr = memoFunc.decode(memo_private, memo).substr(1);
            conversantionBody.push( 
                <li key={`conversation-item-${key}`}>
                    {isNew ? null : <Userpic account={value.get('from')} width="36" height="36"/>}
                    {isNew ? null : <div className="right-side">
                        <strong>{value.get('from')}</strong>
                        <Tooltip className="timestamp" t={new Date(value.get('timestamp')).toLocaleString()}>
                            <TimeAgoWrapper date={value.get('timestamp')} />
                        </Tooltip>
                        <small>{memoStr}</small>
                    </div>}
                </li>
            )
        });

        return (<div className={'Messages row' + (fetching ? ' fetching' : '')}>
            <div className="Messages__left column shrink small-collapse">
                <div className="topbar">
                    <form>
                        <input
                            type="text"
                            ref="searchRef"
                            placeholder={tt("g.username")}
                            onChange={this.onChangeSearch}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            disabled={fetching}
                            value={searchField}
                        />
                    </form>
                </div>
                <ul className="List">
                    {conversationsList}
                    {isLookingUp && <li><center><LoadingIndicator type="circle" /></center></li>}
                </ul>
            </div>
            <div className="Messages__right column show-for-large">
                <div className="topbar">
                    <div className="row">
                        <div className="column small-10">
                            <Userpic account={selectedKey} width="36" height="36"/>
                            <h6>{selectedKey}</h6>
                        </div>
                        <div className="column small-2"></div>
                    </div>
                </div>
                <ul className="Conversation">
                    {conversantionBody}
                </ul>
                <div className="bottombar">
                  <form onSubmit={handleSubmit(({data}) => {this.dispatchSubmit({...data, to: selectedKey})})}>
                    <div className="row">
                        <div className="column small-10">
                            <input
                                {...memo.props}
                                type="text"
                                ref="memo"
                                placeholder={tt('g.reply')}
                                onChange={this.onChangeMemo}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                disabled={fetching}
                            />
                        </div>
                        <div className="column small-2">
                            <button
                                type="submit"
                                className="button"
                                disabled={fetching}
                                onChange={this.clearError}
                            >
                                {tt('g.submit')}
                            </button>
                        </div>
                    </div>
                  </form>
                </div>
            </div>
            {fetching && <div className="Messages__fetching"><LoadingIndicator type="circle" /></div>}
        </div>)
    }
}

import {connect} from 'react-redux'

export default connect(
    (state, ownProps) => {
        const username = state.user.getIn(['current', 'username']);
        const history  = state.global.getIn(['accounts', username, 'transfer_history']);
        const loading  = state.app.get('loading');
        const fetching = state.global.get('fetching');
        const memo_private = state.user.getIn(['current', 'private_keys', 'memo_private'])
        const initialValues = { memo: null }
        return {
            ...ownProps,
            initialValues,
            username,
            history,
            loading,
            fetching,
            memo_private
        }
    },
    dispatch => ({
        dispatchGetHistory: ({account}) => {
          dispatch({type: 'FETCH_STATE', payload: {pathname: `@${account}/transfers`}})
        },
        dispatchSendMessage: ({
            operation,
            errorCallback,
        }) => {
            const successCallback = () => {
                dispatch({type: 'FETCH_STATE', payload: {pathname: `@${operation.from}/transfers`}})
            }
            dispatch(transaction.actions.broadcastOperation({
                type: 'transfer',
                operation,
                successCallback,
                errorCallback,
            }))
        }
    })
)(MessageBox)
