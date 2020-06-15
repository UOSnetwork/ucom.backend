"use strict";
// /* eslint-disable no-console */
// import { AppError } from '../../lib/api/errors';
//
// import EnvHelper = require('../../lib/common/helper/env-helper');
//
// const request = require('request-promise-native');
//
// const appRoot = require('app-root-path');
// const fs      = require('fs');
// const eosJsEcc = require('eosjs-ecc');
//
// const outputFile = `${appRoot}/logs/register-many-users-result.csv`;
//
// const eosApi = require('../../lib/eos/eosApi');
//
// eosApi.initBlockchainLibraries();
//
// function getUrl(): string {
//   let host;
//   if (EnvHelper.isTestEnv()) {
//     host = 'http://173.18.212.40:3000';
//   } else if (EnvHelper.isStagingEnv()) {
//     host = 'https://staging-backend.ucommunity.io';
//   } else {
//     throw new AppError(`Unsupported env: ${EnvHelper.getNodeEnv()}`, 500);
//   }
//
//   return `${host}/api/v1/auth/registration`;
// }
//
// async function sendRegistrationRequest(fields): Promise<string> {
//   const options = {
//     uri: getUrl(),
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//     },
//     form: fields,
//   };
//
//   const res = await request(options);
//
//   return  JSON.parse(res);
// }
//
// /**
//  *
//  * @param {Object[]} accountsData
//  * @param {string[]|null} headers
//  */
// function objectsToCsv(accountsData, headers: any = null) {
//   let outputString = '';
//
//   if (headers) {
//     outputString += headers.join(';');
//     outputString += '\n';
//   }
//
//   for (let i = 0; i < <number>accountsData.length; i += 1) {
//     const data = accountsData[i];
//
//     const processedData: string[] = [];
//     // eslint-disable-next-line guard-for-in
//     for (const field in data) {
//       // noinspection JSUnfilteredForInLoop
//       processedData.push(`"${data[field]}"`);
//     }
//
//     outputString += processedData.join(';');
//     outputString += '\n';
//   }
//
//   // eslint-disable-next-line security/detect-non-literal-fs-filename
//   fs.writeFileSync(outputFile, outputString);
//
//   console.log(`results are saved to: ${outputFile}`);
// }
//
// async function registerNewUser(givenAccountName: string) {
//   const brainKey = eosApi.generateBrainkey();
//
//   const accountName = givenAccountName || eosApi.createRandomAccountName();
//   const [privateOwnerKey, privateActiveKey] = eosApi.getKeysByBrainkey(brainKey);
//
//   // noinspection JSUnusedLocalSymbols
//   const ownerPublicKey  = eosApi.getPublicKeyByPrivate(privateOwnerKey);
//   const activePublicKey = eosApi.getPublicKeyByPrivate(privateActiveKey);
//
//   const sign = eosJsEcc.sign(accountName, privateActiveKey);
//
//   const fields = {
//     sign,
//     account_name: accountName,
//     public_key: activePublicKey,
//     brainkey: brainKey,
//   };
//
//   const response = await sendRegistrationRequest(fields);
//
//   return {
//     response,
//     accountData: {
//       accountName,
//       brainKey,
//       privateKeyOwner:  privateOwnerKey,
//       publicKeyOwner:   ownerPublicKey,
//
//       privateKeyActive: privateActiveKey,
//       publicKeyActive:  activePublicKey,
//     },
//   };
// }
//
// (async () => {
//   const accountNamesToRegister = [
//     'rokky1115555',
//     'rokky2225555',
//     'rokky2235555',
//     'rokky2245555',
//     'rokky2255555',
//     'rokky2265555',
//     'rokky2275555',
//     'rokky2285555',
//     'rokky2295555',
//     'rokky2105555',
//     'rokky2115555',
//     'rokky2125555',
//     'rokky2135555',
//     'rokky2145555',
//     'rokky2155555',
//     'rokky2165555',
//     'rokky2175555',
//     'rokky2185555',
//     'rokky2195555',
//     'rokky2205555',
//   ];
//
//   const headers = [
//     'accountName',
//     'brainKey',
//
//     'privateKeyOwner',
//     'publicKeyOwner',
//
//     'privateKeyActive',
//     'publicKeyActive',
//   ];
//
//   const accountsToWrite: any = [];
//   for (let i = 0; i < <number>accountNamesToRegister.length; i += 1) {
//     const accountName = accountNamesToRegister[i];
//
//     try {
//       const { accountData } = await registerNewUser(accountName.toLowerCase());
//       console.log(JSON.stringify(accountData));
//       accountsToWrite.push(accountData);
//     } catch (error) {
//       console.error(
//         // tslint:disable-next-line:max-line-length
//         `Not possible to register user with account name ${accountName}. Skipped. Error message is: ${error.message}`,
//       );
//     }
//   }
//
//   objectsToCsv(accountsToWrite, headers);
// })();
//
// export {};
