"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinksController = void 0;
class LinksController {
    dependencyContainer;
    constructor(dependencyContainer) {
        this.dependencyContainer = dependencyContainer;
    }
    async getShortlinks() {
        const results = await this.dependencyContainer.services.postgres /* sql */ `
    SELECT *
    FROM "url-shortner-db"
    ORDER BY created_at DESC`;
        return results;
    }
    async getShortlink(code) {
        const results = await this.dependencyContainer.services.postgres /* sql */ `
    SELECT id, original_url
    FROM "url-shortner-db"
    WHERE code = ${code}`;
        const foundLink = results[0];
        return foundLink;
    }
    async createShortlink(code, url) {
        const results = await this.dependencyContainer.services.postgres /* sql */ `
    INSERT INTO "url-shortner-db" (code, original_url)
    VALUES (${code}, ${url})
    RETURNING *`;
        const createdLink = results[0];
        return createdLink;
    }
}
exports.LinksController = LinksController;
//# sourceMappingURL=link.controller.js.map