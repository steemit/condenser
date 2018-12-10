import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ThumbsDown, ThumbsUp, X } from 'react-feather';
import { Sidebar, Segment, Menu } from 'semantic-ui-react';

import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

import defaultUser from 'assets/images/static/user1.png';
import graph1 from 'assets/images/static/graph/1.png';
import graph2 from 'assets/images/static/graph/2.png';
import graph3 from 'assets/images/static/graph/3.png';
import { Label, SideMenu } from 'app/components/pages/_Common';
import { Nodes } from './DummyData';
import { BrowsingHistory } from './Components';
import './Components/SidePanels/SidePanels.scss';
import './Node.scss';

class Node extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // loading: true,
            data: null,
            citesVisible: false,
            citedByVisible: false,
        };
    }

    componentDidMount() {
        // console.log(this.getParams('id'));
        const id = this.getParams('id');

        if (Nodes[id - 1]) {
            this.state = { data: Nodes[id - 1] };
        } else {
            this.props.history.push('/');
        }
    }

    getParams(key) {
        const { match: { params } } = this.props;
        return params[key];
    }

    toggleCitesPanel = () =>
        this.setState({ citesVisible: !this.state.citesVisible });
    toggleCitedByPanel = () =>
        this.setState({ citedByVisible: !this.state.citedByVisible });
    closeCitesPanel = () => this.setState({ citesVisible: false });
    closeCitedByPanel = () => this.setState({ citedByVisible: false });

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
                    >
                        <div className="Panel">
                            <div className="Header">
                                <div>Citations</div>
                                <div
                                    className="CloseButton"
                                    onClick={this.closeCitesPanel}
                                >
                                    <X />
                                </div>
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
                    >
                        <div className="Panel">
                            <div className="Header">
                                <div>Cited By Others</div>
                                <div
                                    className="CloseButton"
                                    onClick={this.closeCitedByPanel}
                                >
                                    <X />
                                </div>
                            </div>
                            <div className="Main">Top Highlights Go Here</div>
                            <div className="Extra" />
                        </div>
                    </Sidebar>

                    <Sidebar.Pusher>
                        <div className="NodeInfo">
                            <BrowsingHistory />
                            <div className="HeaderWrapper">
                                <div className="Header">
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
                                        cites:{' '}
                                        <span>{getCitations(cites)}</span>
                                    </div>
                                    <div
                                        className="CitedBy"
                                        onClick={this.toggleCitedByPanel}
                                    >
                                        citedBy:{' '}
                                        <span>{getCitations(citedBy)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="Introduction">
                                Introduction: <span>Linked from:</span>{' '}
                                <span className="TitleFrom">
                                    Title from an observation
                                </span>
                                <p className="Content">
                                    There are many variations of passages of
                                    Lorem Ipsum available, but the majority have
                                    suffered alteration in some form, by
                                    injected humour, or randomised words which
                                    don{"'"}t look even slightly believable. If
                                    you are going to use a passage of Lorem
                                    Ipsum, you need to be sure there isn{"'"}t
                                    anything embarrassing hidden in the middle
                                    of text. All the Lorem Ipsum generators on
                                    the Internet tend to repeat predefined
                                    chunks as necessary, making this the first
                                    true generator on the Internet. It uses a
                                    dictionary of over 200 Latin{' '}
                                    <span onClick={this.toggleCitedByPanel}>
                                        goodness
                                    </span>, combined with a handful of model
                                    sentence structures, to generate Lorem Ipsum
                                    which looks reasonable. The generated Lorem
                                    Ipsum is therefore always free from
                                    repetition, injected humour, or
                                    non-characteristic words etc.
                                    <br />
                                    <br />
                                    Lorem Ipsum is simply dummy text of the
                                    printing and typesetting industry. Lorem
                                    Ipsum has been the industry{"'"}s standard
                                    dummy text ever since the 1500s, when an
                                    unknown printer took a galley of type and
                                    scrambled it to make a type specimen book.
                                    It has survived not only five centuries, but
                                    also the leap into electronic typesetting,
                                    remaining essentially unchanged.
                                </p>
                            </div>
                            <SideMenu />
                            <div className="Introduction">
                                Figures:{' '}
                                <InlineMath>\int_0^\infty x^2 dx</InlineMath>
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
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
};

export default Node;
