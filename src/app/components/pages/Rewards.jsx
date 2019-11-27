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
    const out = items.map(item => {
        const [url, title, payout, posts, authors] = item;
        remainder -= payout;
        return { url, title, payout, posts, authors };
    });

    return { items: out, total, blogs, comms, remainder };
}

function generateTreemap(items, xscale) {
    let data = items.map(item => {
        return { item, value: item.payout };
    });
    data.sort((a, b) => a.value > b.value);

    const container = { x0: 0, y0: 0, x1: 100 * xscale, y1: 100 };

    return squarify(data, container).map(box => {
        const { x0, y0, x1, y1, item } = box;
        return {
            ...item,
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
            height: window.innerHeight - el.offsetTop - 20,
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
        // TODO: UI handling of `remainder`
        items.push({ url: '', title: 'other', payout: remainder });

        const xscale = 0.5 * (width / height); // 2:1 bias
        const boxes = generateTreemap(items, xscale);

        return (
            <div id="reward_chart" style={{ height: height + 'px' }}>
                {boxes.map(this.renderBox)}
            </div>
        );
    }

    renderBox(item) {
        const { payout, posts, title, url, shape } = item;

        const label = '$' + Math.round(payout) + ' in ' + posts + ' posts';
        const link = (
            <Link to={`/${url}`} title={label}>
                {title}
            </Link>
        );

        const bg = row => {
            const { posts, payout, title } = row;
            let a = posts ? payout / posts : 0;
            a = Math.min(a / 10, 1);
            if (title[0] == '@') {
                return 'rgba(155,155,255,' + a + ')';
            } else {
                return 'rgba(200,70,255,' + a + ')';
            }
        };

        const cls = title[0] == '@' ? 'box box-a' : 'box box-c';
        const style = { ...shape, background: bg(item) };
        return (
            <div key={url} style={style} className={cls}>
                <div className="box-inner">{link}</div>
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
