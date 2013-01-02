var assert = require("assert")
var Stream = require("read-write-stream")
var setTimeout = require("timers").setTimeout

var ExpiryModel = require("..")

var echo = Stream().stream

var model1 = ExpiryModel()
var model2 = ExpiryModel()
var model3 = ExpiryModel()
var model4 = ExpiryModel()

model1.set("1", "1")
model2.set("2", "2")
model3.set("3", "3")
model4.set("4", "4")

echo.pipe(model1.createStream()).pipe(echo)
echo.pipe(model2.createStream()).pipe(echo)
echo.pipe(model3.createStream()).pipe(echo)
echo.pipe(model4.createStream()).pipe(echo)

setTimeout(function () {
    var correct = { 1: "1", 2: "2", 3: "3", 4: "4" }

    assert.deepEqual(model1.toJSON(), correct)
    assert.deepEqual(model2.toJSON(), correct)
    assert.deepEqual(model3.toJSON(), correct)
    assert.deepEqual(model4.toJSON(), correct)

    console.error("state", model1.toJSON())
}, 50)
