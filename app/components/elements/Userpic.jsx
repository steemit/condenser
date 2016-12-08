import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux'
const {oneOfType, string, object} = PropTypes

class Userpic extends Component {
	// you can pass either user object, or username string


	static defaultProps = {
		width: 48,
		height: 48
	}

	render() {

		const {props} = this
		const {dispatch, account, ...rest} = props

		let url

		// try to extract image url from users metaData
		try {
            /*
                steemit uses 'json_metadata.profile.profile image insteand of 'json_metadata.user_image' as we do in golos
                in future we will move to "json_metadata.profile" as well
             */
            const metaData = JSON.parse(account.json_metadata);
            url = metaData.user_image || metaData.profile ? metaData.profile.profile_image : ''
        }
		catch (e) { url = '' }
		const proxy = $STM_Config.img_proxy_prefix
		if (proxy && url) {
			const size = props.width + 'x' + props.height
			url = proxy + size + '/' + url;
		}

		return 	<div className="Userpic">
					<img src={url || '/images/user.png'} {...rest} />
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
