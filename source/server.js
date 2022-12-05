const logger      = require('./utils/LoadData')
const grpc        = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefElement = protoLoader.loadSync("./protos/element.proto", {});
const elementProto      = grpc.loadPackageDefinition(packageDefElement);
const elementPackage    = elementProto.element;

const path        = require('path');
const dataDirPath = path.join(path.resolve("./"), './data/');
const dataStores  = logger.loadFolder(dataDirPath);
var port = process.env.PORT || 5000;

const server = new grpc.Server();
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),error => {
    server.addService(elementPackage.DataService.service, {
        setGlobalId: (_, callback) => {
            const globalID = _.request.hasOwnProperty("globalID") ? _.request.globalID : "default";
            const response = [];

            for (const [storeName, source] of Object.entries(dataStores)) {
                if ("function" === typeof source.setId) {
                    source.setId(globalID);
                    response.push(`${storeName}`);
                }
            }
            callback(null, {message: `ID : ${globalID} Set In [${response.join(";")}]`});
        },
        addData    : (_, callback) => {
            const DataSource = _.request.hasOwnProperty("source") ? _.request.source : "default";
            const chunks     = _.request.hasOwnProperty("chunks") ? _.request.chunks : ["data"];
            if (dataStores.hasOwnProperty(DataSource) && Array.isArray(chunks) && "function" === typeof dataStores[DataSource].put) {
                callback(null, {chunks: dataStores[DataSource].put(chunks)});
            } else {
                callback(null, {chunks: []});
            }
        },
        getData    : (_, callback) => {
            const DataSource = _.request.hasOwnProperty("source") ? _.request.source : "default";
            const size       = _.request.hasOwnProperty("size") ? _.request.size : 1;
            if (dataStores.hasOwnProperty(DataSource)) {
                callback(null, {chunks: dataStores[DataSource].get(size)});
            } else {
                callback(null, {chunks: []});
            }
        },
        checkId    : (_, callback) => {
            const DataSource = _.request.hasOwnProperty("source") ? _.request.source : "default";
            const chunks     = _.request.hasOwnProperty("chunks") ? _.request.chunks : ["data"];
            if (dataStores.hasOwnProperty(DataSource) && Array.isArray(chunks)) {
                callback(null, {chunks: dataStores[DataSource].check(chunks)});
            } else {
                callback(null, {chunks: []});
            }
        },
        popId      : (_, callback) => {
            const DataSource = _.request.hasOwnProperty("source") ? _.request.source : "default";
            const chunks     = _.request.hasOwnProperty("chunks") ? _.request.chunks : ["data"];
            if (dataStores.hasOwnProperty(DataSource) && Array.isArray(chunks)) {
                callback(null, {chunks: dataStores[DataSource].popId(chunks)});
            } else {
                callback(null, {chunks: []});
            }
        },
        reset      : (_, callback) => {
            const DataSource = _.request.hasOwnProperty("source") ? _.request.source : "default";
            if (dataStores.hasOwnProperty(DataSource)) {
                callback(null, {message: dataStores[DataSource].reset()});
            } else {
                callback(null, {message: `Unknown Source : ${DataSource}`});
            }
        },
        stats      : (_, callback) => {
            const DataSource = _.request.hasOwnProperty("source") ? _.request.source : "default";
            if (dataStores.hasOwnProperty(DataSource)) {
                callback(null, {message: dataStores[DataSource].stats()});
            } else {
                callback(null, {message: `Unknown Source : ${DataSource}`});
            }
        }
    });

    server.start()
    console.log(`Server running at 0.0.0.0:${port}`);
});
