const logger      = require('./utils/LoadData')
const grpc        = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const packageDefElement = protoLoader.loadSync("./protos/element.proto", {});
const elementProto      = grpc.loadPackageDefinition(packageDefElement);
const elementPackage    = elementProto.element;

const path        = require('path');
const dataDirPath = path.join(__dirname, './data/');
const dataStores  = logger.loadFolder(dataDirPath);

const server = new grpc.Server();
server.bind('0.0.0.0:8088', grpc.ServerCredentials.createInsecure());

server.addService(elementPackage.DataService.service, {
    getData: (_, callback) => {
        const DataSource = _.request.hasOwnProperty("source") ? _.request.source : "default";
        const size       = _.request.hasOwnProperty("size") ? _.request.size : 1;
        if (dataStores.hasOwnProperty(DataSource)) {
            callback(null, {chunks: dataStores[DataSource].get(size)});
        } else {
            callback(null, {chunks: []});
        }
    },
    addData: (_, callback) => {
        const DataSource = _.request.hasOwnProperty("source") ? _.request.source : "default";
        const chunks     = _.request.hasOwnProperty("chunks") ? _.request.chunks : ["data"];
        if (dataStores.hasOwnProperty(DataSource) && Array.isArray(chunks)) {
            callback(null, {chunks: dataStores[DataSource].put(chunks)});
        } else {
            callback(null, {chunks: []});
        }
    }
});

server.start()
console.log('Server running at http://0.0.0.0:8088');
