export class Exception extends Error {
    public message: string;
    public metadata: string;
    public stack: string;
    public metadataObj: string;

    constructor(message, metadata?, stack?) {
        let json = '';
        try {
            json = JSON.stringify(metadata); //, null, 2);
        } catch {}
        let msg = message;
        if (json != '') msg += '\nMetadata: ' + json;
        super(msg);
        this.name = 'Exception';
        this.message = message;
        this.metadataObj = metadata;
        this.metadata = json;
        this.stack = stack;
    }

    public metadataPretty() {
        return JSON.stringify(this.metadataObj, null, 2);
    }

    public static fromError(err: Error) {
        return new Exception(err.message, err, err.stack);
    }

    public static assert(condition: any | any[], message?: string, metadata?, exceptionType: typeof Exception = Exception) {
        let conditions = condition;
        if (!Array.isArray(condition)) conditions = [condition];

        for (let cond of conditions) {
            let isNull = cond === null;
            let isFalse = typeof cond == 'boolean' && cond !== true;

            if (isNull || isFalse) throw new exceptionType(message, metadata);
        }
    }

    public toString() {
        return (this.message += '\n\tMetadata: ' + this.metadata);
    }
}

export class ErrorNotFound extends Exception {
    constructor(message, metadata?, stack?) {
        super('Requested item not found', metadata, stack);
    }
}

export class ErrorDuplicate extends Exception {
    constructor(message, metadata?, stack?) {
        super(message || 'Requested item conflicts with exists', { metadata }, stack);
    }
}

export class HttpError extends Exception {
    constructor(public statusCode: number, message, metadata?, stack?) {
        super(message, metadata, stack);
    }

    public static tryGetErrorCode(error: any, defaultCode: number): number {
        if (error == null) return defaultCode;

        if (error instanceof HttpError) return (<HttpError>error).statusCode;
        if (error instanceof ErrorNotFound) return new HttpErrorNotFound(error.message, error.metadata, error.stack).statusCode;
        if (error instanceof ErrorDuplicate) return new HttpErrorDuplicate(error.message, error.metadata, error.stack).statusCode;

        return defaultCode;
    }
}

export class HttpErrorBadRequest extends HttpError {
    public statusCode: number;
    constructor(message, metadata?, stack?) {
        super(400, message, metadata, stack);
    }
}

export class HttpErrorNotFound extends HttpError {
    public statusCode: number;
    constructor(message, metadata?, stack?) {
        super(404, message, metadata, stack);
    }
}

export class HttpErrorDuplicate extends HttpError {
    public statusCode: number;
    constructor(message, metadata?, stack?) {
        super(409, message, metadata, stack);
    }
}

export class NotImplemented extends Exception {
    constructor() {
        super('Not Implemented!');
    }
}

export default Exception;
