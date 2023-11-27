// tokenHelper.test.js

const fs = require('fs');
const { TokenHelper } = require('../../../app/utils/TokenHelper.js');

describe('TokenHelper', () => {
    // Define a sample tokenData for testing
    const sampleTokenData = {
        tesla_token: {
            token: 'tesla123',
            dateCreated: new Date().toISOString(),
            dateUpdated: new Date().toISOString(),
        },
        em_token: {
            token: 'em123',
            dateCreated: new Date().toISOString(),
            dateUpdated: new Date().toISOString(),
        },
    };

    beforeEach(() => {
        // Mock fs.readFileSync and fs.writeFileSync
        jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(JSON.stringify(sampleTokenData));
        jest.spyOn(fs, 'writeFileSync').mockImplementation(() => { });
    });

    afterEach(() => {
        // Restore mock implementations after each test
        jest.restoreAllMocks();
    });

    describe.skip('get', () => {
        it('should return tokenData', () => {
            expect(TokenHelper.get()).toEqual(sampleTokenData);
        });
    });

    describe.skip('getByType', () => {
        it('should return the specified token by type', () => {
            expect(TokenHelper.getByType('tesla_token')).toEqual(sampleTokenData.tesla_token);
            expect(TokenHelper.getByType('em_token')).toEqual(sampleTokenData.em_token);
        });
    });

    it('should return null for non-existent token type', () => {
        expect(TokenHelper.getByType('invalid_token')).toBeNull();
    });

    describe('createTeslaToken', () => {
        it('should create a new tesla_token', () => {
            const teslaTokenData = { token: 'newTeslaToken' };
            TokenHelper.createTeslaToken(teslaTokenData);

            expect(TokenHelper.getByType('tesla_token')).toEqual({
                token: 'newTeslaToken',
                dateCreated: expect.any(String),
                dateUpdated: expect.any(String),
            });
        });
    });

    describe('createEmToken', () => {
        it('should create a new em_token', () => {
            const emTokenData = { token: 'newEmToken' };
            TokenHelper.createEmToken(emTokenData);

            expect(TokenHelper.getByType('em_token')).toEqual({
                token: 'newEmToken',
                dateCreated: expect.any(String),
                dateUpdated: expect.any(String),
            });
        });
    });
});
