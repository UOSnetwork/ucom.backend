const helpers = require('../helpers');

const BlockchainService = require('../../../lib/eos/service/blockchain-service');

helpers.Mock.mockAllBlockchainPart();
helpers.Mock.mockAllTransactionSigning();

let userVlad, userJane, userPetr, userRokky;

describe('Myself blockchain GET', () => {
  beforeAll(async () => {
    [userVlad, userJane, userPetr, userRokky] = await helpers.SeedsHelper.beforeAllRoutine();
  });

  afterAll(async () => {
    await helpers.SeedsHelper.sequelizeAfterAll();
  });

  beforeEach(async () => {
    await helpers.SeedsHelper.initUsersOnly();
  });

  describe('Get blockchain transactions', () => {
    it('Ensure different transactions structure', async () => {
      const models = await helpers.Blockchain.requestToGetMyselfBlockchainTransactions(userVlad);
      helpers.Blockchain.checkMyselfBlockchainTransactionsStructure(models);
    });

    it('sample', async () => {
      await BlockchainService.mongoDbSample();
    });
  });
});