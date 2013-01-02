var Scuttlebutt = require("scuttlebutt")
var extend = require("xtend")
var LRU = require("lru-cache")
var filter = Scuttlebutt.filter

var DAY = 1000 * 60 * 60 * 24
var defaults = {
    max: 500
    , maxAge: DAY
}

module.exports = ExpiryModel

function ExpiryModel(options) {
    options = extend({}, defaults, options || {})

    var scuttle = Scuttlebutt()
    var maxAge = options.maxAge
    var store = LRU(options)

    scuttle.set = set
    scuttle.get = get
    scuttle.applyUpdate = applyUpdate
    scuttle.toJSON = toJSON
    scuttle.history = history

    return scuttle

    function set(key, value) {
        scuttle.localUpdate([key, value])
    }

    function get(key) {
        var record = store.get(key)

        return record ? record[0][1] : null
    }

    function getMergedRecord(update) {
        var transaction = update[0]
        var key = transaction[0]
        var current = store.get(key)

        if (!current) {
            return update.slice()
        }

        var currentValue = current[0][1]
        var currentTs = current[1]
        var value = transaction[1]
        var ts = update[1]

        if (typeof currentValue === "object" &&
            typeof value === "object" && value !== null
        ) {
            if (currentTs > ts) {
                value = extend({}, value, currentValue)
            } else {
                value = extend({}, currentValue, value)
            }
        } else if (currentTs > ts) {
            return false
        }

        return [[key, value], ts, update[2]]
    }

    function applyUpdate(update) {
        var ts = update[1]
        var key = update[0][0]

        if (ts <= Date.now() - maxAge) {
            return false
        }

        var record = getMergedRecord(update)

        if (record === false) {
            return false
        } else if (record[0][1] === null) {
            store.del(key)
        } else {
            store.set(key, record)
        }

        scuttle.emit("update", record[0][0], record[0][1]
            , record[1], record[2])

        return true
    }

    function toJSON() {
        var hash = {}

        store.forEach(function (record, key) {
            hash[key] = record[0][1]
        })

        return hash
    }

    function history(sources) {
        sources = sources || {}
        var list = []
        var now = Date.now()

        store.forEach(function (record, key) {
            var ts = record[1]

            if (ts > now - maxAge) {
                if (filter(record, sources)) {
                    list.push(record)
                }
            } else {
                store.del(key)
            }
        })

        return list.sort(function (a, b) {
            if (a[2] !== b[2]) {
                return 0
            }

            return a[1] < b[1] ? -1 : 1
        })
    }
}
