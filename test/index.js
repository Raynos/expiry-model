Function.prototype.bind = Function.prototype.bind || bind

require("./test")
require("./stream")

function bind(context) {
    var f = this
    return function () {
        f.apply(context, arguments)
    }
}
