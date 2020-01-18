"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_config_1 = require("../../../config/inversify/inversify.config");
const di_interfaces_1 = require("../interfaces/di-interfaces");
const EosApi = require("../../eos/eosApi");
const WorkerHelper = require("../../common/helper/worker-helper");
const options = {
    processName: 'sync-tr-traces',
    durationInSecondsToAlert: 300,
};
async function toExecute() {
    EosApi.initBlockchainLibraries();
    const syncService = inversify_config_1.diContainer.get(di_interfaces_1.BlockchainTracesDiTypes.blockchainTracesSyncService);
    return syncService.process();
}
(async () => {
    await WorkerHelper.process(toExecute, options);
})();
