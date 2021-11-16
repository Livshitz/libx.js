// import prompt from 'prompt';
import _prompt from 'prompt';
// import readline from 'readline';
import { Deferred } from 'concurrency.libx.js';

export class Prompts {
    public async waitForAnyKey(message = 'Press any key to exit', shouldExit = false) {
        const p = new Deferred();
        console.log(message);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', () => {
            // console.log('Prompts:waitForAnyKey: onData');
            p.resolve();
            if (shouldExit) process.exit(0);
        });
        return p;
    }

    public async readKey(callback?: (key: string) => Promise<boolean | void>, message = 'Press any key', outputKeys = true) {
        const p = new Deferred();
        const collected = [];
        console.log(message);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (key) => {
            if (key.toString() === '\u0003') {
                // process.exit();
                p.resolve(collected.join());
            }

            collected.push(key);
            if (callback != null) {
                callback(key.toString()).then((res) => {
                    if (res == false) p.resolve(collected.join());
                });
            }

            // write the key to stdout all normal like
            if (outputKeys) process.stdout.write(key);
        });
        return p;
    }

    public async confirm(question: string, pattern: string = 'yes|no|y|n', defaultAnswer: string = 'no') {
        // Example:
        // (async()=>{
        //     let res = await mod.confirm('Do you really want to format the filesystem and delete all file ?');
        //     console.log('result: ', res);
        // })();

        let p = Deferred.new();

        _prompt.start();
        _prompt.message = '';
        _prompt.delimiter = '';
        _prompt.colors = false;
        _prompt.get(
            {
                properties: {
                    // setup the dialog
                    confirm: {
                        // allow yes, no, y, n, YES, NO, Y, N as answer
                        pattern: new RegExp(`^(${pattern})$`, 'gi'), ///^(yes|no|y|n)$/gi,
                        description: question + ` [${pattern}]`,
                        message: 'Type ' + pattern,
                        required: true,
                        default: defaultAnswer,
                    },
                },
            },
            function (err, result) {
                if (err) return p.resolve(err);

                var c = result.confirm.toLowerCase();
                if (c != 'y' && c != 'yes') {
                    p.resolve(false);
                    return;
                }

                p.resolve(true);
            }
        );

        return p;
    }
}
