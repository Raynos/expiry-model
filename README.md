# expiry-model

A scuttlebutt model that expires keys

## Example

```js
var assert = require("assert")

var ExpiryModel = require("expiry-model")

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
```

## Sync up multiple keys

```js
var assert = require("assert")

var ExpiryModel = require("expiry-model")

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

```

## Expire keys

```js
var assert = require("assert")
var setTimeout = require("timers").setTimeout

var ExpiryModel = require("expiry-model")

var model = ExpiryModel({
    maxAge: 5
})

model.set("key", "volatile")

setTimeout(function () {
    var value = model.get("key")
    assert.equal(value, null)
    console.log("value", value)
}, 10)
```

## Docs

ExpiryModel is like [scuttlebutt/model][2] except you can

 - configure how long to hold keys in memory before they
    expire.
 - configure when to clean up old data
 - configure a cap on how much data to hold in memory
 - values set are shallow merged into each other

### `ExpiryModel(options)`

Valid options are `maxAge` and `max` and anything else you can
    pass to [lru-cache][1].

If you set `maxAge` to be low then the expiry model will only
    hold keys in memory for that long and it will drop them
    afterwards, including not passing them onto anyone it
    replicates to.

`maxAge` defaults to one day and `max` defaults to 500.

## Installation

`npm install expiry-model`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://github.com/isaacs/node-lru-cache
  [2]: https://github.com/dominictarr/scuttlebutt#scuttlebuttmodel
