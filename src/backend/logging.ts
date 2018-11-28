import * as winston from "winston";
import * as fs from "fs";
import * as stream from "stream";


export const logger = winston.createLogger(
    {
        level: "info",
        format: winston.format.json(),
        transports: [
            new winston.transports.Stream(
                {
                    stream: fs.createWriteStream("console_log")
                }
            ),
            new winston.transports.File(
                {
                    filename: "logfile"
                }
            )
        ]
    }
);