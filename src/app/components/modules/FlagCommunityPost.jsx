import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import tt from 'counterpart';

class FlagCommunityPost extends Component {
    constructor(props) {
        super(props);
        this.state = { notes: '', disableSubmit: true };
    }

    componentWillUpdate = (nextProps, nextState) => {
        if (nextState.notes != this.state.notes) {
            this.setState({ disableSubmit: false });
        }
    };

    onInput = e => {
        this.setState({ notes: `${e.target.value || ''}` });
    };

    onSubmit = () => {
        if (this.state.notes) this.props.onSubmit(this.state.notes);
    };

    render() {
        const { disableSubmit } = this.state;
        const { flagText, isComment } = this.props;
        return (
            <span>
                <div>
                    <h4>
                        {tt('g.flag_this_post', {
                            type: isComment ? 'comment' : 'post',
                        })}
                    </h4>
                    <p>
                        {tt('g.flag_this_post_description', {
                            type: isComment ? 'comment' : 'post',
                        })}
                    </p>
                    {flagText && flagText.length > 0 && <p>{flagText}</p>}
                </div>
                <hr />
                <div className="input-group">
                    <span className="input-group-label">Notes</span>
                    <input
                        className="input-group-field"
                        type="text"
                        maxLength={120}
                        onKeyUp={e => {
                            if (e.key === 'Enter') {
                                this.onSubmit();
                            }
                            this.onInput(e);
                        }}
                    />
                    <button
                        className="button slim hollow secondary"
                        type="submit"
                        disabled={disableSubmit}
                        onClick={() => this.onSubmit()}
                    >
                        {tt('g.flag')}
                    </button>
                </div>
            </span>
        );
    }
}

FlagCommunityPost.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    flagText: PropTypes.string.isRequired,
    isComment: PropTypes.bool,
};

FlagCommunityPost.defaultProps = {
    isComment: false,
};

export default connect()(FlagCommunityPost);
