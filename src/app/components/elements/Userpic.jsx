import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import ProxifyUrl, { imageProxy } from 'app/utils/ProxifyUrl';
import {
    DEFAULT_AVATAR,
    AVATAR_SIZE_SMALL,
    AVATAR_SIZE_MEDIUM,
    AVATAR_SIZE_LARGE,
} from 'app/client_config';

export const SIZE_SMALL = 'small';
export const SIZE_MED = 'medium';
export const SIZE_LARGE = 'large';

const sizeList = [SIZE_SMALL, SIZE_MED, SIZE_LARGE];

export const avatarSize = {
    small: AVATAR_SIZE_SMALL,
    medium: AVATAR_SIZE_MEDIUM,
    large: AVATAR_SIZE_LARGE,
};

class Userpic extends Component {
    shouldComponentUpdate = shouldComponentUpdate(this, 'Userpic');

    render() {
        const { account, json_metadata, size } = this.props;
        // could not find this variable anywhere
        // const hideIfDefault = this.props.hideIfDefault || false;
        const avSize = size && sizeList.indexOf(size) > -1 ? size : SIZE_SMALL;
        const avSizeStr = avatarSize[avSize] + 'x' + avatarSize[avSize];

        let avatar = DEFAULT_AVATAR;

        // try to extract image url from users metaData
        //if (hideIfDefault) {

        // if a custom image is found in user profile, use that image.
        try {
            const md = JSON.parse(json_metadata);
            if (/^(https?:)\/\//.test(md.profile.profile_image)) {
                avatar = md.profile.profile_image;
            }
        } catch (e) {
            // return null;
        }
        //}

        const ProxifyAvatar = ProxifyUrl(avatar, avSizeStr);
        const style = {
            backgroundImage: 'url(' + ProxifyAvatar + ')',
        };

        return <div className="Userpic" style={style} />;
    }
}

Userpic.propTypes = {
    account: PropTypes.string.isRequired,
};

export default connect((state, ownProps) => {
    const { account, hideIfDefault } = ownProps;
    return {
        account,
        json_metadata: state.global.getIn([
            'accounts',
            account,
            'json_metadata',
        ]),
        hideIfDefault,
    };
})(Userpic);
