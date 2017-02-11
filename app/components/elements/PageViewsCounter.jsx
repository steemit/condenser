import React from 'react';
import {recordPageView} from 'app/utils/ServerApiClient';
import Icon from 'app/components/elements/Icon';
import pluralize from 'pluralize';
import { translate } from 'app/Translator';

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

    pageView() {
        let ref = document.referrer || '';
        if (ref.match('://' + window.location.hostname)) ref = '';
        recordPageView(window.location.pathname, ref).then(views => this.setState({views}));
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
        const views = this.state.views;
        if (this.props.hidden || !views) return null;
        const suffix = this.props.sinceDate ? ' since ' + this.props.sinceDate : ''
        
        {/*        return   <span className="PageViewsCounter" title={pluralize('Views', views, true) + suffix}>
                                <Icon name="eye" /> {views}
                            </span>;
        */}

        return <span className="PageViewsCounter" title={translate('view_count', {viewCount: views})}>
            <Icon name="eye" /> {views}
        </span>;



    }
}
