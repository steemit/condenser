/* eslint-disable no-undef */
import { signData, unsignData } from 'server/utils/encrypted';

/**
 * Private Key: 5J5MXVUyJwXWG6VQaBj1uimiMSGM1ky1HWYrZkaGpBrazbFmE2f
 * Public Key: STM76hoMV1XezMjEMhdA9EyXz4aY1JmbXUfA2mRRGUYmgbEmgDMCG
 * Private Key: 5KSym4fDweNBkKzwf2CuPun4J97o5mhEABfuAEgBp9wL6AKWG6Y
 * Public Key: STM74ujL6hgg6d2GcBAftyszFNbyf1rUuEaSmbcHyTuUXpghGzomo
 */

describe('Server utils misc', () => {
    it('test signData unexpected private key', () => {
        try {
            signData('test', 'private_key');
        } catch (error) {
            expect(error.message).toEqual('unexpected_private_key');
        }
    });
    it('test unsignData lost nonce', () => {
        try {
            const data = {};
            unsignData(data, 'public_key');
        } catch (error) {
            expect(error.message).toEqual('lost_nonce');
        }
    });
    it('test unsignData lost timestamp', () => {
        try {
            const data = {
                nonce: '123412',
            };
            unsignData(data, 'public_key');
        } catch (error) {
            expect(error.message).toEqual('lost_timestamp');
        }
    });
    it('test unsignData lost signature', () => {
        try {
            const data = {
                nonce: '123412',
                timestamp: '1597107500',
            };
            unsignData(data, 'public_key');
        } catch (error) {
            expect(error.message).toEqual('lost_signature');
        }
    });
    it('test unsignData data timeout', () => {
        try {
            const data = {
                nonce: '123412',
                timestamp: '1597107500',
                signature: '12341241',
            };
            unsignData(data, 'public_key');
        } catch (error) {
            expect(error.message).toEqual('data_timeout');
        }
    });
    it('test signData and unsignData', () => {
        const data = {
            username: 'tron_reward',
            tron_addr: 'abcdefgh',
        };
        const signedData = signData(
            data,
            '5J5MXVUyJwXWG6VQaBj1uimiMSGM1ky1HWYrZkaGpBrazbFmE2f'
        );
        const r = unsignData(
            signedData,
            'STM76hoMV1XezMjEMhdA9EyXz4aY1JmbXUfA2mRRGUYmgbEmgDMCG'
        );
        expect(r).toEqual(true);
        const r1 = unsignData(
            signedData,
            'STM74ujL6hgg6d2GcBAftyszFNbyf1rUuEaSmbcHyTuUXpghGzomo'
        );
        expect(r1).toEqual(false);
    });
});
