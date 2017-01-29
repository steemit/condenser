import React from 'react';
import links from 'app/utils/Links'
import {browserHistory} from 'react-router'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'

export default class Link extends React.Component {
    static propTypes = {
        // HTML properties
        href: React.PropTypes.string,
    }
    constructor(props) {
        super()
        const {href} = props
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Link')
        this.localLink = href && links.local.test(href)
        this.onLocalClick = e => {
            e.preventDefault()
            browserHistory.push(this.props.href)
        }
    }
    render() {
        const {props: {href, children}, onLocalClick} = this
        if(this.localLink) return <a onClick={onLocalClick}>{children}</a>
        return <a target="_blank" href={href}>{children}</a>
    }
}