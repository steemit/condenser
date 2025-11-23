'use strict';

var _FrontendLogger = require('./FrontendLogger');

describe('formatEventReport', function () {
    it('should handle modern firefox/chrome errors with a stacktrace', function () {
        var modernErrorEvent = {
            error: {
                stack: 'i am a stacktrace'
            },
            message: 'i am a message'
        };

        var logged = (0, _FrontendLogger.formatEventReport)(modernErrorEvent, 'location', 'version');

        expect(logged.trace).toEqual('i am a stacktrace');
        expect(logged.message).toEqual('i am a message');
        expect(logged.version).toEqual('version');
        expect(logged.href).toEqual('location');
    });
    it('should handle errors from browsers that do not provide a stack trace', function () {
        var lameErrorEvent = {
            message: 'i am an old error'
        };

        var logged = (0, _FrontendLogger.formatEventReport)(lameErrorEvent, 'location', 'version');

        expect(logged.trace).toEqual(false);
        expect(logged.message).toEqual('i am an old error');
        expect(logged.version).toEqual('version');
        expect(logged.href).toEqual('location');
    });
});