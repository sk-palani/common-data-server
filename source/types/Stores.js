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
                const itemID = shortid.generate();
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
}

module.exports = Stores;