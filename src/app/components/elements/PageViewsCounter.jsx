import React from 'react';
import { recordPageView } from 'app/utils/ServerApiClient';

export default class PageViewsCounter extends React.Component {
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
        return null;
    }
}
