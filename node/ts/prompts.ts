// import prompt from 'prompt';
const _prompt = require('prompt');
import { Deferred } from 'concurrency.libx.js';

const mod: any = {};

mod.confirm = async (
    question: string, 
    pattern: string = 'yes|no|y|n', 
    defaultAnswer: string = 'no'): Promise<Boolean> => 
    {
    
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
    _prompt.get({
        properties: {
            // setup the dialog
            confirm: {
                // allow yes, no, y, n, YES, NO, Y, N as answer
                pattern: new RegExp(`^(${pattern})$`, 'gi'), ///^(yes|no|y|n)$/gi,
                description: question + ` [${pattern}]`,
                message: 'Type ' + pattern,
                required: true,
                default: defaultAnswer
            }
        }
    }, function (err, result){
        if (err) return p.reject(err);

        var c = result.confirm.toLowerCase();
        if (c!='y' && c!='yes'){
            p.resolve(false);
            return;
        }
        
        p.resolve(true);
    });

    return p;
}

export default mod;