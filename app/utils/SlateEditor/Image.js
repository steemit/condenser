import React from 'react'
import {connect} from 'react-redux'

export default connect(
    (state, ownProps) => ownProps,
    dispatch => ({
        uploadImage: (file, dataUrl, filename, progress) => {
            dispatch({
                type: 'user/UPLOAD_IMAGE',
                payload: {file, dataUrl, filename, progress},
            })
        },
    })
)(

class Image extends React.Component {
    state = {
        progress: {},
    };

    componentWillMount() {
        const file = this.props.node.data.get('file')
        // Save `file` for "Retry"
        // Try to load incase data url was loaded from a draft
        this.setState({ file })
    }

    componentDidMount() {
        console.log("** image mounted..", this.state, this.props)
        this.load()
    }

    setImageSrc(src, filename) {
        const {editor, node} = this.props
        const state = editor.getState();
        const next = state
            .transform()
            .setNodeByKey(node.key, { data: { src, alt: filename } })
            .apply()
        editor.onChange(next)
    }

    load = () => {
        let dataUrl, filename
        const {file} = this.state
        if(file) {
            // image dropped -- show a quick preview
            console.log("** image being loaded.. ----->", file)
            const reader = new FileReader()
            reader.addEventListener('load', () => {
                dataUrl = reader.result
                this.setImageSrc(dataUrl, file.name)
            })
            reader.readAsDataURL(file)
            filename = file.name
        } else {
            // draft, recover data using the preview data url
            const {data} = this.props.node
            const src = data.get('src')
            if(/^data:/.test(src)) {
                dataUrl = src
                filename = data.get('alt')
            }
        }

        if(!file && !dataUrl) return
        this.setState({ progress: {}, uploading: true}, () => {
            const {uploadImage} = this.props
            uploadImage(file, dataUrl, filename, progress => {
                this.setState({ progress, uploading: false })
                if(progress.url) {
                    this.setImageSrc(progress.url, filename)
                }
            })
        })
    }

    render() {
        const { node, state, attributes } = this.props

        const isFocused = state.selection.hasEdgeIn(node)
        const className = isFocused ? 'active' : null

        const prefix = $STM_Config.img_proxy_prefix ? ($STM_Config.img_proxy_prefix + '0x0/') : ''

        const alt = node.data.get('alt')
        const src = node.data.get('src')

        console.log("** rendering image... src:", (src ? src.substring(0, 30) + '...' : '(null)'), state)

        if(!src) return <small className="info">Loading Image&hellip;</small>

        if(/^https?:\/\//.test(src)) return <img {...attributes} src={prefix + src} alt={alt} className={className} />

        const img = <img src={src} alt={alt} className={className} />

        const {uploading} = this.state
        if(uploading)
            return <div {...attributes}>
                {img}
                <br />
                <small className="info">Uploading Image&hellip;</small>
            </div>

        const { error } = this.state.progress
        return <div {...attributes}>
            {img}
            <div className="error">
                <small>
                    Image was not Saved (<a onClick={this.load}>retry</a>)
                    <br />
                    {error}
                </small>
            </div>
        </div>
    }
})
