var assert = require("assert")
var setTimeout = require("timers").setTimeout

var ExpiryModel = require("..")

var model = ExpiryModel({
    maxAge: 5
})

model.set("key", "volatile")

setTimeout(function () {
    var value = model.get("key")
    assert.equal(value, null)
    console.log("value", value)
}, 10)
