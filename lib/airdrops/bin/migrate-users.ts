import AirdropUsersMigrateService = require('../service/maintenance/airdrop-users-migrate-service');

const ROUND_ONE_ID = 1;
const ROUND_TWO_ID = 4;

(async () => {
  await AirdropUsersMigrateService.migrateFromFirstRoundToSecond(ROUND_ONE_ID, ROUND_TWO_ID)
})();
