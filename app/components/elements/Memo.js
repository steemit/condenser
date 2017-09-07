import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import tt from 'counterpart';
import {memo} from 'golos-js'
import { Link } from 'react-router'
import {validate_account_name} from 'app/utils/ChainValidation'

class Memo extends React.Component {
    static propTypes = {
        text: PropTypes.string,
        // username: PropTypes.string,
        memo_private: PropTypes.object,
        // redux props
        myAccount: PropTypes.bool,
    }
    constructor() {
        super()
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Memo');
        this.decodeMemo = (memo_private, text) => {
            try {
                return memo.decode(memo_private, text)
            } catch(e) {
                // if(/Invalid key/i.test(e.toString())) {
                console.error('memo decryption error', text, e);
                return 'Invalid memo'
            }
        }
    }

    linkify(text) {
    	const sections = []
		let idx = 0
		if (!text) return
		for (let section of text.split(' ')) {
    		if (section.trim().length === 0) continue
    		const matchUserName = section.match(/(^|\s)(@[a-z][-\.a-z\d]+[a-z\d])/i)
    		const matchLink = section.match(/^\/(?!\/)|(https?:)?\/\//)
			if (matchUserName) {
				const user2 = matchUserName[0].trim().substring(1)
				const userLower = user2.toLowerCase()
				const valid = validate_account_name(userLower) == null
				valid
					? sections.push(<Link key={idx++} to={`/@${userLower}`}>{`@${user2}`}&nbsp;</Link>)
					: sections.push(<span key={idx++}>{`@${user2}`}</span>)

			} else if (matchLink) {
				sections.push(<Link key={idx++} to={section}>{section}&nbsp;</Link>)
			} else {
				sections.push(<span key={idx++}>{section}&nbsp;</span>)
			}
		}
		return sections
	}

    render() {
        const {decodeMemo, linkify} = this
        const {memo_private, text, myAccount} = this.props;
        const isEncoded = /^#/.test(text);

		if(!isEncoded) return <span>{linkify(text)}</span>
        if(!myAccount) return <span></span>
        if(memo_private) return <span>{decodeMemo(memo_private, text)}</span>
        return <span>{tt('g.login_to_see_memo')}</span>
    }
}

export default connect(
    (state, ownProps) => {
        const currentUser = state.user.get('current')
        const myAccount = currentUser && ownProps.username === currentUser.get('username')
        const memo_private = myAccount && currentUser ?
            currentUser.getIn(['private_keys', 'memo_private']) : null
        return {...ownProps, memo_private, myAccount}
    }
)(Memo)
