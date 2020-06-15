"use strict";
const EnvHelper = require("./env-helper");
const config = require('config');
class HttpRequestHelper {
    static getUCommunityCookieDomain() {
        return 'ucommunity.io';
    }
    static getCookieDomain(request) {
        if (EnvHelper.isProductionEnv()) {
            return this.getUCommunityCookieDomain();
        }
        const allowedOrigins = config.cors.allowed_origins;
        const { origin } = request.headers;
        if (allowedOrigins.includes(origin) && origin.includes('localhost')) {
            return 'localhost';
        }
        return this.getUCommunityCookieDomain();
    }
}
module.exports = HttpRequestHelper;
