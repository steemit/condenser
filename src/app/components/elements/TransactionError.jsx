import React from 'react'
import {connect} from 'react-redux'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import {Map} from 'immutable'

const {func, string} = React.PropTypes

/** Sole consumer for a transaction error of a given type. */
class TransactionError extends React.Component {
    static propTypes = {
        // HTML properties
        opType: string.isRequired,
        error: string, // additional error (optional)

        // Redux connect properties
        addListener: func.isRequired,
        removeListener: func.isRequired,
        errorKey: string,
        exception: string,
    }
    componentWillMount() {
        const {opType, addListener} = this.props
        addListener(opType)
    }
    shouldComponentUpdate = shouldComponentUpdate(this, 'TransactionError')
    componentWillUnmount() {
        const {opType, removeListener} = this.props
        removeListener(opType)
    }
    render() {
        const{errorKey, exception, error} = this.props
        const cn = "error callout alert"
        if(!errorKey && !exception) {
            if(!error) return <span></span>
                return (
                    <span className="TransactionError">
                        <div className={cn}>{error}</div>
                    </span>
                )
        }
        const text = (errorKey ? errorKey : exception)
        return (
            <span className="TransactionError">
                <div className={cn}>{text}</div>
            </span>
        )
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const {opType} = ownProps
        const error = state.getIn(['transaction', 'TransactionError', opType]) || Map()
        const {key, exception} = error.toJS()
        return {
            ...ownProps,
            errorKey: key, exception,
        }
    },
    // mapDispatchToProps
    dispatch => ({
        addListener: (opType) => {
            dispatch({type: 'transaction/SET', payload: {key: ['TransactionError', opType + '_listener'], value: true}})
        },
        removeListener: (opType) => {
            dispatch({type: 'transaction/REMOVE', payload: {key: ['TransactionError', opType]}})
            dispatch({type: 'transaction/REMOVE', payload: {key: ['TransactionError', opType + '_listener']}})
        },
    })
)(TransactionError)
