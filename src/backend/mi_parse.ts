import { isRegExp } from "util";

export interface MIInfo {
    token: number;
    outOfBandRecord: Array<{ isStream: boolean, type: string, asyncClass: string, output: Array<[string, any]>, content: string }>;
    resultRecords: { resultClass: string, results: Array<[string, any]> };
}

interface IRegExpPair {
    regExp: RegExp | string;
    quantifier: string;
}

class RegExpPair implements IRegExpPair {
    public quantifier = undefined;

    constructor(public regExp: RegExp | string, quantifier?: string) {
        if (!quantifier) {
            this.quantifier = "";
        }
        else {
            this.quantifier = quantifier;
        }
    }
}

interface IRegExpHelper {
    or: (beginning: boolean, end: boolean, ...pairs: Array<IRegExpPair> | Array<IRegExpPair>) => RegExp;
    add: (beginning: boolean, end: boolean, ...pairs: Array<IRegExpPair> | Array<IRegExpPair>) => RegExp;
    anchor: (anchor: string, regExp: RegExp) => RegExp;
}

// let RegExpHelper: IRegExpHelper = {
//     or: undefined,
//     add: undefined
// };


class RegExpHelper {

    // static isRegExp(target: RegExp | string): target is RegExp {
    //     return (<RegExp>target).source !== undefined;
    // }



    public setQuantifier(quantifier: "+" | "*" | "?"): void {

    }

    static or(beggining: boolean, end: boolean, ...pairs: Array<IRegExpPair> | Array<IRegExpPair>): RegExp {
        return new RegExp(
            [
                beggining ? "^" : "",
                pairs.map(
                    (pair) => {
                        if (isRegExp(pair.regExp)) {
                            return `(${pair.regExp.source})${pair.quantifier}`;
                        }
                        else {
                            return `(${pair.regExp})${pair.quantifier}`;
                        }

                    }
                ).join("|"),
                end ? "$" : ""
            ].join("")
        );
    }

    static add(beggining: boolean, end: boolean, ...pairs: Array<IRegExpPair> | Array<IRegExpPair>): RegExp {
        return new RegExp(
            [
                beggining ? "^" : "",
                pairs.map(
                    (pair) => {
                        if (isRegExp(pair.regExp)) {
                            return `(${pair.regExp.source})${pair.quantifier}`;
                        }
                        else {
                            return `(${pair.regExp})${pair.quantifier}`;
                        }
                    }
                ).join(""),
                end ? "$" : ""
            ].join("")
        );
    }

    static start(regExp: RegExp): RegExp {
        return new RegExp("^" + regExp.source);
    }
}

// RegExpHelper.or = (beggining: boolean, end: boolean, ...regExps: RegExp[]): RegExp =>
// {
//     return new RegExp(
//         [
//             beggining ? "^" : "",
//             regExps.map(
//                 (regExp) =>
//                 {
//                     return `(${regExp.source})`;
//                 }
//             ).join("|"),
//             end ? "$" : ""
//         ].join("")
//     );
// };

// RegExpHelper.add = (beggining: boolean, end: boolean, ...regExps: RegExp[]): RegExp =>
// {
//     return new RegExp(
//         [
//             beggining ? "^" : "",
//             regExps.map(
//                 (regExp) =>
//                 {
//                     return `${regExp.source}`;
//                 }
//             ).join(""),
//             end ? "$" : ""
//         ].join("")
//     );
// };

