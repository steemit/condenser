import React from 'react'

export default class Align extends React.Component {

    getAlignClass = () => {
        const {node} = this.props
        switch(node.data.get('align')) {
            case 'text-right':  return 'text-right';
            case 'text-left':   return 'text-left';
            case 'text-center': return 'text-center';
            case 'pull-right':  return 'pull-right';
            case 'pull-left':   return 'pull-left';
        }
    }

    render = () => {
        const { node, attributes, children } = this.props
        const className = this.getAlignClass();

        return (
            <div {...attributes} className={className}>
                {children}
            </div>
        )
    }
}
