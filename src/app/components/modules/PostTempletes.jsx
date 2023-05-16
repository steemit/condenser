import React, { Component } from 'react';
import { connect } from 'react-redux';
import tt from 'counterpart';
import * as userActions from 'app/redux/UserReducer';
import MarkdownViewer from 'app/components/cards/MarkdownViewer';

class PostTempletes extends Component {
    constructor(props) {
        super();

        this.state = {
            templeteList: [
                {
                    title: 'Code',
                    content: `~~~\n\n~~~\n`,
                },
                {
                    title: 'Link',
                    content: `[Link title](https://upvu.org)\n`,
                },
                {
                    title: 'Table',
                    content: `| column 1 | column 2 | column 3 |\n| --- | --- | --- |\n| cell 1 | cell 2 | cell 3 |\n| cell 4 | cell 5 | cell 6 |\n`,
                },
                {
                    title: 'Footnote',
                    content: `footnote text[^name]\n[^name]: footnote content\n`,
                },
                {
                    title: 'Numbered List',
                    content: `1. content 1\n2. content 2\n3. content 3\n`,
                },
                {
                    title: 'Unnumbered List',
                    content: `- content 1\n- content 2\n- content 3\n`,
                },
                {
                    title: 'Header',
                    content: `# header 1\n## header 2\n### header 3\n`,
                },
                {
                    title: 'Highlight',
                    content: `**highlighted text**\n`,
                },
                {
                    title: 'Italic',
                    content: `*italic text*\n`,
                },
            ],
        };
    }

    // clickContent() {
    //     this.props.hidePostTempletes();
    // }

    componentDidMount() {
        // this.getDraftList();
    }

    render() {
        const { username, onTempletesClose, hidePostTempletes } = this.props;
        const { templeteList } = this.state;
        const thumb = '';
        const onClickContent = idx => {
            console.log(idx);
            // this.clickContent();
            onTempletesClose(templeteList[idx].content);
            hidePostTempletes();
        };

        const templetes = templeteList.map((templete, idx) => (
            <div key={idx} className="templetes-option">
                <div className="articles__summary">
                    <div className="articles__summary-header">
                        <span>
                            <strong>
                                {idx + 1}. {templete.title}
                            </strong>
                        </span>
                    </div>
                    <div
                        className={
                            'articles__content hentry' +
                            (thumb ? ' with-image ' : ' ')
                        }
                        itemScope
                        itemType="http://schema.org/blogPost"
                    >
                        <div
                            className="articles__content-block articles__content-block--text"
                            onClick={() => onClickContent(idx)}
                        >
                            <MarkdownViewer text={templete.content} />
                        </div>
                    </div>
                </div>
            </div>
        ));

        return (
            <div>
                <div className="row">
                    <h3 className="column">{tt('reply_editor.templete')}</h3>
                </div>
                <hr />
                <div className="templetes-list">{templetes}</div>
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const username = state.user.getIn(['current', 'username']);
        return {
            ...ownProps,
            fields: [],
            username,
            initialValues: {},
            onTempletesClose: ownProps.onTempletesClose,
        };
    },
    dispatch => ({
        hidePostTempletes: () => dispatch(userActions.hidePostTempletes()),
    })
)(PostTempletes);
