# expiry-model

A scuttlebutt model that expires keys

## Example

```js
var ExpiryModel = require("expiry-model")

var m1 = ExpiryModel()
    , m2 = ExpiryModel()
    , assert = require("assert")
    , s1 = m1.createStream()
    , s2 = m2.createStream()

s1.pipe(s2).pipe(s1)

m1.on("update", function (key, value) {
    assert.equal(key, "foo")
    assert.equal(value, "bar")
    console.log("done")
})

m2.set("foo", "bar")
```

## Installation

`npm install expiry-model`

## Contributors

 - Raynos

## MIT Licenced
