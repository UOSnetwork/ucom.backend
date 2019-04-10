/* eslint-disable no-console */

import AirdropsUsersToWaitingService = require('../../lib/airdrops/service/status-changer/airdrops-users-to-waiting-service');
import DatetimeHelper = require('../../lib/common/helper/datetime-helper');
const EosApi = require('../../lib/eos/eosApi');

(async () => {
  EosApi.initWalletApi();
  console.log(`${DatetimeHelper.currentDatetime()}. Lets run the worker`);
  const startTime = process.hrtime();

  await AirdropsUsersToWaitingService.process(100);
  const endTime = process.hrtime(startTime);
  console.log(`Worker has finished its work. Execution time is: ${endTime[1] / 1000000} ms`);
})();

export {};