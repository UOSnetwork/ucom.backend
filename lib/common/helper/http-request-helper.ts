import EnvHelper = require('./env-helper');

const config = require('config');

class HttpRequestHelper {
  public static getUCommunityCookieDomain(): string {
    return 'ucommunity.io';
  }

  public static getCookieDomain(request): string {
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

export = HttpRequestHelper;
