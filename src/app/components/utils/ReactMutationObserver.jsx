import React from 'react';

/**
 * React wrapper to do some actions upon changes in the DOM
 */
class ReactMutationObserver extends React.Component {
    observerConfig = {
        attributes: false,
        childList: false,
        subtree: false,
        characterData: false,
    };

    observer = null;
    onChildListChanged = null;
    onAttributesChanged = null;
    onSubtreeChanged = null;
    onCharacterDataChanged = null;

    constructor(props) {
        super(props);
        const {
            onChildListChanged = null,
            onAttributesChanged = null,
            onSubtreeChanged = null,
            onCharacterDataChanged = null,
        } = props;
        const me = this;

        this.initObserver = this.initObserver.bind(this);
        this.disconnect = this.disconnect.bind(this);

        me.onChildListChanged = onChildListChanged;
        me.onAttributesChanged = onAttributesChanged;
        me.onSubtreeChanged = onSubtreeChanged;
        me.onCharacterDataChanged = onCharacterDataChanged;

        if (me.onChildListChanged !== null) {
            me.observerConfig.childList = true;
            me.observerConfig.subtree = true;
        }

        if (me.onAttributesChanged !== null) {
            me.observerConfig.attributes = true;
        }

        if (me.onSubtreeChanged !== null) {
            me.observerConfig.subtree = true;
        }

        if (me.onCharacterDataChanged !== null) {
            me.observerConfig.characterData = true;
        }

        if (typeof MutationObserver !== 'undefined') {
            this.observer = new MutationObserver(mutations => {
                mutations.forEach(function(mutation) {
                    if (
                        mutation.type === 'childList' &&
                        typeof me.onChildListChanged === 'function'
                    ) {
                        me.onChildListChanged(mutation, me.disconnect);
                    }

                    if (
                        mutation.type === 'attributes' &&
                        typeof me.onAttributesChanged === 'function'
                    ) {
                        me.onAttributesChanged(mutation, me.disconnect);
                    }

                    if (
                        mutation.type === 'subtree' &&
                        typeof me.onSubtreeChanged === 'function'
                    ) {
                        me.onSubtreeChanged(mutation, me.disconnect);
                    }

                    if (
                        mutation.type === 'characterData' &&
                        typeof me.onCharacterDataChanged === 'function'
                    ) {
                        me.onCharacterDataChanged(mutation, me.disconnect);
                    }
                });
            });
        }
    }

    disconnect() {
        if (typeof MutationObserver !== 'undefined') {
            this.observer.disconnect();
        }
    }

    initObserver(componentElement) {
        if (
            typeof MutationObserver !== 'undefined' &&
            componentElement !== null
        ) {
            this.observer.observe(componentElement, this.observerConfig);
        }
    }

    render() {
        const { children } = this.props;

        return <div ref={this.initObserver}>{children}</div>;
    }
}

export default ReactMutationObserver;
