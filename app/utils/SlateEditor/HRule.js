import React from 'react'

export default class HRule extends React.Component {
    render() {
        const { node, state } = this.props
        const isFocused = state.selection.hasEdgeIn(node)
        const className = isFocused ? 'active' : null
        return <hr className={className} />
    }
}
