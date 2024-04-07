"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrcodeConnectionCommand = void 0;
const nest_commander_1 = require("nest-commander");
let QrcodeConnectionCommand = class QrcodeConnectionCommand extends nest_commander_1.CommandRunner {
    async run() {
        console.log('Hello World!');
    }
};
exports.QrcodeConnectionCommand = QrcodeConnectionCommand;
exports.QrcodeConnectionCommand = QrcodeConnectionCommand = __decorate([
    (0, nest_commander_1.Command)({
        name: 'cowsay',
        options: {
            isDefault: true,
        },
    })
], QrcodeConnectionCommand);
//# sourceMappingURL=qrcode-connection.command.js.map