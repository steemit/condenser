/* eslint react/prop-types: 0 */
import React from 'react'
import g from 'app/redux/GlobalReducer'
import transaction from 'app/redux/Transaction'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import {Map} from 'immutable'

const {string, object} = React.PropTypes

class Template extends React.Component {
    static propTypes = {
    }

    static defaultProps = {
    }

    constructor() {
        super()
        this.state = {}
    }

    componentWillMount() {
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    // This is based on react PureRenderMixin, it makes the component very efficient by not re-rendering unless something in the props or state changed.. PureRenderMixin comes highly recommended.  shouldComponentUpdate adds a debug boolean to show you why your component rendered (what changed, in the browser console type: steemDebug_shouldComponentUpdate=true).
    shouldComponentUpdate = shouldComponentUpdate(this, 'Template')
    componentWillUpdate(nextProps, nextState) {
    }

    componentDidUpdate(prevProps, prevState) {
    }

    componentWillUnmount() {
    }

    render() {
        const {} = this.props
        return (
            <span className="Template">
            </span>
        )
    }
}

import {connect} from 'react-redux'

export default connect(
    (state, ownProps) => {
        return {
            ...ownProps,
        }
    },
    dispatch => ({
        vote: (abc) => {
            dispatch(transaction.actions.broadcastOperation({
                abc
            }))
        },
    })
)(Template)
