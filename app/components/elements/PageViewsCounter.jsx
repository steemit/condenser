import React from 'react';
import {recordPageView} from 'app/utils/ServerApiClient';
import Icon from 'app/components/elements/Icon';
import pluralize from 'pluralize';

export default class PageViewsCounter extends React.Component {

    static propTypes = {
        hidden: React.PropTypes.bool
    };

    static defaultProps = {
        hidden: true
    };

    constructor(props) {
        super(props);
        this.state = {views: 0};
        this.last_page = null;
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.views !== this.state.views || window.location.pathname !== this.last_page;
    }

    componentDidUpdate() {
        recordPageView(window.location.pathname).then(views => this.setState({views}));
        this.last_page = window.location.pathname;
    }

    render() {
        if (this.props.hidden) return null;
        const views = this.state.views;
        return <span className="PageViewsCounter" title={pluralize('Views', views, true)}>
            <Icon name="eye" /> {views}
        </span>;
    }
}
