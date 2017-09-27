import React, { PropTypes } from "react";

export default class AssetName extends React.Component {

    static propTypes = {
        name: PropTypes.string.isRequired,
        isBitAsset : React.PropTypes.bool
    };

    static defaultProps = {
        isBitAsset: false
    };

    render() {
        const { name, isBitAsset } = this.props;

        const prefix = "bit";

        if (isBitAsset) {
            return (
                <span className="AssetName">
                    <span className="AssetName_prefix">{prefix}</span>
                    <span>{name}</span>
                </span>
            );
        } else {
            return (
                <span>{name}</span>
            );
        }
    }
}
