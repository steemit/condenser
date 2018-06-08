import React from 'react';
import cn from 'classnames';
import tt from 'counterpart';
import Icon from 'app/components/elements/Icon';

export default class EditorSwitcher extends React.Component {
    static propTypes = {
        items: React.PropTypes.array.isRequired,
        isPreview: React.PropTypes.bool.isRequired,
        activeId: React.PropTypes.number,
        onChange: React.PropTypes.func.isRequired,
        onPreviewChange: React.PropTypes.func.isRequired,
    };

    render() {
        const { items, activeId, isPreview } = this.props;

        return (
            <div className="EditorSwitcher">
                {items.map(item => (
                    <div
                        key={item.id}
                        className={cn('EditorSwitcher__item', {
                            EditorSwitcher__item_active: item.id === activeId,
                        })}
                        onClick={
                            item.id === activeId
                                ? null
                                : () => this.props.onChange(item.id)
                        }
                    >
                        {item.text}
                    </div>
                ))}
                <i className="EditorSwitcher__filler" />
                <i
                    className={cn('EditorSwitcher__eye', {
                        EditorSwitcher__eye_active: isPreview,
                    })}
                    onClick={this._onPreviewClick}
                >
                    <Icon
                        name="editor/eye"
                        className="EditorSwitcher__eye-icon"
                        data-tooltip={tt('post_editor.preview_mode')}
                    />
                </i>
            </div>
        );
    }

    _onPreviewClick = () => {
        this.props.onPreviewChange(!this.props.isPreview);
    };
}
