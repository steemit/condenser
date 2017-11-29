import React from 'react';
import CloseButton from 'react-foundation-components/lib/global/close-button';

export default class BottomPanel extends React.Component {
    static propTypes = {
        children: React.PropTypes.object,
        visible: React.PropTypes.bool,
        hide: React.PropTypes.func.isRequired
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.visible) {
            document.addEventListener('click', this.props.hide);
        } else {
            document.removeEventListener('click', this.props.hide);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.props.hide);
    }

    render() {
        const {children, visible, hide} = this.props;
        return <div className="BottomPanel">
            <div className={visible ? 'visible ' : ''}>
                <CloseButton onClick={hide} />
                {children}
            </div>
        </div>;
    }
}
