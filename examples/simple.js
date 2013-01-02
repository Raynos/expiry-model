var assert = require("assert")

var ExpiryModel = require("..")

var m1 = ExpiryModel()
var m2 = ExpiryModel()

var stream = m1.createStream()
stream.pipe(m2.createStream()).pipe(stream)

m1.on("update", function (key, value) {
    assert.equal(key, "foo")
    assert.equal(value, "bar")
    console.log("values", key, value)
})

m2.set("foo", "bar")
