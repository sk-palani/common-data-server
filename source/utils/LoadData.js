const chalk         = require('chalk');
const path          = require('path');
const Fs            = require('fs');
const csv           = require('csv-parser');
const ShortUniqueId = require('short-unique-id');

const TransactionMix = require('../types/TransactionMix');
const RandomList     = require('../types/RandomList');
const SequenceList   = require('../types/SequenceList');
const Pairs          = require('../types/Pairs');
const Stores         = require('../types/Stores');

const uid = new ShortUniqueId();

const log = {
    info: function (info) {
        console.log('Info: ' + chalk.green(JSON.stringify(info)));
    },
    warning: function (warning) {
        console.log('Warning: ' + chalk.yellow(JSON.stringify(warning)));
    },
    error: function (error) {
        console.log('Error: ' + chalk.red(JSON.stringify(error)));
    },
    loadFolder: function (folder) {
        let dataStores = {};
        if (!Fs.existsSync(folder)) {
            Fs.mkdirSync(folder, 0744);
        }
        const files = Fs.readdirSync(folder);
        files.forEach(function (file) {
            if (file.endsWith('.mix.json')) {
                log.info('Loading... ' + file);
                let mixFile   = JSON.parse(Fs.readFileSync(path.join(folder + file), 'utf8'));
                const gcd     = Object.values(mixFile).reduce((accumulator, item) => {
                    if (!isNormalInteger(item)) return accumulator
                    const weight = Math.floor(Number(item));
                    if (accumulator === 0) return eclidsGCD(weight, weight)
                    else return eclidsGCD(accumulator, weight);
                }, 0);
                const entries = Object.entries(mixFile).filter(value => {
                    return isNormalInteger(value[1])
                }).flatMap((value, index) => {
                    const weightage = Math.floor(Math.floor(Number(value[1])) / gcd);
                    return Array.from({length: weightage})
                        .fill(
                            {
                                'id': index.toString(),
                                'name': value[0],
                                'data': {
                                    'value': Math.floor(Number(value[1]))
                                }
                            }
                        )
                });
                console.log(entries.length + ' Items')
                dataStores[file.replace('.json', '')] = new TransactionMix(entries);
            }
            if (file.endsWith('.csv')) {
                log.info('Loading... ' + file);
                const entries = []
                let row       = 0;
                Fs.createReadStream(path.join(folder + file))
                    .pipe(csv())
                    .on('data', (data) => {
                        const id   = data.hasOwnProperty('id') ? data.id : row++;
                        const name = data.hasOwnProperty('name') ? data.name : 'default';
                        delete data.id;
                        delete data.name;
                        const dataitem = data.hasOwnProperty('data') && Object.keys(data).length === 1 ? data.data : JSON.stringify(data);
                        delete data.data;
                        entries.push(
                            {
                                id: id,
                                name: name,
                                data: {
                                    'value': dataitem
                                }
                            }
                        )
                    })
                    .on('end', () => {
                        console.log(entries.length + ' Items')
                        if (file.endsWith('.random.csv')) {
                            dataStores[file.replace('.csv', '')] = new RandomList(entries);
                        } else {
                            dataStores[file.replace('.csv', '')] = new SequenceList(entries);
                        }
                    });
            }
            if (file.endsWith('.pairs.json')) {
                log.info('Loading... ' + file);
                const uidWithTimestamp = uid.stamp(32);
                console.log(uidWithTimestamp);

                let pairFile = JSON.parse(Fs.readFileSync(path.join(folder + file), 'utf8'));
                console.log(pairFile);

                dataStores[file.replace('.json', '')] = new Pairs(uidWithTimestamp, pairFile);
            }
            if (file.endsWith('.store.json')) {
                log.info('Loading... ' + file);
                const uidWithTimestamp = uid.stamp(32);
                console.log(uidWithTimestamp);
                let storesFile = JSON.parse(Fs.readFileSync(path.join(folder + file), 'utf8'));
                console.log(storesFile);
                dataStores[file.replace('.json', '')] = new Stores(uidWithTimestamp, storesFile);
            }
        });
        dataStores['default'] = new TransactionMix([{
            id: '0',
            name: '0',
            data: {
                'value': 'default'
            }
        }]);
        return dataStores;
    }
};

function isNormalInteger(str) {
    const n = Math.floor(Number(str));
    return n !== Infinity && String(n) == str && n >= 0;
}

function eclidsGCD(iNum1, iNum2) {
    if ((iNum1 === iNum2)) return iNum1;
    else if (iNum1 === 0) return iNum2;
    else if (iNum2 === 0) return iNum1;
    else if (iNum1 > iNum2)
        return eclidsGCD(iNum2, iNum1 % iNum2);
    else
        return eclidsGCD(iNum1, iNum2 % iNum1);
}

module.exports = log