import { WorkerOptionsDto } from '../../common/interfaces/options-dto';
import { diContainer } from '../../../config/inversify/inversify.config';
import { BlockchainTracesDiTypes } from '../interfaces/di-interfaces';

import EosApi = require('../../eos/eosApi');
import WorkerHelper = require('../../common/helper/worker-helper');
import BlockchainTracesSyncService = require('../../blockchain-traces/service/blockchain-traces-sync-service');

const options: WorkerOptionsDto = {
  processName: 'sync-tr-traces',
  durationInSecondsToAlert: 300,
};

async function toExecute() {
  EosApi.initBlockchainLibraries();

  const syncService: BlockchainTracesSyncService
    = diContainer.get(BlockchainTracesDiTypes.blockchainTracesSyncService);

  return syncService.process();
}

(async () => {
  await WorkerHelper.process(toExecute, options);
})();

export {};
