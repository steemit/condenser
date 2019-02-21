import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Set } from 'immutable';
import { Link, browserHistory } from 'react-router';

// import PropTypes from 'prop-types';
import { ThumbsDown, ThumbsUp, X } from 'react-feather';
import { Sidebar, Segment, Menu } from 'semantic-ui-react';

// import 'katex/dist/katex.min.css';
// import { InlineMath } from 'react-katex';

import defaultUser from 'assets/images/static/user1.png';
import graph1 from 'assets/images/static/graph/1.png';
import graph2 from 'assets/images/static/graph/2.png';
import graph3 from 'assets/images/static/graph/3.png';
import HighLight from 'app/components/pages/_Common/HighLight';
import Label from 'app/components/pages/_Common/Label';
import SideMenu from 'app/components/pages/_Common/SideMenu';
import Create from 'app/components/pages/Posts/Create';
import { Home } from 'app/components/pages/Home/Components';
// import BrowsingHistory from './Components/BrowsingHistory';
import { Nodes, HightLights, Note } from './DummyData';
import { MockItemDictionary } from '../Home/DummyData';

class Node extends Component {
  constructor(props) {
    super(props);
    const nodeId = this.getNodeId(props);

    this.state = {
      nodeId,
      data: MockItemDictionary[nodeId],
      citesVisible: false,
      citedByVisible: false,
      highlightInfo: null,
      highlightIndex: -1,
      panelType: 'review',
    };

    this.onHighLight = this.onHighLight.bind(this);
    this.onCreatePost = this.onCreatePost.bind(this);
    this.onReview = this.onReview.bind(this);
    this.onCitedBy = this.onCitedBy.bind(this);
    this.placeHightLights = this.placeHightLights.bind(this);
  }

  componentDidMount() {
    const { nodeId } = this.state;
    if (!MockItemDictionary[nodeId]) {
      browserHistory.push('/');
    }
  }

  componentWillReceiveProps(newProps) {
    const { nodeId } = this.state;
    const newNodeId = this.getNodeId(newProps);
    if (newNodeId !== nodeId) {
      this.setState({ nodeId: newNodeId, data: MockItemDictionary[newNodeId] });
    }
  }

  getNodeId(props) {
    const route_params = props.routeParams;
    const id = route_params.slug;
    return id;
  }

  getParams(key) {
    const { match: { params } } = this.props;
    return params[key];
  }

  toggleCitesPanel = () =>
    this.setState({ citesVisible: !this.state.citesVisible });
  toggleCitedByPanel = () =>
    this.setState({
      citedByVisible: !this.state.citedByVisible,
    });
  closeCitesPanel = () => this.setState({ citesVisible: false });
  closeCitedByPanel = () => this.setState({ citedByVisible: false });

  placeHightLights(note) {
    const ret = note
      .trim()
      .replace(/\n/g, ' ')
      .split('<br />');
    const highLighted = {};
    HightLights.forEach((highlight, hIndex) => {
      if (note.indexOf(highlight.data) !== -1) {
        if (!highLighted[highlight.data]) {
          highLighted[highlight.data] = highlight.data;
        }
        const data = highLighted[highlight.data];
        ret.forEach((retItem, index) => {
          if (retItem.indexOf(highlight.data) !== -1) {
            highLighted[highlight.data] = data.replace(
              highlight.anchorText,
              `<Mark>${hIndex}--${highlight.anchorText}</Mark><Mark>`
            );
            ret[index] = retItem.replace(data, highLighted[highlight.data]);
          }
        });
      }
    });

    return ret.map((retItem, index) => {
      const trimed = retItem.trim();
      if (trimed.length <= 0)
        return [<br key={index + '-1'} />, <br key={index + '-2'} />];
      const texts = trimed.split('<Mark>');
      return texts.map((text, tIndex) => {
        if (text.indexOf('</Mark>') === -1) {
          return text;
        }
        const info = text.split('--');
        return (
          <span
            key={index + '-' + tIndex}
            onClick={() => this.onHighLight(info[0])}
          >
            {info[1].replace('</Mark>', '')}
          </span>
        );
      });
    });
  }

  onHighLight(highlightIndex = -1) {
    this.setState(
      {
        panelType: 'highlight',
        highlightInfo: null,
        highlightIndex,
      },
      this.toggleCitedByPanel
    );
  }

  onCreatePost(type, selection, highLight) {
    this.setState(
      {
        panelType: 'create_post',
        highlightInfo: { type, selection, highLight },
        highlightIndex: -1,
      },
      this.toggleCitedByPanel
    );
  }

  onReview() {
    this.setState(
      {
        panelType: 'review',
        highlightInfo: null,
        highlightIndex: -1,
      },
      this.toggleCitedByPanel
    );
  }

  onCitedBy() {
    this.setState(
      {
        panelType: 'cited_by',
        highlightInfo: null,
        highlightIndex: -1,
      },
      this.toggleCitedByPanel
    );
  }

