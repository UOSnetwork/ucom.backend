import { Container } from 'inversify';
import { UsersDiTypes } from '../../lib/users/interfaces/di-interfaces';
import { AffiliatesDiTypes } from '../../lib/affiliates/interfaces/di-interfaces';

import UsersAuthService = require('../../lib/users/service/users-auth-service');
import RegistrationService = require('../../lib/users/service/registration-service');
import RegistrationConversionService = require('../../lib/affiliates/service/conversions/registration-conversion-service');
const { initBlockchainTraces } = require('../../lib/blockchain-traces/inversify/blockchain-traces.inversify.config');

const diContainer = new Container();

// #task - move to the separate file close to the service like initBlockchainTraces
diContainer.bind(UsersDiTypes.authService).to(UsersAuthService);
diContainer.bind(UsersDiTypes.registrationService).to(RegistrationService);
diContainer.bind(AffiliatesDiTypes.registrationConversionService).to(RegistrationConversionService);

initBlockchainTraces(diContainer);


export { diContainer };
