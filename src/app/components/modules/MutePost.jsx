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
        const { notes, disableSubmit } = this.state;
        return (
            <span className="ExplorePost">
                <h4>{tt('g.mute_this_post')}</h4>
                <p>
                    Please provide a note regarding your decision to mute this
                    post.
                </p>
                <hr />
                <form onSubmit={() => this.onSubmit()}>
                    <div className="input-group">
                        <span className="input-group-label">Notes</span>
                        <input
                            className="input-group-field"
                            type="text"
                            onChange={e => this.onInput(e)}
                        />
                        <button
                            className="button slim hollow secondary"
                            type="submit"
                            title={tt('g.mute')}
                            disabled={disableSubmit}
                        >
                            {tt('g.mute')}
                        </button>
                    </div>
                </form>
            </span>
        );
    }
}

MutePost.propTypes = {
    onSubmit: PropTypes.func.isRequired,
};

export default connect()(MutePost);
