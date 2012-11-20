var ExpiryModel = require("..")

var m1 = ExpiryModel()
    , m2 = ExpiryModel()
    , assert = require("assert")

var stream = m1.createStream()
stream.pipe(m2.createStream()).pipe(stream)

m1.on("update", function (key, value) {
    assert.equal(key, "foo")
    assert.equal(value, "bar")
    console.log("done")
})

m2.set("foo", "bar")
