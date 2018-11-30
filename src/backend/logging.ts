import * as fs from "fs";
import * as os from "os";
import chalk from "chalk";
import { EventEmitter } from "events";


const colorLevel = {
    error: chalk.bold.red,
    warn: chalk.bold.yellow,
    info: chalk.white,
    debug: chalk.green
};

// const errorColor = chalk.bold.red;
// const warningColor = chalk.keyword('orange');
export interface ILogInfo {
    level: string;
    message: string;
    timestamp: string;
    toString?: (boolean) => string;
    toJSON?: () => string;
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
    // public isHumanFriendly: boolean;
    // public info: ILogInfo;
    // public callback: (output) => void;

    constructor(private _logFullPath?: string) {
        super();
    }

    public addTransport(path?: string): void {
            // this.transports = [];
        // this.transports.push(fs.createWriteStream("/dev/null"));
        this.transport = fs.createWriteStream(`${path? path : this._logFullPath}/console_log`);
        // this.console = process.stdout;
        // this.isHumanFriendly = true;
        this.on("log",
            (info: ILogInfo) => {
                this.transport.write(info.toJSON());
                // this.console.write(info.toString(true));
            }
        );
    }

    public log(level: string, message: string): void {
        let info: ILogInfo = {
            level: level,
            message: message,
            timestamp: new Date().toUTCString()
        };

        info.toString = function (format: boolean) {
            let color = colorLevel[this.level];
            let printf = `${info.timestamp} - ${this.level.toUpperCase()}: ${info.message}${os.EOL}`;

            return format? color(printf): printf;
        };

        info.toJSON = () => {
            return JSON.stringify(Object.assign({}, [info.level, info.message, info.timestamp])) + os.EOL;
        };

        // let output = undefined;
        // let selectedColor = info.level === "error"? errorColor : warningColor;
        // let styledLevel = selectedColor(info.level.toUpperCase());

        // if (this.isHumanFriendly) {
        //     output = `${info.timestamp} - ${styledLevel}: ${info.message}`;
        // }
        // else {
        //     output = JSON.stringify(info);
        // }

        // this.transport.write(
        //     output + os.EOL
        // );

        // this.console.write(
        //     output + os.EOL
        // );

        // Replace callback to on/emit
        this.emit("log", info);
        // if (this.callback)
        // {
        //     this.callback(output + os.EOL);
        // }
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


// export const logger = createLogger();

export function createLogger(path?: string): Logger
{
    return new Logger(path);
}
