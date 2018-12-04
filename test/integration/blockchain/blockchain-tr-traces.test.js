const helpers = require('../helpers');

const BlockchainTrTracesService     = require('../../../lib/eos/service/blockchain-tr-traces-service');

const BlockchainTrTracesDictionary  = require('uos-app-wallet').Dictionary.BlockchainTrTraces;

helpers.Mock.mockAllBlockchainPart();
helpers.Mock.mockAllTransactionSigning();

let userVlad, userJane, userPetr, userRokky;

describe('Blockchain tr traces sync tests', () => {
  beforeAll(async () => {
    [userVlad, userJane, userPetr, userRokky] = await helpers.SeedsHelper.beforeAllRoutine();
  });

  afterAll(async () => {
    await helpers.SeedsHelper.sequelizeAfterAll();
  });

  beforeEach(async () => {
    await helpers.SeedsHelper.initUsersOnly();
  });

  it.skip('Sync stake with unstake. Compare with etalon', async () => {
    const trType = BlockchainTrTracesDictionary.getTypeClaimEmission();
    await BlockchainTrTracesService.syncMongoDbAndPostgres([trType]);
  }, 200000);
});