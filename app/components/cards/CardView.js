import React from 'react';
import {connect} from 'react-redux'
import Link from 'app/components/elements/Link'
import g from 'app/redux/GlobalReducer'
import links from 'app/utils/Links'
import { translate } from 'app/Translator';

/** @deprecated */
class CardView extends React.Component {
    static propTypes = {
        // HTML properties
        formId: React.PropTypes.string,
        canEdit: React.PropTypes.bool,

        // redux or html
        metaLinkData: React.PropTypes.object,

        // redux
        clearMetaElement: React.PropTypes.func,
    }
    static defaultProps = {
        canEdit: false
    }
    constructor() {
        super()
        this.onCloseImage = e => {
            e.preventDefault()
            const {formId, clearMetaElement} = this.props
            clearMetaElement(formId, 'image')
        }
        this.onCloseDescription = e => {
            e.preventDefault()
            const {formId, clearMetaElement} = this.props
            clearMetaElement(formId, 'description')
        }
    }
    render() {
        const {metaLinkData, canEdit} = this.props
        if(!metaLinkData) return <span></span>
        const {link, image, description, alt} = metaLinkData
        // http://postimg.org/image/kbefrpbe9/
        if(!image && !description) return <span></span>
        // youTubeImages have their own preview
        const youTubeImage = links.youTube.test(link)
        return <span className="Card">
            {image && !youTubeImage && <div>
                {canEdit && <div>(<a onClick={this.onCloseImage}>{translate('remove')}</a>)<br /></div>}
                <Link href={link}>
                    <img src={image} alt={alt} />
                </Link>
            </div>}
            {description && <div>
                {canEdit && <span>(<a onClick={this.onCloseDescription}>{translate('remove')}</a>)</span>}
                <Link href={link}>
                    <blockquote>{description}</blockquote>
                </Link>
            </div>}
        </span>
    }
}
export default connect(
    (state, ownProps) => {
        // const {text} = ownProps
        const formId = ownProps.formId
        const metaLinkData = state.global.getIn(['metaLinkData', formId])
        return {metaLinkData, ...ownProps};
    },
    dispatch => ({
        clearMetaElement: (formId, element) => {
            dispatch(g.actions.clearMetaElement({formId, element}))
        }
    })
)(CardView)
