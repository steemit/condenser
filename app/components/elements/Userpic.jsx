import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

class Userpic extends Component {
    // account is specified as string, but converted to object in connect
    static propTypes = {
        account: PropTypes.object
    }

    render() {
        const {account, width, height} = this.props
        const hideIfDefault = this.props.hideIfDefault || false

        let url = null;

        // try to extract image url from users metaData
        try {
            const md = JSON.parse(account.json_metadata);
            if(md.profile) url = md.profile.profile_image;
        } catch (e) {}

        if (url && /^(https?:)\/\//.test(url)) {
            const size = width && width > 48 ? '320x320' : '72x72'
            url = $STM_Config.img_proxy_prefix + size + '/' + url;
        } else {
            if(hideIfDefault) {
                return null;
            }
            url = require('app/assets/images/user.png');
        }

        const style = {backgroundImage: 'url(' + url + ')',
                       width: (width || 48) + 'px',
                       height: (height || 48) + 'px'}

        return <div className="Userpic" style={style} />;
    }
}

export default connect(
    (state, {account, ...restOfProps}) => {
        const account_obj = state.global.getIn(['accounts', account]);
        return { account: account_obj ? account_obj.toJS() : null, ...restOfProps }
    }
)(Userpic)
