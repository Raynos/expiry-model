var Scuttlebutt = require("scuttlebutt")
    , filter = Scuttlebutt.filter
    , inherits = require("util").inherits

    , DAY = 1000 * 60 * 60 * 24

inherits(ExpiryModel, Scuttlebutt)

var proto = ExpiryModel.prototype

proto.set = set
proto.get = get
proto.applyUpdate = applyUpdate
proto.history = history
proto.toJSON = toJSON

module.exports = ExpiryModel

function ExpiryModel(options) {
    if (! (this instanceof ExpiryModel) ) {
        return new ExpiryModel(options)
    }

    Scuttlebutt.call(this, options)

    this._store = {}
    this.expiry = (options && options.expiry) || DAY
}

function set(key, value) {
    if (value && !value._heartbeat) {
        value._heartbeat = Date.now()
    }

    this.localUpdate(key, value)
}

function get(key) {
    var store = this._store
        , record = store[key]

    if (record) {
        return record[1]
    }
}

function applyUpdate(update) {
    var key = update[0]
        , store = this._store
        , expiry = this.expiry
        , existing = store[key]
        , current = existing && existing[2]
        , ts = update[2]

    if (current > ts || ts < Date.now() - expiry) {
        return false
    }

    if (update[1] === null) {
        delete store[key]
    } else {
        store[key] = update
    }

    this.emit("update", update[0], update[1], ts, update[3])
    return true
}

function history(sources) {
    var self = this
        , store = self._store
        , expiry = self.expiry
        , now = Date.now()

    return Object.keys(store).reduce(function (history, key) {
        var record = store[key]
            , ts = record[2]

        if (ts > now - expiry) {
            if (filter(record, sources)) {
                history.push(record)
            }
        } else {
            delete store[key]
        }

        return history
    }, [])
}

function toJSON() {
    var store = this._store

    return Object.keys(store).reduce(function (out, key) {
        out[key] = store[key][1]
        return out
    }, {})
}
