# expiry-model

A scuttlebutt model that expires keys

## Example

```js
var ExpiryModel = require("expiry-model")

var m1 = ExpiryModel()
    , m2 = ExpiryModel()
    , assert = require("assert")

m1.pipe(m2.createStream()).pipe(m1)

m1.on("update", function (key, value) {
    assert.equal(key, "foo")
    assert.equal(value, "bar")c
    console.log("done")
})

m2.set("foo", "bar")
```

## Installation

`npm install expiry-model`

## Contributors

 - Raynos

## MIT Licenced
