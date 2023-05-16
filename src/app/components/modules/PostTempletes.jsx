import React, { Component } from 'react';
import { connect } from 'react-redux';
import tt from 'counterpart';
import * as userActions from 'app/redux/UserReducer';

class PostTempletes extends Component {
    constructor(props) {
        super();

        this.state = {
            templeteList: [
                {
                    content: `~~~ \n ~~~`,
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
                    <div
                        className={
                            'articles__content hentry' +
                            (thumb ? ' with-image ' : ' ')
                        }
                        itemScope
                        itemType="http://schema.org/blogPost"
                    >
                        {/* {thumb ? (
                            <div className="articles__content-block articles__content-block--img">
                                {thumb}
                            </div>
                        ) : null} */}
                        <div
                            className="articles__content-block articles__content-block--text"
                            onClick={() => onClickContent(idx)}
                        >
                            {/* {content_title} */}
                            {templete.content}
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
