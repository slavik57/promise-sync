"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PromiseState;
(function (PromiseState) {
    PromiseState[PromiseState["Pending"] = 0] = "Pending";
    PromiseState[PromiseState["Fulfilled"] = 1] = "Fulfilled";
    PromiseState[PromiseState["Rejected"] = 2] = "Rejected";
})(PromiseState = exports.PromiseState || (exports.PromiseState = {}));
