const shortid = require('short-id');
shortid.configure({
    length: 8,          // The length of the id strings to generate
    algorithm: 'sha1',  // The hashing algoritm to use in generating keys
    salt: Math.random   // A salt value or function
});

class Pairs {

    default_config = {
        "parent": "parent",
        "child": "child",
        "suffix": 5,
        "max": 10
    }

    // parent00001 : child00001.00001
    // parent00001 : child00002.00001
    // parent00001 : ..
    // parent00001 : child00010.00001
    // parent00002 : child00001.00002

    constructor(id, config) {
        if (Object.keys(config).length === 0) {
            this.config = {
                "child": this.default_config
            }
        } else {
            this.config = config;
        }

        this.id = id;
        this.childcounter = 0
        this.parentcounter = 1
    }

    _get() {
        if (this.childcounter++ === this.config.max) {
            this.childcounter = 1;
            this.parentcounter++;
        }
        const childSuffix = String(this.childcounter).padStart(this.config.padding, '0'); // '0009'
        const parentSuffix = String(this.parentcounter).padStart(this.config.padding, '0'); // '0009'

        let response = {
            id: shortid.generate(),
            name: this.id,
            data: {
                value: `${this.config.parent}:${this.id}_${parentSuffix}`,
                field1: `${this.config.parent}:${this.id}_${parentSuffix}`,
                field2: `${this.config.name}`,
                field3: `${this.config.child}:${this.id}_${childSuffix}`
            },
        };
        return response

    }

    get(size) {
        const chuckSize = size ? size : 1;
        const results = [];
        for (let i = 0; i < chuckSize; i++) {
            results.push(this._get());
        }
        return results;
    }
}

module.exports = Pairs;