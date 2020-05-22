"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _prompt = require('prompt');
const concurrency_libx_js_1 = require("concurrency.libx.js");
const mod = {};
mod.confirm = (question, pattern = 'yes|no|y|n', defaultAnswer = 'no') => __awaiter(void 0, void 0, void 0, function* () {
    let p = concurrency_libx_js_1.Deferred.new();
    _prompt.start();
    _prompt.message = '';
    _prompt.delimiter = '';
    _prompt.colors = false;
    _prompt.get({
        properties: {
            confirm: {
                pattern: new RegExp(`^(${pattern})$`, 'gi'),
                description: question + ` [${pattern}]`,
                message: 'Type ' + pattern,
                required: true,
                default: defaultAnswer
            }
        }
    }, function (err, result) {
        if (err)
            return p.reject(err);
        var c = result.confirm.toLowerCase();
        if (c != 'y' && c != 'yes') {
            p.resolve(false);
            return;
        }
        p.resolve(true);
    });
    return p;
});
exports.default = mod;
//# sourceMappingURL=prompts.js.map