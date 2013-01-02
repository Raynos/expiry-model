var assert = require("assert")

var ExpiryModel = require("..")

var model1 = ExpiryModel()
var model2 = ExpiryModel()

var s1 = model1.createStream()
s1.pipe(model2.createStream()).pipe(s1)

model1.set("foo", "bar")

process.nextTick(function () {
    var v = model2.get("foo")
    assert.equal(v, "bar")

    model1.dispose()

    model2.set("foo", null)
    var v = model2.get("foo")

    assert.equal(v, null)

    process.nextTick(function () {
        var sources = Object.keys(model2.sources)
        assert.equal(sources.length, 1)
        assert.equal(sources[0], model2.id)

        console.error("sources", model2.sources)
    })
})
