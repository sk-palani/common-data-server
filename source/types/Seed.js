const shortid = require('short-id');
shortid.configure({
    length   : 8,          // The length of the id strings to generate
    algorithm: 'sha1',  // The hashing algoritm to use in generating keys
    salt     : Math.random   // A salt value or function
});

class Seed {

    default_config = {
        "prefix"     : "value",
        "name_prefix": "value",
        "suffix"     : 5
    }


    // parent00001 : child00001.00001
    // parent00001 : child00002.00001
    // parent00001 : ..
    // parent00001 : child00010.00001
    // parent00002 : child00001.00002

    constructor(id, config) {
        if (Object.keys(config).length === 0) {
            this.config = {
                "prefix": this.default_config
            }
        } else {
            this.config = config;
        }

        this.id           = id;
        this.childcounter = 0
    }

    _get() {
        this.childcounter++;
        const childSuffix = String(this.childcounter).padStart(this.config.padding, '0'); // '0009'
        const unique_id   = shortid.generate();

        let response = {
            id  : unique_id,
            name: this.id,
            data: {
                value : `${this.config.prefix}:${unique_id}_${childSuffix}`,
                field1: `${unique_id}_${childSuffix}`,
                field2: `${this.config.name_prefix}_${unique_id}`,
                field3: `${this.config.prefix}:${unique_id}_${childSuffix}`
            },
        };
        return response

    }

    get(size) {
        const chuckSize = size ? size : 1;
        const results   = [];
        for (let i = 0; i < chuckSize; i++) {
            results.push(this._get());
        }
        return results;
    }
}

module.exports = Seed;