const octalMatch = /^[0-7]{3}/;
function parseString(str: string): string {
    const ret = new Buffer(str.length * 4);
    let bufIndex = 0;

    if (str[0] !== '"' || str[str.length - 1] !== '"') {
        throw new Error('Not a valid string');
    }
    str = str.slice(1, -1);
    let escaped = false;
    for (let i = 0; i < str.length; i++) {
        if (escaped) {
            let m;
            if (str[i] === '\\') {
                bufIndex += ret.write('\\', bufIndex);
            }
            else if (str[i] === '"') {
                bufIndex += ret.write('"', bufIndex);
            }
            else if (str[i] === '\'') {
                bufIndex += ret.write('\'', bufIndex);
            }
            else if (str[i] === 'n') {
                bufIndex += ret.write('\n', bufIndex);
            }
            else if (str[i] === 'r') {
                bufIndex += ret.write('\r', bufIndex);
            }
            else if (str[i] === 't') {
                bufIndex += ret.write('\t', bufIndex);
            }
            else if (str[i] === 'b') {
                bufIndex += ret.write('\b', bufIndex);
            }
            else if (str[i] === 'f') {
                bufIndex += ret.write('\f', bufIndex);
            }
            else if (str[i] === 'v') {
                bufIndex += ret.write('\v', bufIndex);
            }
            else if (str[i] === '0') {
                bufIndex += ret.write('\0', bufIndex);
            }
            else if (m = octalMatch.exec(str.substr(i))) {
                ret.writeUInt8(parseInt(m[0], 8), bufIndex++);
                i += 2;
            }
            else {
                bufIndex += ret.write(str[i], bufIndex);
            }
            escaped = false;
        } else {
            if (str[i] === '\\') {
                escaped = true;
            }
            else if (str[i] === '"') {
                throw new Error('Not a valid string');
            }
            else {
                bufIndex += ret.write(str[i], bufIndex);
            }
        }
    }
    return ret.slice(0, bufIndex).toString('utf8');
}

export class MINode implements MIInfo {
    public token: number;
    public outOfBandRecord: Array<{ isStream: boolean, type: string, asyncClass: string, output: Array<[string, any]>, content: string }>;
    public resultRecords: { resultClass: string, results: Array<[string, any]> };

    public static valueOf(start: any, path: string): any {
        if (!start) {
            return undefined;
        }
        const pathRegex = /^\.?([a-zA-Z_\-][a-zA-Z0-9_\-]*)/;
        const indexRegex = /^\[(\d+)\](?:$|\.)/;
        path = path.trim();
        if (!path) { return start; }
        let current = start;
        do {
            let target = pathRegex.exec(path);
            if (target) {
                path = path.substr(target[0].length);
                if (current.length && typeof current !== 'string') {
                    const found = [];
                    for (const element of current) {
                        if (element[0] === target[1]) {
                            found.push(element[1]);
                        }
                    }
                    if (found.length > 1) {
                        current = found;
                    }
                    else if (found.length === 1) {
                        current = found[0];
                    }
                    else {
                        return undefined;
                    }
                }
                else {
                    return undefined;
                }
            }
            else if (path[0] === '@') {
                current = [current];
                path = path.substr(1);
            }
            else {
                target = indexRegex.exec(path);
                if (target) {
                    path = path.substr(target[0].length);
                    const i = parseInt(target[1]);
                    if (current.length && typeof current !== 'string' && i >= 0 && i < current.length) {
                        current = current[i];
                    }
                    else if (i === 0) {
                    }
                    else {
                        return undefined;
                    }
                }
                else {
                    return undefined;
                }
            }
            path = path.trim();
        } while (path);
        return current;
    }

    constructor(
        token: number,
        info: Array<{ isStream: boolean, type: string, asyncClass: string, output: Array<[string, any]>, content: string }>,
        result: { resultClass: string, results: Array<[string, any]> }
    ) {
        this.token = token;
        this.outOfBandRecord = info;
        this.resultRecords = result;
    }

    public record(path: string): any {
        if (!this.outOfBandRecord) {
            return undefined;
        }
        return MINode.valueOf(this.outOfBandRecord[0].output, path);
    }

    public result(path: string): any {
        if (!this.resultRecords) {
            return undefined;
        }
        return MINode.valueOf(this.resultRecords.results, path);
    }
}

// const tokenRegex = /^\d+/;
// const outOfBandRecordRegex = /^(?:(\d*|undefined)([\*\+\=])|([\~\@\&]))/;
// const resultRecordRegex = /^(\d*)\^(done|running|connected|error|exit)/;
// const newlineRegex = /^\r\n?/;
// const endRegex = /^\(gdb\)\r\n?/;
// const variableRegex = /^([a-zA-Z_\-][a-zA-Z0-9_\-]*)/;
// const asyncClassRegex = /^(.*?),/;

