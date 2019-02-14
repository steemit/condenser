import React, { Component } from 'react';

import { SearchHeader, SearchItem } from '../Components';
import { MockItems } from '../DummyData';

const pageSize = 20;

class HomeContainer extends Component {
  constructor(props) {
    super(props);
    const hasSearch = props.location.query.search;
    const hasType = props.location.query.type;
    let items = hasSearch
      ? MockItems.filter(item => item.title.indexOf(hasSearch) !== -1)
      : MockItems;
    items = hasType ? items.filter(item => item.type === hasType) : items;
    items = props.userOnly
      ? items.filter(item => item.user.name === props.userOnly)
      : items;

    this.state = {
      // loading: true,
      isPaneOpen: true,
      hasSearch,
      hasType,
      items,
      limit: pageSize,
      sortBy: null,
    };

    this.updateLimit = this.updateLimit.bind(this);
    this.updateState = this.updateState.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const hasSearch = newProps.location.query.search;
    let hasType = null;
    if (window) {
      let query = window.location.search;
      query = query.substr(1);
      query = query.split('&');
      query.forEach(q => {
        const splits = q.split('=');
        if (splits[0] === 'type') {
          hasType = splits[1];
        }
      });
    }
    if (hasSearch !== this.state.hasSearch || hasType !== this.state.hasType) {
      let items = hasSearch
        ? MockItems.filter(item => item.title.indexOf(hasSearch) !== -1)
        : MockItems;
      items = hasType ? items.filter(item => item.type === hasType) : items;
      items = newProps.userOnly
        ? items.filter(item => item.user.name === newProps.userOnly)
        : items;
      this.setState({
        hasSearch,
        hasType,
        items,
        limit: pageSize,
      });
    }
  }

  updateLimit() {
    const { limit, items } = this.state;
    this.setState({
      limit: Math.min(limit + pageSize, items.length),
    });
  }

  updateState(key, value) {
    const updates = { [key]: value };
    const getVotes = v => v.up - v.down;
    if (key === 'sortBy') {
      let items = this.state.items;
      if (value.value === 'latest') {
        items = items.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      } else if (value.value === 'top_votes') {
        items = items.sort((a, b) => getVotes(b.votes) - getVotes(a.votes));
      }
      updates.items = items;
    }
    this.setState(updates);
  }

  disaplyItems() {
    const { items, limit } = this.state;
    return new Array(Math.min(limit, items.length))
      .fill(1)
      .map((key, index) => items[index])
      .filter(item => item !== null);
  }

  render() {
    // const { items, relatedItems } = search || {};
    const { isPaneOpen, hasSearch, limit, items, sortBy } = this.state;
    const disaplyItems = this.disaplyItems();

    return (
      <div className={`HomeWrapper ${isPaneOpen ? 'Open' : 'Close'}`}>
        <div className="Content">
          <div className="Results">
            <SearchHeader
              hasSearch={hasSearch}
              updateState={this.updateState}
              sortBy={sortBy}
            />
            {disaplyItems.map((item, index) => (
              <SearchItem data={item} key={`${index}-${item.id}`} />
            ))}
            {disaplyItems.length === 0 ? (
              <div className="NoPost">-- No Posts --</div>
            ) : null}
            {limit < items.length && (
              <div className="More">
                <a onClick={this.updateLimit}>See more topics</a>
              </div>
            )}
          </div>
        </div>
        {/* <div className="RelatedItems">
          <h1>Related</h1>
          {RelatedItems.map((item, index) => (
            <SearchRelatedItem data={item} key={`${index}-${item.id}`} />
          ))}
          <div className="More">
            <a onClick={this.updateLimit}>See more related topics</a>
          </div>
        </div> */}
      </div>
    );
  }
}

export default HomeContainer;
