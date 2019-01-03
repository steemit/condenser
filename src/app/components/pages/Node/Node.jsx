import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
import { Nodes, HightLights, Note } from './DummyData';
import BrowsingHistory from './Components/BrowsingHistory';

class Node extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // loading: true,
            data: Nodes[0],
            citesVisible: false,
            citedByVisible: false,
            highlightIndex: -1,
        };
    }

    componentDidMount() {
        // console.log(this.getParams('id'));
        const id = 1; //this.getParams('id');

        if (Nodes[id - 1]) {
            // this.setState({ data: Nodes[id - 1] });
        } else {
            // this.props.history.push('/');
        }
    }

    getParams(key) {
        // const { match: { params } } = this.props;
        // return params[key];
        return key;
    }

    toggleCitesPanel = () =>
        this.setState({ citesVisible: !this.state.citesVisible });
    toggleCitedByPanel = (highlightIndex = -1) =>
        this.setState({
            citedByVisible: !this.state.citedByVisible,
            highlightIndex,
        });
    closeCitesPanel = () => this.setState({ citesVisible: false });
    closeCitedByPanel = () =>
        this.setState({ citedByVisible: false, highlightIndex: -1 });

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
                            `<Mark>${hIndex}--${
                                highlight.anchorText
                            }</Mark><Mark>`
                        );
                        ret[index] = retItem.replace(
                            data,
                            highLighted[highlight.data]
                        );
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

    render() {
        if (this.state.data == null) return <div>Loading</div>;
        const {
            title,
            type,
            user,
            votes,
            date,
            reviews,
            cites,
            citedBy,
        } = this.state.data;
        const citesPanel = this.state.citesVisible;
        const citedByPanel = this.state.citedByVisible;
        const voteCount = (votes.up || 0) - (votes.down || 0);

        const { highlightIndex } = this.state;
        const highlightData =
            highlightIndex === -1 ? null : HightLights[highlightIndex];
        const hNode = highlightData ? Nodes[highlightData.node] : null;

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
                        <div className="Panel">
                            <div className="NodeHeader">
                                <div>Cited By Others</div>
                                <X
                                    style={{ color: '#bbb' }}
                                    size={20}
                                    onClick={this.closeCitedByPanel}
                                />
                            </div>
                            <div className="Main">
                                Topic that user <span>highlighted</span> in the
                                text
                            </div>
                            {hNode && (
                                <div className="Extra">
                                    <div className={`Type ${hNode.type}`}>
                                        {hNode.type}
                                    </div>
                                    {hNode.title}
                                </div>
                            )}
                            <div className="NodeHeader">
                                <div>Top Highlights</div>
                            </div>
                            {hNode && (
                                <div className="Sections">
                                    {[0, 1].map((key, index) => (
                                        <section key={index}>
                                            <div className="NodeHeader">
                                                <div className="Wrap">
                                                    <div className="User">
                                                        <img
                                                            src={defaultUser}
                                                            alt={user.name}
                                                        />
                                                        <div>
                                                            <div className="UserName">
                                                                {user.name}
                                                            </div>
                                                            <div className="UserTitle">
                                                                {user.title}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="Extra">
                                                    <div className="Date">
                                                        {date}
                                                    </div>
                                                    <div className="Reviews">
                                                        {reviews} Reviews
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="Title">{title}</div>
                                            <div className="Content">
                                                There are many variations of
                                                passages of Lorem Ipsum
                                                available, but the majority have
                                                suffered alteration in some
                                                form, , or randomised words
                                                which don't look even slightly
                                                believable.
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Sidebar>

                    <Sidebar.Pusher>
                        <div className="NodeInfo">
                            <BrowsingHistory />
                            <div className="UserInfoWrapper">
                                <div className="NodeHeader">
                                    <div className="Wrap">
                                        <div className="TypeWrapper">
                                            <div className={`Type ${type}`}>
                                                {type}
                                            </div>
                                            <Label label="Machine" />
                                        </div>
                                        <div className="User">
                                            <img
                                                src={defaultUser}
                                                alt={user.name}
                                            />
                                            <div>
                                                <div className="UserName">
                                                    {user.name}
                                                </div>
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
                                        <div className="Reviews">
                                            {reviews} Reviews
                                        </div>
                                    </div>
                                </div>
                                <div className="Title">
                                    {title}
                                    <div className="Votes">
                                        <div
                                            className={`Up ${
                                                votes.you === 'up'
                                                    ? 'Voted'
                                                    : ''
                                            }`}
                                        >
                                            <ThumbsUp />
                                        </div>
                                        <div
                                            className={`VoteCount Voted ${
                                                voteCount > 0 ? 'Up' : 'Down'
                                            } ${
                                                voteCount === 0 ? 'Normal' : ''
                                            }`}
                                        >
                                            {voteCount}
                                        </div>
                                        <div
                                            className={`Down ${
                                                votes.you === 'down'
                                                    ? 'Voted'
                                                    : ''
                                            }`}
                                        >
                                            <ThumbsDown />
                                        </div>
                                    </div>
                                </div>
                                <div className="CitesWrapper">
                                    <div
                                        className="Cites"
                                        onClick={this.toggleCitesPanel}
                                    >
                                        Cites:{' '}
                                        <span>{getCitations(cites)}</span>
                                    </div>
                                    <div
                                        className="CitedBy"
                                        onClick={this.toggleCitedByPanel}
                                    >
                                        Cited By:{' '}
                                        <span>{getCitations(citedBy)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="Introduction">
                                Introduction: <span>Linked from:</span>{' '}
                                <span className="TitleFrom">
                                    Title from an observation
                                </span>
                                <HighLight>
                                    <div className="Content">
                                        {/* <span onClick={this.toggleCitedByPanel}>
                                            goodness
                                        </span> */}
                                        {this.placeHightLights(Note)}
                                    </div>
                                </HighLight>
                            </div>
                            <SideMenu />
                            <div className="Introduction">
                                Figures:{' '}
                                {/* <InlineMath>\int_0^\infty x^2 dx</InlineMath> */}
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
    let ret = `${data.ob} Observation${data.ob > 1 ? 's' : ''}`;
    if (data.q > 0) ret += ` / ${data.q} Question${data.q > 1 ? 's' : ''}`;
    if (data.h > 0) ret += ` / ${data.h} Hypothesis${data.h > 1 ? 'es' : ''}`;
    return ret;
}

Node.propTypes = {
    // history: PropTypes.object.isRequired,
    // match: PropTypes.object.isRequired,
};

module.exports = {
    path: 'static_node',
    component: Node,
};
