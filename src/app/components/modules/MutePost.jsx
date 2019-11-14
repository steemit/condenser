import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import tt from 'counterpart';

class MutePost extends Component {
    constructor(props) {
        super(props);
        this.state = { notes: '', disableSubmit: true };
    }

    componentWillUpdate = (nextProps, nextState) => {
        if (nextState.notes != this.state.notes) {
            this.setState({ disableSubmit: nextState.notes == '' });
        }
    };

    onInput = e => {
        this.setState({ notes: `${e.target.value || ''}`.trim() });
    };

    onSubmit = () => {
        if (this.state.notes) this.props.onSubmit(this.state.notes);
    };

    render() {
        const { notes, disableSubmit } = this.state;
        const { isMuted } = this.props;

        return (
            <span>
                {isMuted ? (
                    <div>
                        <h4>{tt('g.unmute_this_post')}</h4>{' '}
                        <p> {tt('g.unmute_this_post_description')}</p>
                    </div>
                ) : (
                    <div>
                        <h4>{tt('g.mute_this_post')}</h4>
                        <p>{tt('g.mute_this_post_description')}</p>
                    </div>
                )}
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
                        {isMuted ? tt('g.unmute') : tt('g.mute')}
                    </button>
                </div>
            </span>
        );
    }
}

MutePost.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    isMuted: PropTypes.bool,
};

MutePost.defaultProps = {
    isMuted: false,
};

export default connect()(MutePost);
