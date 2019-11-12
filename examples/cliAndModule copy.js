"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require('./_global');
class Program {
    static main(arg1, arg2) {
        console.time('main');
        let result;
        try {
            result = `arg1=${arg1}, arg2=${arg2}`;
        }
        finally {
            console.timeEnd('main');
            return result;
        }
    }
}
exports.Program = Program;
if (libx.node.isCalledDirectly()) {
    libx.node.onExit(() => {
        libx.log.i('Shutting down...');
    });
    (() => __awaiter(this, void 0, void 0, function* () {
        let result = yield Program.main(libx.node.args._[0], libx.node.args.param);
        console.log('result: ', result);
        process.exit(0);
    }))();
}
//# sourceMappingURL=cliAndModule copy.js.map