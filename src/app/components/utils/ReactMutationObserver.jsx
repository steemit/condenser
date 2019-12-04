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

        this.observer = new MutationObserver(mutations => {
            mutations.forEach(function(mutation) {
                if (typeof me.onChildListChanged === 'function') {
                    me.onChildListChanged(mutation);
                }

                if (typeof me.onAttributesChanged === 'function') {
                    me.onAttributesChanged(mutation);
                }

                if (typeof me.onSubtreeChanged === 'function') {
                    me.onSubtreeChanged(mutation);
                }

                if (typeof me.onCharacterDataChanged === 'function') {
                    me.onCharacterDataChanged(mutation);
                }
            });
        });
        this.initObserver = this.initObserver.bind(this);
    }

    initObserver(componentElement) {
        this.observer.observe(componentElement, this.observerConfig);
    }

    render() {
        const { children } = this.props;

        return <div ref={this.initObserver}>{children}</div>;
    }
}

export default ReactMutationObserver;
