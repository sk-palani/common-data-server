class TransactionMix {
    constructor(entries) {
        this.usedList   = entries;
        this.unusedList = [];
        this.swaped     = false;
    }

    _get() {
        if ((!this.swaped && this.usedList.length === 0) || (this.swaped && this.unusedList.length === 0)) {
            this.swaped = !this.swaped;
        }
        if (!this.swaped) {
            const index = Math.floor(Math.random() * this.usedList.length);
            let item    = this.usedList[index];
            this.usedList.splice(index, 1); // Remove the item from the array
            this.unusedList.push(item);
            return item;
        } else {
            const index = Math.floor(Math.random() * this.unusedList.length);
            let item    = this.unusedList[index];
            this.unusedList.splice(index, 1); // Remove the item from the array
            this.usedList.push(item);
            return item;
        }
    }

    setId(id) {
        this.id = id;
    }

    get(size) {
        const chuckSize = size ? size : 1;
        const results   = [];
        for (let i = 0; i < chuckSize; i++) {
            results.push(this._get());
        }
        return results;
    }

    stats() {
        const result = {
            usedList  : usedList.length,
            unusedList: unusedList.length
        };
        return `${JSON.stringify(result)}`;
    }
}

module.exports = TransactionMix;