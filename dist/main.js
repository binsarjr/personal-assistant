"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nest_commander_1 = require("nest-commander");
const app_module_1 = require("./app.module");
async function bootstrap() {
    await nest_commander_1.CommandFactory.run(app_module_1.AppModule);
}
bootstrap();
//# sourceMappingURL=main.js.map