/* eslint react/prop-types: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as appActions from 'app/redux/AppReducer';

class ArticleLayoutSelector extends React.Component {
    render() {
        return (
            <div className="articles__layout-selector">
                <svg
                    className="articles__icon--layout"
                    onClick={this.props.toggleBlogmode}
                >
                    <g
                        id="svg-icon-symbol-layout"
                        viewBox="0 0 24 24"
                        stroke="none"
                        strokeWidth={1}
                        fill="none"
                        fillRule="evenodd"
                    >
                        <rect
                            className="icon-svg icon-svg--accent icon-svg--layout-line1"
                            x={6}
                            y={16}
                            width={12}
                            height={2}
                        />
                        <rect
                            className="icon-svg icon-svg--accent icon-svg--layout-line2"
                            x={6}
                            y={11}
                            width={12}
                            height={2}
                        />
                        <rect
                            className="icon-svg icon-svg--accent icon-svg--layout-line3"
                            x={6}
                            y={6}
                            width={12}
                            height={2}
                        />
                        <path
                            d="M2,2 L2,22 L22,22 L22,2 L2,2 Z M1,1 L23,1 L23,23 L1,23 L1,1 Z"
                            id="icon-svg__border"
                            className="icon-svg icon-svg--accent"
                            fillRule="nonzero"
                        />
                    </g>
                </svg>
            </div>
        );
    }
}

export default connect(
    state => ({
        blogmode: state.app.getIn(['user_preferences', 'blogmode']),
    }),
    dispatch => ({
        toggleBlogmode: () => {
            dispatch(appActions.toggleBlogmode());
        },
    })
)(ArticleLayoutSelector);
