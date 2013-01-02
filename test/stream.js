var test = require("tape")
var setTimeout = require("timers").setTimeout

var ExpiryModel = require("../index")

var DAY = 1000 * 60 * 60 * 24

test("can stream two models together", function (assert) {
    var model1 = ExpiryModel()
    var model2 = ExpiryModel()
    var s1 = model1.createStream()

    s1.pipe(model2.createStream()).pipe(s1)

    process.nextTick(function () {
        model1.set("foo", "v")
        assert.equal(model1.get("foo"), "v")
        assert.equal(model2.get("foo"), "v")
        assert.end()
    })
})

test("can merge partial updates", function (assert) {
    var model1 = ExpiryModel()
    var model2 = ExpiryModel()

    model1.set("foo", { 1: "bar" })
    model2.set("foo", { 2: "baz" })

    var s1 = model1.createStream()
    s1.pipe(model2.createStream()).pipe(s1)

    process.nextTick(function () {
        assert.deepEqual(model1.get("foo"), {
            1: "bar"
            , 2: "baz"
        })
        assert.deepEqual(model2.get("foo"), {
            1: "bar"
            , 2: "baz"
        })

        assert.end()
    })
})

test("outdated keys do not propagate", function (assert) {
    var model1 = ExpiryModel()
    var now = Date.now()

    model1.applyUpdate([["k", "v"], now - DAY + 10, model1.id])

    var model2 = ExpiryModel()

    setTimeout(function () {
        var s1 = model1.createStream()
        s1.pipe(model2.createStream()).pipe(s1)

        process.nextTick(function () {
            var state1 = model1.toJSON()
            var state2 = model2.toJSON()

            assert.equal(Object.keys(state1).length, 0)
            assert.equal(Object.keys(state2).length, 0)
            assert.end()
        })
    }, 15)
})

test("exchange multiple keys", function (assert) {
    var model1 = ExpiryModel()
    var model2 = ExpiryModel()

    model1.set("1", 1)
    model1.set("2", 2)
    model1.set("3", 3)

    var s1 = model1.createStream()
    s1.pipe(model2.createStream()).pipe(s1)

    process.nextTick(function () {
        var keys = Object.keys(model2.toJSON())

        assert.deepEqual(keys.sort(), ["1", "2", "3"])
        assert.end()
    })
})

test("many keys", function (assert) {
    var model1 = ExpiryModel()
    var model2 = ExpiryModel()

    for (var i = 0; i < 300; i++) {
        model1.set("model1-" + i, i)
        model2.set("model2-" + i, i)
    }

    var s1 = model1.createStream()
    s1.pipe(model2.createStream()).pipe(s1)

    setTimeout(function () {
        var v1_1_1 = model1.get("model1-1")
        var v1_1_99 = model1.get("model1-99")
        var v1_1_101 = model1.get("model1-101")
        var v1_2_299 = model1.get("model2-299")
        var v1_2_298 = model1.get("model2-298")

        var keys1 = Object.keys(model1.toJSON())

        assert.equal(v1_1_1, null)
        assert.equal(v1_1_99, null)
        assert.equal(v1_1_101, 101)
        assert.equal(v1_2_299, 299)
        assert.equal(v1_2_298, 298)
        assert.equal(keys1.length, 500)

        var v2_2_1 = model2.get("model2-1")
        var v2_2_99 = model2.get("model2-99")
        var v2_2_101 = model2.get("model2-101")
        var v2_1_299 = model2.get("model1-299")
        var v2_1_298 = model2.get("model1-298")

        var keys2 = Object.keys(model2.toJSON())

        assert.equal(v2_2_1, null)
        assert.equal(v2_2_99, null)
        assert.equal(v2_2_101, 101)
        assert.equal(v2_1_299, 299)
        assert.equal(v2_1_298, 298)
        assert.equal(keys2.length, 500)

        assert.end()
    }, 100)
})
