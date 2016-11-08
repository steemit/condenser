import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux'
const {oneOfType, string, object} = PropTypes

class Userpic extends Component {
	// you can pass either user object, or username string
	static propTypes = {
		account: oneOfType([string, object])
	}

	render() {
		const {account, width, height} = this.props
		let url

		// try to extract image url from users metaData
		try { url = JSON.parse(account.json_metadata).user_image }
		catch (e) { url = '' }

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
		// you can pass either user object, or username string
		if (typeof account == 'string') account = state.global.getIn(['accounts', account]).toJS()
		return { account, ...restOfProps }
	}
)(Userpic)
