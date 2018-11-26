export interface MIResult extends Object {
    token: number;
    resultClass: "done" | "running" | "connected" | "error" | "exit";
    result?: Array<any>;
    msg?: string;
    code?: string;
}

export interface MIStream {
    type: string;
    streamOutput: string;
}

export interface MIAsyncRecord {
    token: number | undefined;
    type: string;
    asyncClass: string | "stopped";
}

export interface MIAsyncOutput {
    asyncClass: string;

}

export interface MIResultDone {
    resultClass: "done";
    result?: Array<any>;
}

export interface MIResultRunning {
    resultClass: "running";
}

export interface MIResultConnected {
    resultClass: "connected";
}

export interface MIResultError {
    resultClass: "error";
    msg: string;
    code?: string;
}

export interface MIResultExit {
    resultClass: "exit";
}

export function instanceOfMIResult(object: any): object is MIResult {
    return "resultClass" in object;
}

export function instanceOfMIAsyncRecord(object: any): object is MIAsyncRecord {
    return "asyncClass" in object;
}

export function instanceOfMIStream(object: any): object is MIStream {
    return "streamOutput" in object;
}

export interface MIResultThread extends MIResult {
    threads: Array<any>;
    "current-thread-id"?: string;
}

export interface MIResultBacktrace extends MIResult {
    stack: Array<MIResultStackInfo>;
}

export interface MIResultStackVariables extends MIResult {
    // discriminator: "MIResultStackVariables";
    variables: Array<MIResultVariableInfo>;
}

export interface MIResultCreateVaraibleObject extends MIResult {
    name: string;
    numchild: string;
    value: string;
    type: string;
    "thread-id": string;
    has_more: string;
}

export interface MIResultListChildren extends MIResult {
    numchild: string;
    children: Array<MIResultVariablehildrenInfo>;
    has_more: string;
}

interface MIResultStackInfo {
    frame: MIResultFrameInfo;
}

interface MIResultFrameInfo {
    level: string;
    addr: string;
    func: string;
    args: Array<MIResultArgsInfo>;
    file: string;
    fullname: string;
    line: string;
}

interface MIResultArgsInfo {
    name: string;
    value: string;
}

interface MIResultVariableInfo {
    name: string;
    type: string;
    value?: string;
}

interface MIResultVariablehildrenInfo {
    child: MIResultChildInfo;
}
export interface MIResultChildInfo {
    name: string;
    exp: string;
    numchild: string;
    value: string;
    type: string;
    "thread-id": string;
}

export interface MIResultChangeListInfo {
    name: string;
    value: string;
    in_scope: string;
    type_changed: string;
    has_more: string;
}

// function parseMITextToMIObject(miText: string): Object {
// 	return
// }