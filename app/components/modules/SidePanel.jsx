import React, {PropTypes} from 'react';
import CloseButton from 'react-foundation-components/lib/global/close-button';
const {oneOfType, object, array, string} = PropTypes

export default class SidePanel extends React.Component {
    static propTypes = {
        children: oneOfType([object, array]),
        alignment: string
    };

    constructor(props) {
        super(props);
        this.state = {visible: false};
        this.hide = this.hide.bind(this);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.hide);
    }

    show = () => {
        this.setState({visible: true});
        document.addEventListener('click', this.hide);
    };

    hide = () => {
        this.setState({visible: false});
        document.removeEventListener('click', this.hide);
    };

    render() {
        const {visible} = this.state;
        const {children, alignment} = this.props;
        return <div className="SidePanel">
            <div className={(visible ? 'visible ' : '') + alignment}>
                <CloseButton onClick={this.hide} />
                {children}
            </div>
        </div>;
    }
}
