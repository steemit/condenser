import React from 'react';
import cn from 'classnames';
import KEYS from 'app/utils/keyCodes';
import CommonDialog from 'app/components/dialogs/CommonDialog';

let queue = [];
let instance = null;
let id = 0;

export default class DialogManager extends React.PureComponent {
    static showDialog(options) {
        if (instance) {
            instance._showDialog(options);
        } else {
            queue.push(options);
        }
    }

    static info(text, title) {
        DialogManager.showDialog({
            component: CommonDialog,
            props: {
                title,
                text,
            },
        });
    }

    static alert(text, title) {
        DialogManager.showDialog({
            component: CommonDialog,
            props: {
                title,
                type: 'alert',
                text,
            },
        });
    }

    static confirm(text, title) {
        return new Promise(resolve => {
            DialogManager.showDialog({
                component: CommonDialog,
                props: {
                    title,
                    type: 'confirm',
                    text,
                },
                onClose: resolve,
            });
        });
    }

    static dangerConfirm(text, title) {
        return new Promise(resolve => {
            DialogManager.showDialog({
                component: CommonDialog,
                props: {
                    title,
                    type: 'confirm',
                    danger: true,
                    text,
                },
                onClose: resolve,
            });
        });
    }

    static prompt(text, title) {
        return new Promise(resolve => {
            DialogManager.showDialog({
                component: CommonDialog,
                props: {
                    title,
                    type: 'prompt',
                    text,
                },
                onClose: resolve,
            });
        });
    }

    constructor(props) {
        super(props);

        if (process.env.BROWSER) {
            window.DialogManager = DialogManager; // TODO: remove line
        }
        instance = this;

        this._dialogs = [];

        this.state = {
            top: 0,
            dialogOptions: null,
        };
    }

    componentDidMount() {
        document.addEventListener('keydown', this._onKeyDown);

        if (queue.length) {
            for (let dialog of queue) {
                try {
                    instance._showDialog(dialog, true);
                    instance.forceUpdate();
                } catch (err) {
                    console.error(err);
                }
            }
            queue = [];
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this._onKeyDown);
    }

    render() {
        if (!this._dialogs.length) {
            return null;
        }

        const dialogs = this._dialogs.map(({ key, top, options }, i) => (
            <div
                key={key}
                className={cn('DialogManager__window', {
                    DialogManager__window_active:
                        i === this._dialogs.length - 1,
                })}
                style={{ top }}
            >
                <div
                    className="DialogManager__dialog"
                    style={
                        i > 0
                            ? {
                                  transform: `translate3d(${i * 30}px,${i *
                                      30}px,0)`,
                              }
                            : null
                    }
                >
                    <options.component
                        {...options.props}
                        onClose={this._onDialogClose}
                    />
                </div>
            </div>
        ));

        return (
            <div className="DialogManager">
                <div
                    className="DialogManager__shade"
                    onClick={this._onShadeClick}
                />
                {dialogs}
            </div>
        );
    }

    _close(data) {
        const dialog = this._dialogs[this._dialogs.length - 1];

        if (dialog.options.onClose) {
            try {
                dialog.options.onClose(data);
            } catch (err) {
                console.error(err);
            }
        }

        this._dialogs.pop();

        this.forceUpdate();
    }

    _showDialog(options, silent) {
        this._dialogs.push({
            key: ++id,
            top: window.scrollY || 0,
            options,
        });

        if (!silent) {
            this.forceUpdate();
        }
    }

    _onShadeClick = () => {
        this._close();
    };

    _onDialogClose = data => {
        this._close(data);
    };

    _onKeyDown = e => {
        if (this._dialogs.length && e.which === KEYS.ESCAPE) {
            e.preventDefault();
            this._close();
        }
    };
}
