import React from 'react';
// import {connect} from 'react-redux';
import {recordPageView} from 'app/utils/ServerApiClient';
import Icon from 'app/components/elements/Icon';
import pluralize from 'pluralize';

export default class PageViewsCounter extends React.Component {

    static propTypes = {
        page: React.PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {views: 0};
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.views !== this.state.views;
    }

    componentDidMount() {
        recordPageView(this.props.page).then(views => this.setState({views}));
    }

    render() {
        const views = this.state.views;
        return <span className="PageViewsCounter" title={pluralize('Views', views, true)}>
            <Icon name="eye" /> {views}
        </span>;
    }

}

// export default connect(null, dispatch => ({
//     update: (payload) => { dispatch({type: 'UPDATE_NOTIFICOUNTERS', payload})},
// }))(MarkNotificationRead);
