import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import proxifyImageUrl from 'app/utils/ProxifyUrl';

const urlUserDefaultPic = 'assets/images/user.png';

class Userpic extends Component {
    static propTypes = {
        account: PropTypes.string
    }

    shouldComponentUpdate = shouldComponentUpdate(this, 'Userpic')

    render() {
        if(!window.authors) {
            window.authors = [];
        }

        const {json_metadata, width, height} = this.props
        const hideIfDefault = this.props.hideIfDefault || false

        let url = null;

        // try to extract image url from users metaData
        try {
            const md = JSON.parse(json_metadata);
            if(/^(https?:)\/\//.test(md.profile.profile_image)) {
                const size = (width && width > 48)? '320x320' : '120x120';
                url = proxifyImageUrl(md.profile.profile_image, size);
            }
        } catch (e) {}
        if(!url) {
            if(hideIfDefault) {
                return null;
            }
            url = require('assets/images/user.png');
        }

        const style = {backgroundImage: 'url(' + url + ')',
                       width: (width || 48) + 'px',
                       height: (height || 48) + 'px'}

        if(urlUserDefaultPic === url) {
            return (<div className="Userpic" style={style} />)
        }
        if(window.authors.indexOf(this.props.account) < 0) {
            window.authors.push(this.props.account)
        }
        return (<div className="Userpic" title={"Picture for " + this.props.account} style={style} />)
    }
}

export default connect(
    (state, ownProps) => {
        const {account, width, height, hideIfDefault} = ownProps
        return {
            json_metadata: state.global.getIn(['accounts', account, 'json_metadata']),
            width,
            height,
            hideIfDefault,
        }
    }
)(Userpic)
