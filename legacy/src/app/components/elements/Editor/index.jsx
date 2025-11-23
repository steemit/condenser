import React from 'react';
import PropTypes from 'prop-types';

export default class EditorMd extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: 'snow',
            cm: null,
        };
    }

    handleChange = () => {
        const { cm } = this.state;
        this.props.onChange(cm.getMarkdown());
    };

    componentDidMount() {
        const config = {
            id: this.props.editorId,
            width: '100%',
            height: 700,
            path: '/assets/plugins/editor.md/lib/',
            markdown: this.props.content,
            placeholder: this.props.placeholder,
            codeFold: true,
            saveHTMLToTextarea: false,
            searchReplace: true,
            toolbarIcons: () => [
                'undo',
                'redo',
                '|',
                'link',
                'reference-link',
                'custom-image',
                'code',
                'code-block',
                'table',
                'pagebreak',
                '|',
                'bold',
                'del',
                'italic',
                'quote',
                '|',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                '|',
                'list-ul',
                'list-ol',
                'hr',
                '|',
                'goto-line',
                'clear',
                'search',
                'preview',
                'watch',
            ],
            toolbarIconsClass: {
                'custom-image': 'fa fa-picture-o',
            },
            toolbarIconTexts: {
                'custom-image': 'Upload',
            },
            toolbarHandlers: {
                'custom-image': (cm, icon, cursor, selection) => {
                    this.props.customUpload();
                },
            },
            emoji: true,
            onload: () => {
                this.props.onLoaded(this.state.cm);
            },
            onchange: this.handleChange,
        };
        this.setState({
            cm: editormd(this.props.editorId, config),
        });
    }

    render() {
        return <div id={this.props.editorId} />;
    }
}

EditorMd.propTypes = {
    editorId: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    customUpload: PropTypes.func,
    onLoaded: PropTypes.func,
    content: PropTypes.string,
};
