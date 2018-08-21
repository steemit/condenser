import React from 'react';
import PropTypes from 'prop-types';
import { recordPageView } from 'app/utils/ServerApiClient';
import Icon from 'app/components/elements/Icon';
import tt from 'counterpart';

export default class PageViewsCounter extends React.Component {
    static propTypes = {
        hidden: PropTypes.bool,
    };

    static defaultProps = {
        hidden: true,
    };

    constructor(props) {
        super(props);
        this.last_page = null;
    }

    pageView() {
        let ref = document.referrer || '';
        recordPageView(window.location.pathname, ref);
        this.last_page = window.location.pathname;
    }

    componentDidMount() {
        this.pageView();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return window.location.pathname !== this.last_page;
    }

    componentDidUpdate() {
        this.pageView();
    }

    render() {
        // Due to a MySQL mystery, no more page view reads; only writes.
        return null;
    }
}
