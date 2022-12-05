const NodeCache = require("node-cache");
const shortid   = require('short-id');
shortid.configure({
    length   : 8,          // The length of the id strings to generate
    algorithm: 'sha1',  // The hashing algoritm to use in generating keys
    salt     : Math.random   // A salt value or function
});


class Stores {
    default_config = {
        "evict": true
    }

    // parent00001 : child00001.00001
    // parent00001 : child00002.00001
    // parent00001 : ..
    // parent00001 : child00010.00001
    // parent00002 : child00001.00002

    constructor(id, config) {
        if (Object.keys(config).length === 0) {
            this.config = {
                "evict": true
            }
        } else {
            this.config = config;
        }

        this.id          = id;
        this.itemcounter = 0;

        this.storage       = new NodeCache({useClones: false});
        this.lockedstorage = new NodeCache({useClones: false});

        this.items = require('fifo')();
    }

    _get() {
        if (!this.items.isEmpty()) {
            if (this.config.evict === true) {
                const item = this.items.shift();
                if (item && this.storage.has(item)) {
                    return {
                        id  : item,
                        name: this.config.name,
                        data: this.storage.take(item),
                    };
                }
            } else {
                const first_node = this.items.node;
                const item       = first_node.value;
                if (item && this.storage.has(item)) {
                    this.items.bump(first_node);
                    return {
                        id  : item,
                        name: this.config.name,
                        data: this.storage.get(item),
                    };
                }
            }
        }
    }


    setId(id) {
        this.id = id;
    }

    get(size) {
        const chuckSize = size ? size : 1;
        const results   = [];
        for (let i = 0; i < chuckSize; i++) {
            const chuck = this._get()
            if (chuck)
                results.push(chuck);
        }
        return results;
    }

    put(chucks) {
        const results = [];
        if (Array.isArray(chucks)) {
            for (let i = 0; i < chucks.length; i++) {
                this.itemcounter++;
                const itemID = (chucks[i].hasOwnProperty('itemID')) ? chucks[i]['itemID'] : shortid.generate();
                this.items.push(itemID);
                this.storage.set(itemID, chucks[i]);
                results.push({
                    id  : itemID,
                    name: this.config.name,
                    data: chucks[i],
                });
            }
        }
        return results;
    }

    check(chucks) {
        const results = [];
        if (Array.isArray(chucks)) {
            for (const singleChunk of chucks) {
                const itemID = (singleChunk.hasOwnProperty('itemID')) ? singleChunk['itemID'] : 'Unknown';
                const value  = (singleChunk.hasOwnProperty('value')) ? singleChunk['value'] : '';
                const found  = !!this.storage.has(itemID);
                delete singleChunk.itemID;
                results.push({
                    itemID: itemID,
                    found : found,
                    data  : singleChunk
                });
            }
        }
        return results;
    }

    popId(chucks) {
        const results = [];
        if (Array.isArray(chucks)) {
            for (const singleChunk of chucks) {
                const itemID = (singleChunk.hasOwnProperty('itemID')) ? singleChunk['itemID'] : 'Unknown';
                const value  = (singleChunk.hasOwnProperty('value')) ? singleChunk['value'] : '';
                const found  = !!this.storage.has(itemID);
                delete singleChunk.itemID;
                results.push({
                    itemID: itemID,
                    found : found,
                    data  : this.storage.take(itemID)
                });
            }
        }
        return results;
    }

    reset() {
        let stats        = this.storage.getStats();
        const result     = String(stats.hasOwnProperty('keys') ? stats.keys : 0);
        this.itemcounter = 0;
        this.storage.flushAll();
        this.lockedstorage.flushAll();
        this.items.clear();
        return `Cleared ${result} Items`;
    }

    stats() {
        let stats    = this.storage.getStats();
        const result = String(stats.hasOwnProperty('keys') ? stats.keys : 0);
        return `${result} Items`;
    }
}

module.exports = Stores;