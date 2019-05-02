import { formatEventReport } from './FrontendLogger';

describe('formatEventReport', () => {
    it('should handle modern firefox/chrome errors with a stacktrace', () => {
        const modernErrorEvent = {
            error: {
                stack: 'i am a stacktrace',
            },
            message: 'i am a message',
        };

        const logged = formatEventReport(
            modernErrorEvent,
            'location',
            'version'
        );

        expect(logged.trace).toEqual('i am a stacktrace');
        expect(logged.message).toEqual('i am a message');
        expect(logged.version).toEqual('version');
        expect(logged.href).toEqual('location');
    });
    it('should handle errors from browsers that do not provide a stack trace', () => {
        const lameErrorEvent = {
            message: 'i am an old error',
        };

        const logged = formatEventReport(lameErrorEvent, 'location', 'version');

        expect(logged.trace).toEqual(false);
        expect(logged.message).toEqual('i am an old error');
        expect(logged.version).toEqual('version');
        expect(logged.href).toEqual('location');
    });
});
