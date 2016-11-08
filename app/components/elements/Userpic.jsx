import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
const {oneOfType, string, object} = PropTypes;

class Userpic extends Component {
	// you can pass either user object, or username string
	static propTypes = {
		account: oneOfType([string, object])
	}

	render() {
		const {account, width, height} = this.props
		let url = null;

		try {
		    url = account ? JSON.parse(account.json_metadata).user_image : null;
		}
		catch (e) {
        }

        if (url && /(https?:)?\/\//.test(url)) {
            url = $STM_Config.img_proxy_prefix + '48x48/' + url;
        } else {
            url = require('app/assets/images/user.png');
        }

		return 	<div className="Userpic">
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