  onClickSideMenu = menuItemType => {
    const types = ['Ob', 'Qu', 'Hy', 'R'];
    if (types.indexOf(menuItemType) > -1) {
      this.setState(
        {
          panelType: 'create_post',
          highlightInfo: { type: menuItemType },
        },
        this.toggleCitedByPanel
      );
    }
  };

  render() {
    if (this.state.data == null) return <div>Loading</div>;
    const {
      data: { title, type, user, votes, date, reviews, label, from },
      cites,
      citedBy,
    } = this.state.data;
    const nodeFrom = MockItemDictionary[from.id] || null;
    const citesPanel = this.state.citesVisible;
    const citedByPanel = this.state.citedByVisible;
    const voteCount = (votes.up || 0) - (votes.down || 0);

    const { highlightInfo, highlightIndex, panelType } = this.state;
    const highlightData =
      highlightIndex === -1 ? null : HightLights[highlightIndex];
    const hNode = highlightData ? Nodes[highlightData.node] : null;
    const citedPosts = cites
      .map(postId => MockItemDictionary[postId].data)
      .sort((a, b) => {
        const voteCountA = (a.votes.up || 0) - (a.votes.down || 0);
        const voteCountB = (b.votes.up || 0) - (b.votes.down || 0);
        return voteCountB - voteCountA;
      });
    const citedByPosts = citedBy
      .map(postId => MockItemDictionary[postId].data)
      .sort((a, b) => {
        const voteCountA = (a.votes.up || 0) - (a.votes.down || 0);
        const voteCountB = (b.votes.up || 0) - (b.votes.down || 0);
        return voteCountB - voteCountA;
      });

    return (
      <div className="NodeWrapper">
        <Sidebar.Pushable as={Segment}>
          <Sidebar
            as={Menu}
            animation="overlay"
            direction="left"
            icon="labeled"
            inverted
            vertical
            visible={citesPanel}
            width="wide"
            onHide={this.closeCitesPanel}
          >
            <div className="Panel Left">
              <div>
                <div className="NodeHeader">
                  <div>Citations</div>
                  <X
                    style={{ color: '#bbb' }}
                    size={20}
                    onClick={this.closeCitesPanel}
                  />
                </div>
                <Home
                  location={this.props.location}
                  posts={citedPosts}
                  noSearch
                />
              </div>
            </div>
          </Sidebar>

          <Sidebar
            as={Menu}
            animation="overlay"
            direction="right"
            inverted
            vertical
            width="wide"
            visible={citedByPanel}
            onHide={this.closeCitedByPanel}
          >
            <div className="Panel">
              <div>
                <div className="NodeHeader">
                  <div>{getTitle(panelType)}</div>
                  <X
                    style={{ color: '#bbb' }}
                    size={20}
                    onClick={this.closeCitedByPanel}
                  />
                </div>
                {panelType === 'cited_by' && (
                  <Home
                    location={this.props.location}
                    posts={citedByPosts}
                    noSearch
                  />
                )}
                {panelType === 'highlight' && (
                  <div>
                    <div className="Main">Currently selected:</div>
                    <div
                      className="Highlight"
                      dangerouslySetInnerHTML={{
                        __html: highlightData.data.replace(
                          highlightData.anchorText,
                          `<span>${highlightData.anchorText}</span>`
                        ),
                      }}
                    />
                    <div className="Main">All Highlights:</div>
                    {HightLights.map(highlightData => (
                      <div
                        className="Highlight"
                        dangerouslySetInnerHTML={{
                          __html: highlightData.data.replace(
                            highlightData.anchorText,
                            `<span>${highlightData.anchorText}</span>`
                          ),
                        }}
                      />
                    ))}
                  </div>
                )}
                {panelType === 'create_post' && (
                  <div>
                    {highlightInfo &&
                      highlightInfo.highLight && (
                        <div>
                          <div className="Main">
                            You <span>highlighted</span>:
                          </div>
                          <div className="Highlight">
                            {highlightInfo.highLight.anchorText}
                          </div>
                        </div>
                      )}
                    <Create
                      type={highlightInfo.type}
                      node={this.state.data.data}
                    />
                  </div>
                )}
                {panelType === 'review' && (
                  <div className="Sections">
                    {[0, 1].map((key, index) => (
                      <section key={index}>
                        <div className="NodeHeader">
                          <div className="Wrap">
                            <div className="User">
                              <img src={defaultUser} alt={user.name} />
                              <div>
                                <div className="UserName">{user.name}</div>
                                <div className="UserTitle">{user.title}</div>
                              </div>
                            </div>
                          </div>
                          <div className="Extra">
                            <div className="Date">{date}</div>
                            <div className="Reviews">{reviews} Reviews</div>
                          </div>
                        </div>
                        <div className="Title">{title}</div>
                        <div className="Content">
                          There are many variations of passages of Lorem Ipsum
                          available, but the majority have suffered alteration
                          in some form, , or randomised words which don't look
                          even slightly believable.
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Sidebar>

          <Sidebar.Pusher>
            <div className="NodeInfo">
              {/* <BrowsingHistory /> */}
              <div className="UserInfoWrapper">
                <div className="NodeHeader">
                  <div className="Wrap">
                    <div className="TypeWrapper">
                      <div className={`Type ${type}`}>{type}</div>
                      <Label label={label} />
                    </div>
                    <div className="User">
                      <img src={defaultUser} alt={user.name} />
                      <div>
                        <div className="UserName">{user.name}</div>
                        <div className="UserTitle">
                          {user.title}
                          <br />
                          {user.description}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="Extra">
                    <div className="Date">{date}</div>
                    <div className="Reviews">{reviews} Reviews</div>
                  </div>
                </div>
                <div className="Title">
                  {title}
                  <div className="Votes">
                    <div className={`Up ${votes.you === 'up' ? 'Voted' : ''}`}>
                      <ThumbsUp />
                    </div>
                    <div
                      className={`VoteCount Voted ${
                        voteCount > 0 ? 'Up' : 'Down'
                      } ${voteCount === 0 ? 'Normal' : ''}`}
                    >
                      {voteCount}
                    </div>
                    <div
                      className={`Down ${votes.you === 'down' ? 'Voted' : ''}`}
                    >
                      <ThumbsDown />
                    </div>
                  </div>
                </div>
                {nodeFrom && (
                  <div className="CitesWrapper">
                    <div
                      className={`Cites ${nodeFrom.data.type}`}
                      onClick={this.toggleCitesPanel}
                    >
                      Cites: <span>{limitedText(nodeFrom.data.title)}</span>
                    </div>
                  </div>
                )}
                <div className="CitesWrapper">
                  <div
                    className="CitedBy"
                    onClick={citedBy.length > 0 ? this.onCitedBy : null}
                  >
                    Cited By:{' '}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getCitations(citedBy),
                      }}
                    />
                  </div>
                  <div className="Review">
                    Review : <span onClick={this.onReview}>{reviews}</span>
                  </div>
                </div>
              </div>
              <div className="Introduction">
                Introduction:
                <HighLight onHighLight={this.onCreatePost}>
                  <div className="Content">{this.placeHightLights(Note)}</div>
                </HighLight>
              </div>
              <SideMenu onClickSideMenu={this.onClickSideMenu} />
              <div className="Introduction">
                Figures: {/* <InlineMath>\int_0^\infty x^2 dx</InlineMath> */}
                <div className="Content">
                  <img src={graph1} alt="Figure 1" />
                  <img src={graph2} alt="Figure 2" />
                  <img src={graph3} alt="Figure 3" />
                </div>
              </div>
            </div>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    );
  }
}

function getCitations(data) {
  const citationData = { Q: 0, H: 0, Ob: 0 };
  data.forEach(index => {
    if (MockItemDictionary[index] && MockItemDictionary[index].data) {
      const mockItem = MockItemDictionary[index].data;
      citationData[mockItem.type] += 1;
    }
  });
  const ret = [];
  if (citationData.Ob > 0)
    ret.push(
      `<span>${citationData.Ob} Observation${
        citationData.Ob > 1 ? 's' : ''
      }</span>`
    );
  if (citationData.Q > 0)
    ret.push(
      `<span class="Q">
        ${citationData.Q} Question${citationData.Q > 1 ? 's' : ''}
      </span>`
    );
  if (citationData.H > 0)
    ret.push(
      `<span class="H">${citationData.H} ${
        citationData.H > 1 ? 'Hypotheses' : 'Hypothesis'
      }</span>`
    );
  return ret.length > 0 ? ret.join(' / ') : 'No Citations';
}

function limitedText(text) {
  return text.length < 40 ? text : text.substr(0, 37) + '...';
}

function getTitle(type) {
  let title = 'Create New Post';
  switch (type) {
    case 'review':
      title = 'Top Reviews';
      break;
    case 'cited_by':
      title = 'Top Highlights';
      break;
    case 'highlight':
      title = 'Hightlights';
      break;
    default:
      title = 'Create New Post';
  }
  return title;
}

Node.propTypes = {
  // history: PropTypes.object.isRequired,
  // match: PropTypes.object.isRequired,
};

const emptySet = Set();

module.exports = {
  path: '/(:category/)@:username/:slug',
  component: connect((state, ownProps) => {
    const current_user = state.user.get('current');
    let ignoring;
    if (current_user) {
      const key = [
        'follow',
        'getFollowingAsync',
        current_user.get('username'),
        'ignore_result',
      ];
      ignoring = state.global.getIn(key, emptySet);
    }
    return {
      content: state.global.get('content'),
      ignoring,
      sortOrder: ownProps.router.getCurrentLocation().query.sort || 'trending',
    };
  })(Node),
};
