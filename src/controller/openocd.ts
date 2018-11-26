import { GDBServerController, LaunchConfigurationArgs } from "./gdb";
import { EventEmitter } from "events";
import * as Path from "path";

export class OpenOCDDebugController extends EventEmitter implements GDBServerController {
	// public port = 4444;
	public name = 'OpenOCD-ESP32';

	private args: LaunchConfigurationArgs;

	constructor(public port: number) {
		super();
	}

	public setPort(port: number): void {
		this.port = port;
	}

	public setArgs(args: LaunchConfigurationArgs): void {
		this.args = args;
	}

	public run(): void {

	}

	public connectCmd(port?: number): string[] {
		return [
			`target-select remote localhost:${port}`
		];
	}

	public loadSymbolCmd(symbolFilePath: string): string[] {
		return [
			`file-exec-and-symbols ${symbolFilePath}`
		];
	}

	public resetCmd(): string[] {
		return [
			"interpreter-exec console \"monitor reset halt\""
		];
	}

	public setBreakpointCmd(symbol: string): string[] {
		return [
			`break-insert -t -h ${symbol}`
		];
	}

	public continueCmd(): string[] {
		return [
			"exec-continue"
		];
	}

	public initCmds(): string[] {
		return [
			`target-select extended-remote localhost:${this.port.toString()}`
		];
	}

	public launchCmds(): string[] {
		return [
			'interpreter-exec console "monitor reset halt"',
			'enable-pretty-printing'
		];
	}

	public restartCmds(): string[] {
		return [
			'interpreter-exec console "monitor reset halt"'
		];
	}

	public serverRoot(): string {
		return this.args.msysDir;
	}

	public serverApplication(): string {
		return Path.join(this.args.serverDir, this.args.serverExecutable);
	}

	public serverExecutable(): string {
		return 'openocd.exe';
	}

	public serverArgs(): string[] {
		let args: string[] = [];

		this.args.openocdSearchDir.forEach(
			(dir) => {
				args.push(...["-s", Path.join(this.args.msysDir, dir)]);
			}
		);

		this.args.openocdConfigFiles.forEach(
			(file) => {
				args.push(...["-f", file]);
			}
		);

		return args;
	}

	public debuggerRoot(): string {
		return this.args.msysDir;
	}

	public debuggerApplication(): string {
		return Path.join(this.args.msysDir, this.args.debuggerDir, this.args.debuggerExecutable);
	}

	public debuggerArgs(): string[] {
		let args: string[] = ["-q", "--interpreter=mi2"];
		args.push("-s", this.args.program);

		return args;
	}

	public additionalEnv(): object{
		return {
			root: this.args.msysDir,
			relPaths: [
				"mingw32\\bin",
				"usr\\local\\bin",
				"usr\\bin"
			],

		};

	}

	public serverLaunchStarted(): void {}
	public serverLaunchCompleted(): void {}
	public debuggerLaunchStarted(): void {}
	public debuggerLaunchCompleted(): void {}

}
