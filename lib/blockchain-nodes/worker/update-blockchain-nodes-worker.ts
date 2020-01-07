import { WorkerOptionsDto } from '../../common/interfaces/options-dto';

import BlockchainCacheService = require('../../blockchain-nodes/service/blockchain-cache-service');
import WorkerHelper = require('../../common/helper/worker-helper');
import EosApi = require('../../eos/eosApi');

const options: WorkerOptionsDto = {
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

export {};
