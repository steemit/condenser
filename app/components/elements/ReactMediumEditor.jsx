/* eslint react/prop-types: 0 */
require('medium-editor/dist/css/medium-editor.css')
require('medium-editor/dist/css/themes/default.css')
require('react-medium-editor/example/app.css')
require('medium-editor-insert-plugin/dist/css/medium-editor-insert-plugin.css')
// require('medium-editor-insert-plugin/dist/css/medium-editor-insert-plugin-frontend.css')

import assign from 'object-assign';
import blacklist from 'blacklist';
import React from 'react';
import ReactDOM from 'react-dom';
import MediumEditor from 'medium-editor';
import {connect} from 'react-redux';

const {uploadImage} = $STM_Config

require('medium-editor-insert-plugin')($);

class ReactMediumEditor extends React.Component {
    static propTypes = {
        value: React.PropTypes.string,
        tag: React.PropTypes.string,
    }
    static defaultProps = {
        value: '',
        tag: 'div',
    }
    constructor(props) {
        super(props)
        this.state = {
            dirty: false
        }
    }
    componentDidMount() {
        const dom = ReactDOM.findDOMNode(this);
        this.medium = new MediumEditor(dom, {
            toolbar: {
                buttons: ['bold', 'italic', 'underline', 'anchor', 'h2', 'h3', 'quote', 'image'],
            },
            placeholder: {
                text: '',
                hideOnClick: true
            },
        })
        const _this = this
        $(dom).mediumInsert({
            editor: this.medium,
            addons: {
                embeds: {
                    // placeholder: 'Paste a YouTube, Vimeo, Facebook, Twitter or Instagram link and press Enter', //available
                    placeholder: 'Paste a YouTube or Vimeo and press Enter', // the ones with iframes
                    oembedProxy: null,
                },
                images: {
                    // A preview will leave a data url in the post if the upload fails.  Don't enable until a retry can be performed, we should not bloat the blockchain with data urls.
                    preview: true,
                    captions: false, // needs css (after edit)
                    styles: null, // left / right align is broken
                    fileUploadOptions: { // See https://github.com/blueimp/jQuery-File-Upload/wiki/Options
                        type: 'POST',
                        url: uploadImage,
                        acceptFileTypes: /(\.|\/)(gif|jpe?g|png|svg|ico)$/i, // todo: test svg|ico
                        maxFileSize: 5000 * 1024,
                        formData: () => {
                            return [{name: 'username', value: _this.props.username}]
                        },
                        fail: (data, e) => {
                            console.log('data, e', data, e)
                            const name = e.files[0].name
                            this.props.notify(`${e.errorThrown ? e.errorThrown : 'There was an error uploading your image'} (${name})`)
                        },
                    },
                    deleteScript: null, //'deleteImage',
                    // deleteMethod: 'DELETE',
                }
            },
        })
        this.medium.subscribe('editableInput', () => {
            this.setState({dirty: true})
            if (this.props.onChange) {
                this.props.onChange(dom.innerHTML, () => {
                    const editor = this.medium
                    const allContents = editor.serialize() // mediumInsert plugin
                    let elContent = allContents["element-0"].value
                    // https://github.com/orthes/medium-editor-insert-plugin/issues/341
                    elContent = elContent.replace('<div class="medium-insert-images-progress"></div>', '')
                    elContent = elContent.replace(' class="medium-insert-images medium-insert-active"', '')
                    return elContent
                })
            }
        })
    }
    shouldComponentUpdate(np) {
        // Turn off re-rendering while typing, that causes lots of subtile bugs
        if(this.state.dirty) return false
        return this.props.value !== np.value
    }
    componentDidUpdate() {
        this.medium.restoreSelection();
    }
    componentWillUnmount() {
        this.medium.destroy();
    }
    render() {
        const tag = this.props.tag;
        const props = blacklist(this.props, 'tag', 'contentEditable', 'dangerouslySetInnerHTML');
        assign(props, {
            dangerouslySetInnerHTML: { __html: this.props.value }
        });
        if (this.medium) {
            this.medium.saveSelection();
        }
        const tagEl = React.createElement(tag, props);
        return <div>
            {tagEl}
        </div>
    }

}
export default connect(
    // mapStateToProps
    (state, ownProps) => {
        return {
            ...ownProps,
            username: state.user.getIn(['current', 'username'])
        }
    },
    dispatch => ({
        notify: (message) => {
            dispatch({type: 'ADD_NOTIFICATION', payload:
                {key: "msg_" + Date.now(),
                 message,
                 dismissAfter: 5000}
            });
        },
    })
)(ReactMediumEditor)