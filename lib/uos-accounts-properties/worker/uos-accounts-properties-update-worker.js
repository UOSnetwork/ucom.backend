"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const WorkerHelper = require("../../common/helper/worker-helper");
const UosAccountsPropertiesUpdateService = require("../service/uos-accounts-properties-update-service");
const EosApi = require('../../eos/eosApi');
const options = {
    processName: 'uos-accounts-properties-update',
    durationInSecondsToAlert: 300,
};
async function toExecute() {
    EosApi.initBlockchainLibraries();
    return UosAccountsPropertiesUpdateService.updateAll(1000);
}
(async () => {
    await WorkerHelper.process(toExecute, options);
})();
