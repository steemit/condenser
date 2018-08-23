import React, { PureComponent } from 'react';

export default class Linkify extends PureComponent {
    render() {
        const { children } = this.props;

        const parts = [];

        let prevPosition = 0;

        children.replace(/https?:\/\/[^\s)]+/g, (url, position) => {
            if (position > prevPosition) {
                parts.push(children.substring(prevPosition, position));
            }

            parts.push(
                <a key={position} href={url} target="_blank">
                    {url}
                </a>
            );

            prevPosition = position + url.length;
        });

        if (prevPosition < children.length) {
            parts.push(children.substring(prevPosition, children.length))
        }

        return (
            <span>
                {parts}
            </span>
        );
    }
}
