import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import Experiment from 'react-ab-test/lib/Experiment';
import emitter from 'react-ab-test/lib/emitter';
import experimentDebugger from 'react-ab-test/lib/debugger';
import {serverApiRecordEvent} from 'app/utils/ServerApiClient';

/*
Usage example:

import Experiment from 'app/components/elements/ExperimentWrapper';

win() {
 Experiment.win('MyExample1');
}

<Experiment name="MyExample1">
    <Variant name="A">
        <div onClick={this.win}>Section A</div>
    </Variant>
    <Variant name="B">
        <div onClick={this.win}>Section B</div>
    </Variant>
    <Variant name="C">
        <div onClick={this.win}>Section C</div>
    </Variant>
    <Variant name="D">
        <div onClick={this.win}>Section D</div>
    </Variant>
    <Variant name="E">
        <div onClick={this.win}>Section E</div>
    </Variant>
    <Variant name="F">
        <div onClick={this.win}>Section F</div>
    </Variant>
</Experiment>
 */

class ExperimentWrapper extends React.Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        uid: PropTypes.string.isRequired,
        children: PropTypes.any.isRequired
    };

    constructor(props) {
        super(props);
        experimentDebugger.enable();
    }

    render() {
        const uid = this.props.uid;
        return (
            <Experiment name={this.props.name} userIdentifier={uid}>
                {this.props.children}
            </Experiment>
        );
    }
}

emitter.addPlayListener( (experimentName, variantName) => {
    // console.log("Displaying experiment ‘" + experimentName + "’ variant ‘" + variantName + "’");
    serverApiRecordEvent('Ex:' + experimentName, 'Show:' + variantName, 10);
});

emitter.addWinListener( (experimentName, variantName) => {
    // console.log("Variant ‘" + variantName + "’ of experiment ‘" + experimentName + "’  was clicked");
    serverApiRecordEvent('Ex: ' + experimentName, 'Win:' + variantName, 10);
});


ExperimentWrapper = connect(
    state => {
        return {
            uid: state.getIn(['offchain', 'uid'])
        }
    }
)(ExperimentWrapper);

ExperimentWrapper.win = (name) => emitter.emitWin(name);

export default ExperimentWrapper;
