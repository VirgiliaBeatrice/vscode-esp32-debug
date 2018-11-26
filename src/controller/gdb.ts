// import { Event } from "vscode-debugadapter";
import { DebugProtocol } from "vscode-debugprotocol";
import { EventEmitter } from "events";

export interface LaunchConfigurationArgs extends DebugProtocol.LaunchRequestArguments {
	program: string;
	serverDir: string;
	serverExecutable: string;
	serverArgs: string[];
	openocdSearchDir: string[];
	openocdConfigFiles: string[];
	debuggerExecutable: string;
	debuggerDir: string;
	msysDir: string;
}

export interface GDBServerController extends EventEmitter {
	port: number;
	name: string;

	setPort(port: number): void;
	setArgs(args: LaunchConfigurationArgs): void;

	initCmds(): string[];
	launchCmds(): string[];
	// attachCmds(): string[];
	restartCmds(): string[];
	serverRoot(): string;
	serverApplication(): string;
	serverExecutable(): string;
	serverArgs(): string[];
	additionalEnv(): object;

	debuggerRoot(): string;
	debuggerApplication(): string;
	debuggerArgs(): string[];

	serverLaunchStarted(): void;
	serverLaunchCompleted(): void;
	debuggerLaunchStarted(): void;
	debuggerLaunchCompleted(): void;
}