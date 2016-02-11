"use strict";
(function (PromiseState) {
    PromiseState[PromiseState["Pending"] = 0] = "Pending";
    PromiseState[PromiseState["Fulfilled"] = 1] = "Fulfilled";
    PromiseState[PromiseState["Rejected"] = 2] = "Rejected";
})(exports.PromiseState || (exports.PromiseState = {}));
var PromiseState = exports.PromiseState;
