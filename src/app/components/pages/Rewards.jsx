import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import squarify from 'squarify';

function normalizeRewards(rewards) {
    const { items, total, blogs } = rewards;
    const comms = total - blogs;

    let remainder = total;
    const out = items.map((item, idx) => {
        let [url, title, payout, posts, authors] = item;
        const rank = idx + 1;
        remainder -= payout;
        const is_blog = url.substring(0, 5) != 'hive-';
        url = '/' + (is_blog ? url + '/payout' : 'payout/' + url);
        title = title[0] == '@' ? title.substring(1) : title;
        return { url, title, payout, posts, authors, is_blog, rank };
    });

    return { items: out, total, blogs, comms, remainder };
}

function generateTreemap(items, total, xscale) {
    let data = items.map(item => {
        return { item, value: item.payout };
    });
    data.sort((a, b) => a.value > b.value);

    const container = { x0: 0, y0: 0, x1: 100 * xscale, y1: 100 };

    return squarify(data, container).map(box => {
        const { x0, y0, x1, y1, item } = box;
        const pct = (100 * item.payout / total).toFixed(2);
        return {
            ...item,
            pct,
            shape: {
                left: x0 / xscale + '%',
                top: y0 + '%',
                width: (x1 - x0) / xscale + '%',
                height: y1 - y0 + '%',
            },
        };
    });
}

class Rewards extends Component {
    static propTypes = {
        loading: PropTypes.bool.isRequired,
        fetchRewardsData: PropTypes.func.isRequired,
        rewards: PropTypes.shape({
            total: PropTypes.number,
            blogs: PropTypes.number,
            items: PropTypes.arrayOf(PropTypes.array),
        }).isRequired,
    };
    static defaultProps = {
        loading: true,
    };

    constructor() {
        super();
        this.state = { width: null, height: null };
        this.resizeListener = this.resizeListener.bind(this);
    }

    componentDidMount() {
        this.props.fetchRewardsData();

        window.addEventListener('resize', this.resizeListener, {
            capture: false,
            passive: true,
        });
        this.resizeListener();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeListener);
    }

    resizeListener() {
        const el = window.document.getElementById('reward_container');
        if (!el) return;
        this.setState({
            width: el.offsetWidth,
            height: window.innerHeight - el.offsetTop - 50,
        });
    }

    render() {
        const { width, height } = this.state;
        const { rewards, loading } = this.props;

        let body;

        if (loading || !rewards.items) {
            body = <div>Loading...</div>;
        } else if (!width) {
            console.error('chart is loaded w/o viewport data');
            body = <div>Error</div>;
        } else {
            body = this.renderChart(normalizeRewards(rewards), width, height);
        }

        return (
            <div className="row">
                <div className="column Rewards__chart" id="reward_container">
                    {body}
                </div>
            </div>
        );
    }

    renderChart(rewards, width, height) {
        const { items, total, blogs, comms, remainder } = rewards;
        //items.push({ url: 'payout', title: 'other', payout: remainder, is_blog: true });

        const xscale = 0.5 * (width / height); // 2:1 bias
        const boxes = generateTreemap(items, total, xscale);

        const shown = (100 * (total - remainder) / total).toFixed(2);
        return (
            <div id="reward_wrap">
                <div className="head">
                    Showing top {items.length} payout buckets, representing{' '}
                    <strong>{shown}%</strong> of all pending payouts. This
                    report does not account for burned rewards.
                </div>
                <div id="reward_chart" style={{ height: height + 'px' }}>
                    {boxes.map(this.renderBox)}
                </div>
            </div>
        );
    }

    renderBox(item) {
        const {
            payout,
            posts,
            title,
            url,
            authors,
            is_blog,
            shape,
            pct,
            rank,
        } = item;
        const summary = '$' + Math.round(payout) + ' in ' + posts + ' posts';
        const link = (
            <Link to={url} className="box-inner">
                <span className="title">{title}</span>
                <span className="detail">
                    <strong>{title}</strong>
                    <br />
                    <i>{is_blog ? 'Blogger' : 'Community'}</i>
                    <br />
                    {summary}
                    <br />
                    Rank: {rank ? '#' + rank : 'unknown'}
                    {authors && (
                        <span>
                            <br />
                            {authors} authors
                        </span>
                    )}
                    <br />
                    {pct}% of all payouts
                </span>
            </Link>
        );

        const bg = row => {
            const { posts, payout, is_blog } = row;
            const per_post = posts ? payout / posts : null;
            const alpha = per_post ? Math.min(per_post / 15 + 0.1, 1) : 0.5;
            const color = is_blog ? '155,155,255' : '220,90,255';
            return `rgba(${color},${alpha})`;
        };

        const className = is_blog ? 'box box-a' : 'box box-c';
        const style = { ...shape, background: bg(item) };
        return (
            <div key={url} style={style} className={className}>
                {link}
            </div>
        );
    }
}

module.exports = {
    path: 'rewards',
    component: connect(
        // mapStateToProps
        (state, ownProps) => {
            let rewards = Map({});
            if (state.global.hasIn(['rewards'])) {
                rewards = state.global.getIn(['rewards'], null);
            }
            return {
                rewards: rewards.toJS(),
                loading: state.app.get('loading'),
            };
        },
        // mapDispatchToProps
        dispatch => ({
            fetchRewardsData: payload =>
                dispatch(fetchDataSagaActions.getRewardsData()),
        })
    )(Rewards),
};
