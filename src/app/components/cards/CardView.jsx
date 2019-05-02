import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Link from 'app/components/elements/Link';
import * as globalActions from 'app/redux/GlobalReducer';
import links from 'app/utils/Links';
import tt from 'counterpart';

/** @deprecated */
class CardView extends React.Component {
    static propTypes = {
        // HTML properties
        formId: PropTypes.string,
        canEdit: PropTypes.bool,

        // redux or html
        metaLinkData: PropTypes.object,

        // redux
        clearMetaElement: PropTypes.func,
    };
    static defaultProps = {
        canEdit: false,
    };
    constructor() {
        super();
        this.onCloseImage = e => {
            e.preventDefault();
            const { formId, clearMetaElement } = this.props;
            clearMetaElement(formId, 'image');
        };
        this.onCloseDescription = e => {
            e.preventDefault();
            const { formId, clearMetaElement } = this.props;
            clearMetaElement(formId, 'description');
        };
    }
    render() {
        const { metaLinkData, canEdit } = this.props;
        if (!metaLinkData) return <span />;
        const { link, image, description, alt } = metaLinkData;
        // http://postimg.org/image/kbefrpbe9/
        if (!image && !description) return <span />;
        // youTubeImages have their own preview
        const youTubeImage = links.youTube.test(link);
        return (
            <span className="Card">
                {image &&
                    !youTubeImage && (
                        <div>
                            {canEdit && (
                                <div>
                                    (<a onClick={this.onCloseImage}>
                                        {tt('g.remove')}
                                    </a>)<br />
                                </div>
                            )}
                            <Link href={link}>
                                <img src={image} alt={alt} />
                            </Link>
                        </div>
                    )}
                {description && (
                    <div>
                        {canEdit && (
                            <span>
                                (<a onClick={this.onCloseDescription}>
                                    {tt('g.remove')}
                                </a>)
                            </span>
                        )}
                        <Link href={link}>
                            <blockquote>{description}</blockquote>
                        </Link>
                    </div>
                )}
            </span>
        );
    }
}
export default connect(
    (state, ownProps) => {
        // const {text} = ownProps
        const formId = ownProps.formId;
        const metaLinkData = state.global.getIn(['metaLinkData', formId]);
        return { metaLinkData, ...ownProps };
    },
    dispatch => ({
        clearMetaElement: (formId, element) => {
            dispatch(globalActions.clearMetaElement({ formId, element }));
        },
    })
)(CardView);
