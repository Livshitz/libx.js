// import { TransformStream } from '@cloudflare/workers-types';
// import { TransformStream } from 'web-streams-polyfill';
import Exception from '../helpers/Exceptions';
import { helpers } from '../helpers';

export interface IStreamOptions {
    headers?: any;
    payload?: any;
    onProgress?: (wholeData) => void;
    method: 'POST' | 'GET' | 'Update';
    encoding?: string;
}

const defaultStreamOptions: IStreamOptions = {
    headers: {},
    onProgress: null,
    method: 'GET',
    encoding: 'utf-8',
    payload: null,
};

export class Streams {
    public constructor(public options?: Partial<ModuleOptions>) {
        this.options = { ...new ModuleOptions(), ...options };
    }

    public static async asyncIterableToStream<T>(asyncList: Promise<AsyncIterable<T>>, callback?: (data: T) => string) {
        if (typeof TransformStream == 'undefined') {
            global.TransformStream = require('web-streams-polyfill').TransformStream;
        }
        let { readable, writable } = new TransformStream();

        let writer = writable.getWriter();
        const textEncoder = new TextEncoder();
        asyncList
            .then(async (itr) => {
                try {
                    for await (const part of itr) {
                        let msg = callback ? callback(part) || '' : part.toString();
                        writer.write(textEncoder.encode(msg));
                    }
                } catch (err) {
                    writer.write(textEncoder.encode('Error while iterating: ' + err));
                }
            })
            .catch((err) => {
                writer.write(textEncoder.encode('Error in completion: ' + err));
            })
            .finally(() => {
                writer.close();
            });

        return readable;
    }

    public static async getStream(url: string, onDelta: (data) => void, options: Partial<IStreamOptions> = defaultStreamOptions) {
        const p = helpers.newPromise();
        try {
            if (options.payload != null) {
                if (options.method == null || options.method == 'GET') options.method = 'POST';
                if (options.headers?.['Content-Type'] == null) {
                    options.headers = {
                        'Content-Type': 'application/json; charset=UTF-8',
                        ...options.headers,
                    };
                }
            }

            const response = await fetch(url, {
                headers: options.headers,
                body: JSON.stringify(options.payload),
                method: options.method,
            });

            if (!response.ok) {
                throw new Error(`consumeStreamEndpoint: HTTP error! Status: ${response.status}`);
            }

            let buffer = '';
            const textDecoder = new TextDecoder(options.encoding ?? defaultStreamOptions.encoding);
            const reader = response.body.getReader();

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    p.resolve(buffer);
                    break;
                }

                const decodedString = textDecoder.decode(value);

                onDelta(decodedString);

                buffer += decodedString;
                options.onProgress?.(buffer);
            }
        } catch (error) {
            p.reject(error);
            throw Exception.fromError(error);
        }

        return p;
    }
}

export class ModuleOptions {}
