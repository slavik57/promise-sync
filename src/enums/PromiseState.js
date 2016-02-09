"use strict";
(function (PromiseState) {
    PromiseState[PromiseState["Pending"] = 0] = "Pending";
    PromiseState[PromiseState["Resolved"] = 1] = "Resolved";
    PromiseState[PromiseState["Rejected"] = 2] = "Rejected";
})(exports.PromiseState || (exports.PromiseState = {}));
var PromiseState = exports.PromiseState;
