import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    handleError(error: any): void {
        const chunkFailed = /Loading chunk [\d]+ failed/;
        const extensionError = /Receiving end does not exist|could not establish connection/i;

        if (chunkFailed.test(error.message) || extensionError.test(error.message || error)) {
            // Ignore extension errors and chunk load errors (often network blips)
            return;
        }

        console.error('An error occurred:', error);
    }
}
