

//  Unit tests for the TSX Connect Service

import {TSXConnectService} from "./TSXConnectService";

describe('TSXConnectService', () => {
    let service: TSXConnectService;

    beforeEach(() => {
        service = new TSXConnectService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should parse a server response', () => {
        const sampleResponse = 'First part of response|Any status message. Error = 123';
        const parts = service.parseResponseParts(sampleResponse);
        expect(parts.message).toBe('First part of response');
        expect(parts.suffix).toBe('Any status message. Error = 123');
        expect(parts.errorCode).toBe(123);
    })

})
