import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Set } from 'immutable';
import { browserHistory } from 'react-router';

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
    };

    this.onHighLight = this.onHighLight.bind(this);
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
      this.setState({ nodeId: newNodeId, data: MockItemDictionary[nodeId] });
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
            onClick={() => this.toggleCitedByPanel(info[0])}
          >
            {info[1].replace('</Mark>', '')}
          </span>
        );
      });
    });
  }

  onHighLight(type, selection, highLight) {
    this.setState(
      {
        highlightInfo: { type, selection, highLight },
      },
      this.toggleCitedByPanel
    );
  }

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

    const { highlightInfo } = this.state;

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
              <div className="NodeHeader">
                <div>Citations</div>
                <X
                  style={{ color: '#bbb' }}
                  size={20}
                  onClick={this.closeCitesPanel}
                />
              </div>
              <div className="Main">Citations Go Here</div>
              <div className="Extra" />
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
            {highlightInfo && (
              <div className="Panel">
                <div className="NodeHeader">
                  <div>Create New Post</div>
                  <X
                    style={{ color: '#bbb' }}
                    size={20}
                    onClick={this.closeCitedByPanel}
                  />
                </div>
                <div className="Main">
                  You <span>highlighted</span>:
                </div>
                <div className="Extra">
                  {highlightInfo.highLight.anchorText}
                </div>
                <Create type={highlightInfo.type} node={this.state.data.data} />
              </div>
            )}
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
                <div className="CitesWrapper">
                  <div className="Cites" onClick={this.toggleCitesPanel}>
                    Cites: <span>{getCitations(cites)}</span>
                  </div>
                  <div className="CitedBy" onClick={this.toggleCitedByPanel}>
                    Cited By: <span>{getCitations(citedBy)}</span>
                  </div>
                </div>
              </div>
              <div className="Introduction">
                Introduction: <span>Linked from:</span>{' '}
                {nodeFrom ? (
                  <span className={`TitleFrom ${nodeFrom.data.type}`}>
                    {limitedText(nodeFrom.data.title)}
                  </span>
                ) : (
                  <span className="TitleFrom None">No Originatation</span>
                )}
                <HighLight onHighLight={this.onHighLight}>
                  <div className="Content">{this.placeHightLights(Note)}</div>
                </HighLight>
              </div>
              <SideMenu />
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
    ret.push(`${citationData.Ob} Observation${citationData.ob > 1 ? 's' : ''}`);
  if (citationData.Q > 0)
    ret.push(`${citationData.Q} Question${citationData.Q > 1 ? 's' : ''}`);
  if (citationData.H > 0)
    ret.push(`${citationData.H} Hypothesis${citationData.H > 1 ? 'es' : ''}`);
  return ret.length > 0 ? ret.join(' / ') : 'No Citations';
}

function limitedText(text) {
  return text.length < 40 ? text : text.substr(0, 37) + '...';
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
