"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BlockchainCacheService = require("../../blockchain-nodes/service/blockchain-cache-service");
const WorkerHelper = require("../../common/helper/worker-helper");
const EosApi = require("../../eos/eosApi");
const options = {
    processName: 'update-blockchain-nodes',
    durationInSecondsToAlert: 300,
};
async function toExecute() {
    EosApi.initBlockchainLibraries();
    await BlockchainCacheService.updateBlockchainNodesByBlockchain();
}
(async () => {
    await WorkerHelper.process(toExecute, options);
})();
