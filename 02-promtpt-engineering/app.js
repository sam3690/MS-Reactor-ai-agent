"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var _a, e_1, _b, _c;
var _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
var node_process_1 = require("node:process");
var openai_1 = require("openai");
var prompt = "Assistant helps the user with questions\n\n# Question\nWhat shoes should I use for running?\n";
var openai = new openai_1.AzureOpenAI();
var chunks = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4.0",
    stream: true,
});
try {
    for (var _g = true, chunks_1 = __asyncValues(chunks), chunks_1_1; chunks_1_1 = await chunks_1.next(), _a = chunks_1_1.done, !_a; _g = true) {
        _c = chunks_1_1.value;
        _g = false;
        var chunk = _c;
        node_process_1.default.stdout.write((_f = (_e = (_d = chunk.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content) !== null && _f !== void 0 ? _f : "");
    }
}
catch (e_1_1) { e_1 = { error: e_1_1 }; }
finally {
    try {
        if (!_g && !_a && (_b = chunks_1.return)) await _b.call(chunks_1);
    }
    finally { if (e_1) throw e_1.error; }
}