export function parseMI(output: string): Array<any> {
    /*
        output ==>
            (
                exec-async-output     = [ token ] "*" ("stopped" | others) ( "," variable "=" (const | tuple | list) )* \n
                status-async-output   = [ token ] "+" ("stopped" | others) ( "," variable "=" (const | tuple | list) )* \n
                notify-async-output   = [ token ] "=" ("stopped" | others) ( "," variable "=" (const | tuple | list) )* \n
                console-stream-output = "~" c-string \n
                target-stream-output  = "@" c-string \n
                log-stream-output     = "&" c-string \n
            )*
            [
                [ token ] "^" ("done" | "running" | "connected" | "error" | "exit") ( "," variable "=" (const | tuple | list) )* \n
            ]
            "(gdb)" \n
    */

    // let token;
    // const outOfBandRecord = [];
    // let resultRecords;

    const asyncRecordType = {
        '*': 'exec',
        '+': 'status',
        '=': 'notify'
    };
    const streamRecordType = {
        '~': 'console',
        '@': 'target',
        '&': 'log'
    };

    const parseCString = (value) => {
        if (value[0] !== '"') {
            return '';
        }
        let stringEnd = 1;
        let inString = true;
        let remaining = value.substr(1);
        let escaped = false;
        while (inString) {
            if (escaped) {
                escaped = false;
            }
            else if (remaining[0] === '\\') {
                escaped = true;
            }
            else if (remaining[0] === '"') {
                inString = false;
            }

            remaining = remaining.substr(1);
            stringEnd++;
        }
        let str;
        try {
            str = parseString(value.substr(0, stringEnd));
        }
        catch (e) {
            str = value.substr(0, stringEnd);
        }
        value = value.substr(stringEnd);
        return str;
    };

    // let parseValue;
    // let parseCommaResult;
    // let parseCommaValue;
    // let parseResult;

    // const parseTupleOrList = (value) => {
    //     if (value[0] !== '{' && value[0] !== '[') {
    //         return undefined;
    //     }
    //     const oldContent = value;
    //     const canBeValueList = value[0] === '[';
    //     value = value.substr(1);
    //     if (value[0] === '}' || value[0] === ']') {
    //         return [];
    //     }
    //     if (canBeValueList) {
    //         let value = parseValue();
    //         if (value) { // is value list
    //             const values = [];
    //             values.push(value);
    //             const remaining = value;
    //             while ((value = parseCommaValue()) !== undefined) {
    //                 values.push(value);
    //             }
    //             value = value.substr(1); // ]
    //             return values;
    //         }
    //     }
    //     let result = parseResult();
    //     if (result) {
    //         const results = [];
    //         results.push(result);
    //         while (result = parseCommaResult()) {
    //             results.push(result);
    //         }
    //         value = value.substr(1); // }
    //         return results;
    //     }
    //     value = (canBeValueList ? '[' : '{') + value;
    //     return undefined;
    // };

    // parseValue = (value) => {
    //     if (value[0] === '"') {
    //         return parseCString(value);
    //     }
    //     else if (value[0] === '{' || value[0] === '[') {
    //         return parseTupleOrList(value);
    //     }
    //     else {
    //         return undefined;
    //     }
    // };


    // parseCommaValue = (value) => {
    //     if (value[0] !== ',') {
    //         return undefined;
    //     }
    //     value = value.substr(1);
    //     return parseValue(value);
    // };

    // parseResult = (value) => {
    //     const variableMatch = variableRegex.exec(value);
    //     if (!variableMatch) {
    //         return undefined;
    //     }
    //     value = value.substr(variableMatch[0].length + 1);
    //     const variable = variableMatch[1];
    //     return [variable, parseValue(value)];
    // };

    // parseCommaResult = (value) => {
    //     if (value[0] !== ',') {
    //         return undefined;
    //     }
    //     value = value.substr(1);
    //     return parseResult(value);
    // };


    const tokenRegExp = new RegExp(/\d*/);
    const constRegExp = new RegExp(/".+?"/);
    const tupleRegExp = new RegExp(/\{.*\}/);
    const listRegExp = new RegExp(/\[.*\]/);
    const asyncClassRegExp = new RegExp(/[a-zA-Z0-9_\-]*/);
    const resultClassRegExp = new RegExp(/(done)|(running)|(connected)|(error)|(exit)/);
    const variableRegExp = new RegExp(/([a-zA-Z_\-][a-zA-Z0-9_\-]*)/);
    const valueRegExp: RegExp = RegExpHelper.or(
        false, false,
        new RegExpPair(constRegExp),
        new RegExpPair(tupleRegExp),
        new RegExpPair(listRegExp)
    );

    const resultRegExp: RegExp = RegExpHelper.add(
        false, false,
        new RegExpPair(variableRegExp),
        new RegExpPair("="),
        new RegExpPair(valueRegExp)
    );

    const gResultRegExp = RegExpHelper.add(
        false, false,
        new RegExpPair(","),
        new RegExpPair(resultRegExp)
    );

    const asyncOutputRegExp = RegExpHelper.add(
        false, false,
        new RegExpPair(asyncClassRegExp, "+"),
        new RegExpPair(gResultRegExp, "*")
    );


    const gAsyncOutputRegExp = RegExpHelper.add(
        false, false,
        new RegExpPair(tokenRegExp, "?"),
        new RegExpPair(/[\*\+=]/),
        new RegExpPair(asyncOutputRegExp)
    );
    const gStreamOutputRegExp = RegExpHelper.add(
        false, false,
        new RegExpPair(/([~@&])/),
        new RegExpPair(constRegExp)
    );


    const asyncRecordRegExp = gAsyncOutputRegExp;
    const streamRecordRegExp = gStreamOutputRegExp;
    const resultRecordRegExp = RegExpHelper.add(
        false, false,
        new RegExpPair(tokenRegExp, "?"),
        new RegExpPair("\\^"),
        new RegExpPair(resultClassRegExp),
        new RegExpPair(gResultRegExp, "*")
    );

    const gdbOutputRegExp = new RegExp(/\(gdb\)/);

    const quotationRegExp = new RegExp(/(\")/gm);
    const backslashRegExp = new RegExp(/(\\{2})/gm);
    const newlineRegExp = new RegExp(/(\\n)/gm);
    const tabRegExp = new RegExp(/(\\t)/gm);


    let escapeString = (str: string) => {
        str = str.replace(quotationRegExp, "");
        // str = str.replace(newlineRegExp, "\n");
        // str = str.replace(tabRegExp, "\t");
        str = str.replace(backslashRegExp, "/");

        return str;
    };

    let parseBalancedBracketsNew = (value: string): [string, number, string] | undefined => {
        let stack = [];

        const balancedBrackets: Object = {
            "[": "]",
            "{": "}",
            "\"": "\""
        };


        if (value === "" || !balancedBrackets.hasOwnProperty(value[0])) {
            return undefined;
        }

        let openBracket = value[0];

        if (openBracket === "\"") {
            for (let idx = 0; idx < value.length; idx ++) {
                if (value[idx] === openBracket) {
                    if (stack.length === 0) {
                        stack.push(idx);
                    }
                    else {
                        stack.pop();
                        let closeIdx = idx;
                        return [openBracket, closeIdx, value.slice(closeIdx + 1)];
                    }
                }
            }
        }
        else {
            for (let idx = 0; idx < value.length; idx++) {
                if (value[idx] === openBracket) {
                    stack.push(idx);
                }
                else if (value[idx] === balancedBrackets[openBracket]) {
                    // let openIdx = stack.pop();
                    stack.pop();
                    let closeIdx = idx;

                    if (stack.length === 0) {
                        return [openBracket, closeIdx, value.slice(closeIdx + 1)];
                    }
                }
            }
        }

        return [undefined, undefined, undefined];
    };

    let parseBalancedBrackets = (value: string, bracket?: "[" | "{" | string): any => {
        let stack = [];

        const balancedBrackets = {
            "[": "]",
            "{": "}"
        };

        if (value === "") {
            return [-1, -1, undefined];
        }

        if (value[0] !== bracket) {
            return [-1, -1, undefined];
        }

        for (let idx = 0; idx < value.length; idx++) {
            if (value[idx] === bracket) {
                stack.push(idx);
            }
            else if (value[idx] === balancedBrackets[bracket]) {
                let openIdx = stack.pop();
                let closeIdx = idx;

                if (stack.length === 0) {
                    return [openIdx, closeIdx, value.slice(closeIdx + 1)];
                }
            }
        }
    };

    let parseConstNew = (value: string) => {
        return escapeString(value);
    };

    let parseConst = (value: string) => {
        let match = RegExpHelper.start(constRegExp).exec(value);

        if (!match) {
            return [undefined, undefined];
        }
        else {
            return [
                escapeString(match[0]),
                value.substr(match[0].length)
            ];
            // return match[0];
        }
    };

    let parseListNew = (list: string) => {

        let retResults = parseResults("," + list);
        let retValues = parseValuesNew("," + list);

        return retResults || retValues || [];
        // let ret = retResults || retValues;

        // if (ret) {
        //     return ret;
        // }
        // else {
        //     return [];
        // }
        // if (retValues) {
        //     return retValues;
        // }
        // else {
        //     return retResults;
        // }
    };

    let parseList = (value: string) => {
        let [openIdx, closeIdx, remaining] = parseBalancedBrackets(value, "[");

        if (openIdx === -1 && closeIdx === -1) {
            return [undefined, undefined];
        }
        else {
            let retValue = parseValues(value.slice(openIdx + 1, closeIdx));
            let retResult = parseResult("," + value.substring(openIdx, closeIdx + 1));
            // let retOthers = parseResult(remaining);

            if (retValue) {
                // return [parseString(retValue)];
                return [[retValue], remaining];
            }
            else {
                return [[retResult], remaining];
            }
        }

        // let match =RegExpHelper.start(listRegExp).exec(value);

        // if (!match) {
        //     return undefined;
        // }
        // else {
        //     let retValue = parseValue(value.slice(1, -1));
        //     let retResult = parseResult("," + value.slice(1, -1));

        //     if (retValue) {
        //         // return [parseString(retValue)];
        //         return [retValue];
        //     }
        //     else {
        //         return [retResult];
        //     }
        // return [
        //     ...retValue,
        //     retResult
        // ];
        // }
    };

    let parseTupleNew = (tuple: string) => {
        let results = parseResults("," + tuple);

        return Object.assign({}, ...results);
    };

    let parseTuple = (value: string) => {
        let [openIdx, closeIdx, remaining] = parseBalancedBrackets(value, "{");

        if (openIdx === -1 && closeIdx === -1) {
            return [undefined, undefined];
        }
        else {
            let result: Array<any> = parseResult("," + value.substring(openIdx + 1, closeIdx));
            // let others = parseResult(remaining);

            return [Object.assign({}, ...result), remaining];
        }
        // let match = RegExpHelper.start(tupleRegExp).exec(value);

        // if (!match) {
        //     return undefined;
        // }
        // else {
        //     let result = parseResult("," + value.slice(1, -1));

        //     return result;
        //     // return {
        //     //     result: result
        //     // };
        // }
    };

    let parseValue = (value: string) => {
        let result: any = parseConst(value);

        if (result) {
            return result;
        }

        result = parseTuple(value);

        if (result) {
            return result;
        }

        result = parseList(value);

        return result;
    };

    let parseValueNew = (openBracket: string, value: string) => {
        // if (value.length === 0) {
        //     return undefined;
        // }

        let result, remaining = undefined;

        switch (openBracket) {
            case "\"":
                result = parseConstNew(value);
                break;
            case "{":
                result = parseTupleNew(value);
                break;
            case "[":
                result = parseListNew(value);
                break;
            default:
                [result, remaining] = [undefined, undefined];
        }

        return result;

    };

    let parseValuesNew = (values: string) => {
        let match = RegExp(/^(,)((\")|(\{)|(\[))/).exec(values);

        if (!match) {
            return undefined;
        }
        else {
            let [openBracket, closeIdx, remaining] = [undefined, undefined, undefined];
            // if (match[3]) {
                // [openBracket, closeIdx, remaining] = parseBalancedBracketsNew(values.substr(match[1].length));
            // }
            // else {
                // [openBracket, closeIdx, remaining] = parseBalancedBracketsNew(values.substr(match[0].length));
                // }
            [openBracket, closeIdx, remaining] = parseBalancedBracketsNew(values.substr(match[1].length));
            let value = parseValueNew(openBracket, values.substr(match[1].length + 1, closeIdx - 1));
            let remainingValues = parseValuesNew(remaining);

            if (remainingValues) {
                return [
                    value,
                    ...remainingValues
                ];
            }
            else {
                return [value];
            }
        }
    };

    let parseValues = (values: string) => {
        if (values === "") {
            return undefined;
        }
        let [result, remaining]: any = parseConst(values);

        if (!result) {
            [result, remaining] = parseTuple(values);

            if (!result) {
                [result, remaining] = parseList(values);
            }
        }

        let retRemaining = parseValues(remaining);

        if (retRemaining) {
            return Object.assign({}, result, remaining);
        }
        else {
            return result;
        }
    };

    let parseResults = (results: string) => {
        let match = RegExp(/^(,)([a-zA-Z_\-][a-zA-Z0-9_\-]*)(=)/).exec(results);

        if (!match) {
            return undefined;
        }
        else {
            let variable = match[2];
            try {
                let [openBracket, closeIdx, remaining] = parseBalancedBracketsNew(results.substr(match[0].length));
                let value = parseValueNew(openBracket, results.substr(match[0].length + 1, closeIdx - 1));
                let remainingResults = parseResults(remaining);
                let retValue = {};
                retValue[variable] = value;

                if (remainingResults) {
                    return [
                        retValue,
                        ...remainingResults
                    ];
                }
                else {
                    return [retValue];
                }
            } catch (error) {
                console.log(`Exception captured. ${error}`);
                console.log(`Context is: ${results}`);
            }



        }
    };

    let parseResult = (result: string) => {
        let match = RegExpHelper.start(gResultRegExp).exec(result);

        if (!match) {
            return undefined;
        }
        else {
            let variable = match[3];
            let value = parseValues(match[6]);
            let remaining: Array<any> | undefined = parseResult(result.substr(match[0].length));
            let retValue = {};
            retValue[variable] = value;

            if (remaining) {
                return [
                    retValue,
                    ...remaining
                ];
                // return [
                //     {
                //         variable: variable,
                //         value: value
                //     },
                //     ...remaining
                // ];
            }
            else {
                return [
                    retValue
                ];
                // return [
                //     {
                //         variable: variable,
                //         value: value
                //     }
                // ];
            }
        }
    };

    // let parseResult = (result: string) => {
    //     let match = RegExpHelper.start(gResultRegExp).exec(result);

    //     if (!match) {
    //         return undefined;
    //     }
    //     else {
    //         let variable = match[3];
    //         let value = parseValue(match[6]);
    //         let remaining: Object | undefined = parseResult(result.substr(match[0].length));
    //         let retValue = {};
    //         retValue[variable] = value;

    //         if (remaining)
    //         {
    //             return {
    //                 ...retValue,
    //                 ...remaining
    //             };
    //             // return [
    //             //     {
    //             //         variable: variable,
    //             //         value: value
    //             //     },
    //             //     ...remaining
    //             // ];
    //         }
    //         else{
    //             return {
    //                 ...retValue
    //             };
    //             // return [
    //             //     {
    //             //         variable: variable,
    //             //         value: value
    //             //     }
    //             // ];
    //         }
    //     }
    // };

    let parseAsyncOutput = (asyncOutput: string) => {
        let match = RegExpHelper.start(asyncOutputRegExp).exec(asyncOutput);

        if (!match) {
            return undefined;
        }
        else {
            let asyncClass = match[1];
            let result = parseResult(
                asyncOutput.substr(match[1].length)
            );

            return Object.assign(
                { asyncClass: asyncClass },
                ...result
            );
            // return {
            //     asyncClass: asyncClass,
            //     // result: result
            //     ...result
            // };
        }

    };

    let parseAsyncRecord = (record: string) => {
        let match = RegExpHelper.start(asyncRecordRegExp).exec(record);

        if (!match) {
            return undefined;
        }
        else {
            let token = parseInt(match[1]);
            let type = asyncRecordType[match[2]];
            let asyncOutput = parseAsyncOutput(match[0].slice(1));
            // let result = parseResult(record.substr(match[2].length + match[4].length));

            return {
                token: token,
                type: type,
                ...asyncOutput,
                // asyncOutput: asyncOutput,
                // ...result
                // result: result
            };
        }
    };

    let parseStreamRecord = (record: string) => {
        let match = RegExpHelper.start(streamRecordRegExp).exec(record);

        if (!match) {
            return undefined;
        }
        else {
            return {
                type: streamRecordType[match[1]],
                streamOutput: parseConstNew(match[3])
            };
        }
    };

    let parseOutOfBandRecord = (record: string) => {
        let result: any = parseAsyncRecord(record);

        if (result) {
            return result;
        }

        result = parseStreamRecord(record);

        if (result) {
            return result;
        }
    };

    let parseResultRecord = (record: string) => {
        let match = RegExpHelper.start(resultRecordRegExp).exec(record);

        if (!match) {
            return undefined;
        }
        else {
            let results = parseResults(record.substr(match[1].length + match[2].length + match[3].length));

            if (!results) {
                return {
                    token: parseInt(match[1]),
                    resultClass: match[3]
                };
            }
            else {
                return {
                    token: parseInt(match[1]),
                    resultClass: match[3],
                    // result: parseResult(record.substr(match[1].length + match[2].length + match[3].length))
                    ...Object.assign({}, ...results)
                };
            }
        }
    };

    let parseGdbOutput = (record: string) => {
        let match = RegExpHelper.start(gdbOutputRegExp).exec(record);

        if (!match) {
            return undefined;
        }
        else {
            return {
                GdbOutput: match[0]
            };
        }
    };

    let parseRecord = (record: string) => {
        let result: any = parseOutOfBandRecord(record);

        if (result) {
            return result;
        }

        result = parseResultRecord(record);

        if (result) {
            return result;
        }

        result = parseGdbOutput(record);

        return result;
    };


    // let match;
    let miObject: Array<any> = new Array();
    let lines: string[] = (output as string).split(/\r\n?/);
    lines.forEach(
        (record) => {
            if (record !== "") {
                miObject.push(parseRecord(record));
            }
        }
    );

    // lines.forEach(
    //     (line) => {
    //         if (match = outOfBandRecordRegex.exec(line)) {
    //             if (match[1] && token === undefined && match[1] !== 'undefined')
    //             {
    //                 token = parseInt(match[1]);
    //             }

    //             if (match[2])
    //             {
    //                 const classMatch = asyncClassRegex.exec(line);
    //                 let value = line.substr(classMatch[1].length);
    //                 const asyncRecord = {
    //                     isStream: false,
    //                     type: asyncRecordType[match[2]],
    //                     asyncClass: classMatch[1],
    //                     output: []
    //                 };
    //                 let result;
    //                 while (result = parseCommaResult(value))
    //                 {
    //                     asyncRecord.output.push(result);
    //                 }
    //                 outOfBandRecord.push(asyncRecord);
    //             }
    //             else if (match[3])
    //             {
    //                 const streamRecord = {
    //                     isStream: true,
    //                     type: streamRecordType[match[3]],
    //                     content: parseCString(line)
    //                 };
    //                 outOfBandRecord.push(streamRecord);
    //             }
    //         }


    //         if (match = resultRecordRegex.exec(line))
    //         {
    //             let value = line.substr(match[0].length);
    //             if (match[1] && token === undefined)
    //             {
    //                 token = parseInt(match[1]);
    //             }
    //             resultRecords = {
    //                 resultClass: match[2],
    //                 results: []
    //             };
    //             let result;
    //             while (result = parseCommaResult(value))
    //             {
    //                 resultRecords.results.push(result);
    //             }
    //         }
    //     }
    // );

    // while (match = outOfBandRecordRegex.exec(output)) {
    //     output = output.substr(match[0].length);
    //     if (match[1] && token === undefined && match[1] !== 'undefined') {
    //         token = parseInt(match[1]);
    //     }

    //     if (match[2]) {
    //         const classMatch = asyncClassRegex.exec(output);
    //         output = output.substr(classMatch[1].length);
    //         const asyncRecord = {
    //             isStream: false,
    //             type: asyncRecordType[match[2]],
    //             asyncClass: classMatch[1],
    //             output: []
    //         };
    //         let result;
    //         while (result = parseCommaResult()) {
    //             asyncRecord.output.push(result);
    //         }
    //         outOfBandRecord.push(asyncRecord);
    //     }
    //     else if (match[3]) {
    //         const streamRecord = {
    //             isStream: true,
    //             type: streamRecordType[match[3]],
    //             content: parseCString()
    //         };
    //         outOfBandRecord.push(streamRecord);
    //     }

    //     output = output.replace(newlineRegex, '');
    // }

    // if (match = resultRecordRegex.exec(output)) {
    //     output = output.substr(match[0].length);
    //     if (match[1] && token === undefined) {
    //         token = parseInt(match[1]);
    //     }
    //     resultRecords = {
    //         resultClass: match[2],
    //         results: []
    //     };
    //     let result;
    //     while (result = parseCommaResult()) {
    //         resultRecords.results.push(result);
    //     }

    //     output = output.replace(newlineRegex, '');
    // }

    return miObject;
    // return new MINode(token, outOfBandRecord as any || [], resultRecords);
}
