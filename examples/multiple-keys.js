var assert = require("assert")

// var ExpiryModel = require("scuttlebutt/model")
var ExpiryModel = require("..")

var model1 = ExpiryModel()
var model2 = ExpiryModel()

model1.set("1", 1)
model1.set("2", 2)
model1.set("3", 3)
model1.set("foo", { foo: "one" })
model2.set("foo", { bar: "two" })

var s1 = model1.createStream()
s1.pipe(model2.createStream()).pipe(s1)

process.nextTick(function () {
    var keys = Object.keys(model2.toJSON())

    var foo = model1.get("foo")
    var foo2 = model2.get("foo")

    assert.deepEqual(foo, foo2)
    assert.deepEqual(foo, {
        foo: "one"
        , bar: "two"
    })
    console.log("foo", foo)

    assert.deepEqual(keys, ["1", "2", "3", "foo"])
    console.log("keys", keys)
})
