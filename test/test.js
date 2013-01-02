var test = require("tape")
var setTimeout = require("timers").setTimeout

var ExpiryModel = require("../index")

test("expiryModel is a function", function (assert) {
    assert.equal(typeof ExpiryModel, "function")
    assert.end()
})

test("expiryModel returns a model", function (assert) {
    var model = ExpiryModel()

    assert.ok(model.get)
    assert.ok(model.set)
    assert.ok(model.on)
    assert.ok(model.applyUpdate)
    assert.ok(model.toJSON)
    assert.end()
})

test("expiryModel can set and get values", function (assert) {
    var model = ExpiryModel()

    model.set("foo", { u: "bar" })
    var value = model.get("foo")

    assert.equal(value.u, "bar")
    assert.end()
})

test("can set non objects", function (assert) {
    var model = ExpiryModel()

    model.set("foo", "bar")
    model.set("foo", "baz")
    model.set("foo", { v: "bar" })
    model.set("foo", "baz")

    assert.equal(model.get("foo"), "baz")
    assert.end()
})

test("expiryModel doesn't fully overwrite data", function (assert) {
    var model = ExpiryModel()

    model.set("foo", { u: "bar" })
    model.set("foo", { v: "baz" })

    var value = model.get("foo")

    assert.deepEqual(value, { u: "bar", v: "baz" })
    assert.end()
})

test("returns null for non-existant keys", function (assert) {
    var model = ExpiryModel()

    var value = model.get("foo")

    assert.equal(value, null)
    assert.end()
})

test("can store multiple keys", function (assert) {
    var model = ExpiryModel()

    model.set("foo", { u: "bar" })
    model.set("baz", { v: "v" })

    assert.equal(model.get("foo").u, "bar")
    assert.equal(model.get("baz").v, "v")
    assert.end()
})

test("emits updates", function (assert) {
    var model = ExpiryModel()
    var now = Date.now()

    model.on("update", function (key, value, ts, source) {
        assert.equal(key, "foo")
        assert.deepEqual(value, { u: "bar" })
        assert.ok(ts >= now && ts < now + 10)
        assert.equal(source, model.id)
        assert.end()
    })

    model.set("foo", { u: "bar" })
})

test("toJSON returns hash", function (assert) {
    var model = ExpiryModel()

    model.set("foo", { v: "foo" })
    model.set("bar", { v: "bar" })
    var v = model.toJSON()
    assert.deepEqual(v, {
        "foo": { v: "foo" }
        , "bar": { v: "bar" }
    })
    assert.end()
})

test("setting values to null clears them", function (assert) {
    var model = ExpiryModel()

    model.set("foo", { u: "bar" })
    var v1 = model.toJSON()
    model.set("foo", null)
    var v2 = model.toJSON()
    assert.deepEqual(v1, { foo: { u: "bar" } })
    assert.deepEqual(v2, {})
    assert.end()
})

test("applying older updates gets ignored", function (assert) {
    var model = ExpiryModel()
    var now = Date.now()

    model.applyUpdate([["foo", { u: "bar" }], now])
    model.applyUpdate([["foo", { u: "baz" }], now - 1000])

    var v = model.get("foo")
    assert.equal(v.u, "bar")
    assert.end()
})

test("applying old expired updates get ignored", function (assert) {
    var model = ExpiryModel()
    var now = Date.now()

    model.applyUpdate([["k", { v: "v" }], now - 24 * 60 * 60 * 1000])

    var v = model.toJSON()
    assert.deepEqual(v, {})
    assert.end()
})

test("setting a value to null in the past", function (assert) {
    var model = ExpiryModel()
    var now = Date.now()

    model.applyUpdate([["k", "v"], now])
    model.applyUpdate([["k", null], now - 10])

    var v = model.toJSON()
    assert.deepEqual(v, { k: "v" })

    model.applyUpdate([["k2", { v: "v" }], now])
    model.applyUpdate([["k2", null], now - 10])

    var v = model.get("k2")
    assert.deepEqual(v, { v: "v" })
    assert.end()
})

test("pushing too much data into the model", function (assert) {
    var key = "foobar"
    var model = ExpiryModel()

    for (var i = 0; i < 510; i++) {
        model.set(key + i, { i: i })
    }

    var v = model.get("foobar1")
    assert.equal(v, null)
    assert.equal(Object.keys(model.toJSON()).length, 500)
    assert.end()
})

test("history returns list of updates", function (assert) {
    var now = Date.now()
    var model = ExpiryModel()

    model.set("foo", { v: "v" })
    var h = model.history()
    var record = h[0]

    assert.equal(h.length, 1)
    assert.equal(record[0][0], "foo")
    assert.equal(record[0][1].v, "v")
    assert.equal(record[2], model.id)
    assert.ok(record[1] >= now && record[1] <= now + 5)
    assert.end()
})

test("history returns empty if seen more recent", function (assert) {
    var now = Date.now()
    var model = ExpiryModel()
    var sources = {}

    sources[model.id] = now + 100

    model.set("foo", { v: "v" })
    var h = model.history(sources)
    assert.equal(h.length, 0)
    assert.end()
})

test("history returns empty if update too old", function (assert) {
    var now = Date.now()
    var model = ExpiryModel()
    var ts = now - (24 * 60 * 60 * 1000) + 2

    model.applyUpdate([["foo", { v: "v" }], ts, model.id])

    assert.equal(model.get("foo").v, "v")
    setTimeout(function () {
        var h = model.history()
        assert.equal(h.length, 0)
        var v = model.toJSON()
        assert.equal(Object.keys(v).length, 0)

        assert.end()
    }, 10)
})
