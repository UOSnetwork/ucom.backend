/* eslint-disable no-console */

import { WorkerOptionsDto } from '../../common/interfaces/options-dto';

import WorkerHelper = require('../../common/helper/worker-helper');
import UosAccountsPropertiesUpdateService = require('../service/uos-accounts-properties-update-service');
const EosApi = require('../../eos/eosApi');

const options: WorkerOptionsDto = {
  processName: 'uos-accounts-properties-update',
  durationInSecondsToAlert: 300,
};

async function toExecute() {
  EosApi.initBlockchainLibraries();
  return UosAccountsPropertiesUpdateService.updateAll();
}

(async () => {
  await WorkerHelper.process(toExecute, options);
})();

export {};
