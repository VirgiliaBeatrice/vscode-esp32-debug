import * as fs from "fs";
import * as os from "os";
import { EventEmitter } from "events";

interface ILogInfo {
    level: string;
    message: string;
    timestamp: string;
}

function ToLog(target: any, methodName: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    let method = descriptor.value;

    descriptor.value = function (message) {
        (this as Logger).log(methodName, message);
    };

    return descriptor;
}

export class Logger extends EventEmitter {
    public transports: Array<any>;
    public transport: fs.WriteStream;
    public console: NodeJS.WriteStream;
    public isHumanFriendly: boolean;
    // public info: ILogInfo;
    public callback: (output) => void;

    constructor() {
        super();

        // this.transports = [];
        // this.transports.push(fs.createWriteStream("/dev/null"));
        this.transport = fs.createWriteStream("console_log");
        this.console = process.stdout;
        this.isHumanFriendly = true;
    }

    public log(level: string, message: string): void {
        let info: ILogInfo = {
            level: level,
            message: message,
            timestamp: new Date().toISOString()
        };

        let output = undefined;
        if (this.isHumanFriendly) {
            output = `${info.timestamp} - ${info.level.toUpperCase()}: ${info.message}`;
        }
        else {
            output = JSON.stringify(info);
        }

        this.transport.write(
            output + os.EOL
        );

        this.console.write(
            output + os.EOL
        );

        this.callback(output + os.EOL);
    }

    @ToLog
    public error(message: string): void { }

    @ToLog
    public warn(message: string): void { }

    @ToLog
    public info(message: string): void { }

    @ToLog
    public debug(message: string): void { }
}


export const logger = createLogger();

export function createLogger(): Logger
{
    return new Logger();
}
