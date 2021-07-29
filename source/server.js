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
    console.log(`Server running at 0.0.0.0:${port}`);
});
