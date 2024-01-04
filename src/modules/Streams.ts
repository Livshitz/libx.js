// import { TransformStream } from '@cloudflare/workers-types';
// import { TransformStream } from 'web-streams-polyfill';
import Exception from '../helpers/Exceptions';
import { helpers } from '../helpers';

export interface IStreamOptions {
    headers?: any;
    body?: any;
    onProgress?: (wholeData) => void;
    method: 'POST' | 'GET' | 'Update';
    encoding?: string;
    useEventBuffering?: boolean;
}

const defaultStreamOptions: IStreamOptions = {
    headers: {},
    onProgress: null,
    method: 'GET',
    encoding: 'utf-8',
    body: null,
    useEventBuffering: false,
};

export class Streams {
    public constructor(public options?: Partial<ModuleOptions>) {
        this.options = { ...new ModuleOptions(), ...options };
    }

    public static async pipeReaderToWriter(reader, writer) {
        const encoder = new TextEncoder();
        for (; ;) {
            const { value, done } = await reader.read();
            const encoded = encoder.encode(value);
            await writer.write(encoded);
            if (done) {
                break;
            }
        }
        writer.close();

        // for (const stream of reader) {
        //     await stream.pipeTo(writer, {
        //       preventClose: true
        //     })
        // }
        // writer.close()
    }

    public static async readStreamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
        const reader = stream.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            chunks.push(value);
        }

        // Concatenate the chunks and decode them into a string using TextDecoder
        const concatenatedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;

        for (const chunk of chunks) {
            concatenatedChunks.set(chunk, offset);
            offset += chunk.length;
        }

        const text = new TextDecoder().decode(concatenatedChunks);
        return text;
    }

    public static async asyncIterableToStream<T = any>(asyncList: Promise<AsyncIterable<T>>, callback?: (data: T) => string, onDone?: (data: T) => void) {
        if (typeof TransformStream == 'undefined') {
            global.TransformStream = require('web-streams-polyfill').TransformStream;
        }
        let { readable, writable } = new TransformStream();

        let writer = writable.getWriter();
        const textEncoder = new TextEncoder();
        let buffer = '';
        asyncList
            .then(async (itr) => {
                try {
                    for await (const part of itr) {
                        let msg = callback ? callback(part) || '' : part.toString();
                        buffer += msg;
                        writer.write(textEncoder.encode(msg));
                    }
                } catch (err) {
                    writer.write(textEncoder.encode('Error while iterating: ' + err));
                }
            })
            .catch((err) => {
                writer.write(textEncoder.encode('Error in completion: ' + err));
            })
            .finally(async () => {
                writer.close();
                // const x = await readable.getReader().read();
                // console.log('------ done', x)
                if (onDone) onDone(buffer as unknown as T);
            });

        return readable;
    }

    public static async getStream(url: string, onDelta?: (data) => void, options: Partial<IStreamOptions> = defaultStreamOptions) {
        const p = helpers.newPromise();
        (async () => {
            try {
                if (options.body != null) {
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
                    body: JSON.stringify(options.body),
                    method: options.method,
                });

                if (!response.ok) {
                    return p.reject(new Exception(`getStream: HTTP error! Status: ${response.status}`, await response.text()));
                }

                let buffer = '';
                const textDecoder = new TextDecoder(options.encoding ?? defaultStreamOptions.encoding);

                const reader = response.body.getReader();
                let eventsBuffer = '';
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        if (options.useEventBuffering) {
                            onDelta?.(eventsBuffer);
                        }
                        p.resolve(buffer);
                        break;
                    }

                    const decodedString = textDecoder.decode(value);
                    if (options.useEventBuffering && !(decodedString.startsWith('event: ') && eventsBuffer.length > 0)) {
                        eventsBuffer += decodedString;
                        continue;
                    }

                    if (options.useEventBuffering) {
                        onDelta?.(eventsBuffer);
                    } else {
                        onDelta?.(decodedString);
                    }

                    buffer += decodedString;
                    options.onProgress?.(buffer);
                    eventsBuffer = decodedString;
                }
            } catch (error) {
                p.reject(Exception.fromError(error));
                // throw Exception.fromError(error);
            }
        })();

        return p;
    }
}

export class ModuleOptions { }
