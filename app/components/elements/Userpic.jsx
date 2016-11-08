import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux'
const {oneOfType, string, number} = PropTypes

class Userpic extends Component {
	// you can pass either user object, or username string
	static propTypes = {
		account: oneOfType([string, number])
	}

	render() {
		const {account, ...rest} = this.props
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
						width="48px"
						height="48px"
						{...rest}
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
