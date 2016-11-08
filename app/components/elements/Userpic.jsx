import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

class Userpic extends Component {
    // account is specified as string, but converted to object in connect
    static propTypes = {
        account: PropTypes.object
    }

    render() {
        const {account, width, height} = this.props
        let url = null;

        // try to extract image url from users metaData
        try {
            const md = JSON.parse(account.json_metadata);
            if(md.profile) url = md.profile.profile_image;
        } catch (e) {}

        if (url && /(https?:)\/\//.test(url)) {
            url = $STM_Config.img_proxy_prefix + '48x48/' + url;
        } else {
            url = require('app/assets/images/user.png');
        }

        return <div className="Userpic">
                    <img
                        src={url}
                        width={width || 48}
                        height={height || 48}
                    />
                </div>;
    }
}

export default connect(
    (state, {account, ...restOfProps}) => {
        const account_obj = state.global.getIn(['accounts', account]);
        return { account: account_obj ? account_obj.toJS() : null, ...restOfProps }
    }
)(Userpic)
