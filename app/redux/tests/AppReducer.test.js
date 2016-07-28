/*global describe, it, before, beforeEach, after, afterEach */
import chai, {expect} from 'chai';
import dirtyChai from 'dirty-chai';
import chaiImmutable from 'chai-immutable';
import {Map} from 'immutable';
import reducer from '../AppReducer';
chai.use(dirtyChai);
chai.use(chaiImmutable);

const defaultState = Map({
    effects: Map({}),
    loading: false,
    error: ''
});

const effectTriggered = {
    type: 'EFFECT_TRIGGERED',
    effectId: 1,
    effect: {
        CALL: true
    }
};

const effectResolved = {
    type: 'EFFECT_RESOLVED',
    effectId: '1'
};


describe('AppReducer', () => {
    it('should return default state', () => {
        expect(
            reducer(undefined, {})
        ).to.equal(defaultState);
    });

    it('triggered effect should be added to effects and turn on loading', () => {
        const state = reducer(undefined, effectTriggered);
        expect(state.get('loading')).to.be.true();
        expect(state.get('effects').size).to.equal(1);
    });

    it('resolved effect should be added to effects and turn on loading', () => {
        const triggeredState = Map({
            effects: Map({['1']: Date.now()}),
            loading: true,
            error: ''
        });
        const state = reducer(triggeredState, effectResolved);
        expect(state.get('effects').size).to.equal(0);
        expect(state.get('loading')).to.be.false();
    });
});
