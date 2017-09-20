import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import { imageProxy } from 'app/utils/ProxifyUrl';

const urlUserDefaultPic = 'assets/images/user.png';

class Userpic extends Component {

    shouldComponentUpdate = shouldComponentUpdate(this, 'Userpic')

    render() {
        const {account, json_metadata} = this.props
        const hideIfDefault = this.props.hideIfDefault || false


        // try to extract image url from users metaData
        try {
            const md = JSON.parse(json_metadata);
            if(!/^(https?:)\/\//.test(md.profile.profile_image) && hideIfDefault) {
                return null;
            }
        } catch (e) {
            /* eslint-disable-line no-empty */
        }

        const style = {backgroundImage: 'url(' + imageProxy() + `u/${account}/avatar)` };

        if(urlUserDefaultPic === url) {
            return (<div className="Userpic" style={style} />)
        }
        if(window.authors.indexOf(this.props.account) < 0) {
            window.authors.push(this.props.account)
        }
        return (<div className="Userpic" title={"Picture for " + this.props.account} style={style} />)
    }
}

Userpic.propTypes = {
    account: PropTypes.string.isRequired
}

export default connect(
    (state, ownProps) => {
        const {account, hideIfDefault} = ownProps
        return {
            account,
            json_metadata: state.global.getIn(['accounts', account, 'json_metadata']),
            hideIfDefault,
        }
    }
)(Userpic)
