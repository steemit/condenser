import React from 'react';
import PropTypes from 'prop-types';
import Quill from 'quill';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
var IMGUR_CLIENT_ID = 'bcab3ce060640ba';
var IMGUR_API_URL = 'https://api.imgur.com/3/image';
/* 
 * Simple editor component that takes placeholder text as a prop 
 */
export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editorHtml: '', theme: 'snow' };
        this.handleChange = this.handleChange.bind(this);
        this.editor = null;
    }

    imageHandler(image, callback) {
        console.log('imageHandler');
        var data = new FormData();
        data.append('image', image);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', IMGUR_API_URL, true);
        xhr.setRequestHeader('Authorization', 'Client-ID ' + IMGUR_CLIENT_ID);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var response = JSON.parse(xhr.responseText);
                if (response.status === 200 && response.success) {
                    callback(response.data.link);
                } else {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        callback(e.target.result);
                    };
                    reader.readAsDataURL(image);
                }
            }
        };
        xhr.send(data);
    }

    handleChange(html) {
        console.log(html);
        //this.props.onChange(html)

        this.setState({ editorHtml: html });
        setTimeout(() => {
            this.props.onChange(html);
        }, 1000);
    }

    /**
     * Step1. select local image
     *
     */
    selectLocalImage() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.click();

        // Listen upload local image and save to server
        input.onchange = () => {
            const file = input.files[0];

            // file type is only image.
            if (/^image\//.test(file.type)) {
                //this.saveToServer(file);
                this.props.uploadImage(file);
            } else {
                console.warn('You could only upload images.');
            }
        };
    }

    /**
     * Step2. save to server
     *
     * @param {File} file
     */
    saveToServer(file) {
        const fd = new FormData();
        fd.append('image', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:3000/upload/image', true);
        xhr.onload = () => {
            if (xhr.status === 200) {
                // this is callback data: url
                const url = JSON.parse(xhr.responseText).data;
                this.insertToEditor(url);
            }
        };
        xhr.send(fd);
    }

    /**
     * Step3. insert image url to rich editor.
     *
     * @param {string} url
     */
    insertToEditor(url) {
        // push image url to rich editor.
        const range = editor.getSelection();
        this.editor.insertEmbed(
            range.index,
            'image',
            `http://localhost:9000${url}`
        );
    }

    componentDidMount() {
        //this.refs.quill.getEditor().getModule("toolbar").addHandler("image", imgHandler);
        this.editor = new Quill('#editor', {
            modules: {
                toolbar: ['image'],
            },
            placeholder: 'Insert an image...',
            theme: 'snow',
            imageHandler: () => {
                console.log('123');
            },
        });
        // quill editor add image handler
        this.editor.getModule('toolbar').addHandler('image', () => {
            this.selectLocalImage();
        });
    }

    render() {
        return <div id="editor" />;
    }
}

/* 
   * Quill modules to attach to editor
   * See https://quilljs.com/docs/modules/ for complete options
   */
/*
Editor.modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, 
       {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    }
}

  /* 
   * Quill editor formats
   * See https://quilljs.com/docs/formats/
   */
/*Editor.formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ]
  */

/* 
   * PropType validation
   */
Editor.propTypes = {
    placeholder: PropTypes.string,
};
