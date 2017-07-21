import React from 'react'

export default class Link extends React.Component {
    state = {};

    componentDidMount() {
    }

    render() {
        const { node, state, attributes, children } = this.props

        const isFocused = state.selection.hasEdgeIn(node)
        const className = isFocused ? 'active' : null
        const href = node.data.get('href')

        return <a {...attributes} href={href} className={className}>{children}</a>
    }
}
