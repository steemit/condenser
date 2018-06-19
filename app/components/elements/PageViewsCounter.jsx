import React from 'react';
import PropTypes from 'prop-types';
import {recordPageView} from 'app/utils/ServerApiClient';
import Icon from 'app/components/elements/Icon';
import tt from 'counterpart';

export default class PageViewsCounter extends React.Component {

    static propTypes = {
        hidden: PropTypes.bool,
        aiPosts: PropTypes.array,
        sinceDate: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {views: 0};
        this.last_page = null;
    }

    pageView() {
        let ref = document.referrer || '';
        if (ref.match('://' + window.location.hostname)) ref = '';
        recordPageView(window.location.pathname, ref, this.props.aiPosts || []).then(views => this.setState({views}));
        this.last_page = window.location.pathname;
    }

    componentDidMount() {
        this.pageView();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.views !== this.state.views || window.location.pathname !== this.last_page;
    }

    componentDidUpdate() {
        this.pageView();
    }

    render() {
        const { hidden } = this.props;
        const views = this.state.views;

        if (hidden || !views) {
            return null;
        }

        const suffix = this.props.sinceDate ? tt('g.since') + this.props.sinceDate : '';

        return <span className="PageViewsCounter" title={tt('plurals.view_count', {count: views}) + suffix}>
            <Icon name="eye" /> {views.toLocaleString()}
        </span>;
    }
}
