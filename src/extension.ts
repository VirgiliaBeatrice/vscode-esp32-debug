'use strict';

import * as vscode from 'vscode';
import { WorkspaceFolder, DebugConfiguration, ProviderResult, CancellationToken } from 'vscode';
import { AdapterOutputEvent } from "./esp";
// import * as Net from 'net';

/*
 * Set the following compile time flag to true if the
 * debug adapter should run inside the extension host.
 * Please note: the test suite does no longer work in this mode.
 */

class ESPDebugExtention {
    private adapterOutputChannelServer: vscode.OutputChannel = undefined;
    private adapterOutputChannelDebugger: vscode.OutputChannel = undefined;

    constructor(private context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.commands.registerCommand('extension.esp32-debug.getPrgramName', (config) => {
                return vscode.window.showInputBox({
                    placeHolder: "Please enter the name of a markdown file in the workspace folder",
                    value: "readme.md"
                });
            })
        );

        context.subscriptions.push(
            vscode.debug.onDidReceiveDebugSessionCustomEvent(this.onReceivedCustomEvent.bind(this))
        );

        context.subscriptions.push(
            vscode.debug.registerDebugConfigurationProvider('esp32-debug', new ESPDebugConfigurationProvider())
        );
    }

    private onReceivedCustomEvent(e: any) {
        if ((e as AdapterOutputEvent).event === 'adapter-output') {
            let output: string = e.body.content;

            if (!output.endsWith('\n')) {
                output += '\n';
            }

            if (e.body.source === "Subprocess for GDB Server Instance"){
                if (!this.adapterOutputChannelServer)
                {
                    this.adapterOutputChannelServer = vscode.window.createOutputChannel('Adapter Output - [Server]');
                }
                this.adapterOutputChannelServer.append (output);
            }
            else if (e.body.source === "Subprocess for GDB Debugger Instance")
            {
                if (!this.adapterOutputChannelDebugger)
                {
                    this.adapterOutputChannelDebugger = vscode.window.createOutputChannel("Adapter Output - [Debugger]");
                }
                this.adapterOutputChannelDebugger.append(output);
            }
        }
    }
}


export function activate(context: vscode.ExtensionContext) {
    const ext = new ESPDebugExtention(context);

    // context.subscriptions.push(vscode.commands.registerCommand('extension.esp32-debug.getProgramName', config =>
    // {
    // 	return vscode.window.showInputBox({
    // 		placeHolder: "Please enter the name of a markdown file in the workspace folder",
    // 		value: "readme.md"
    // 	});
    // }));

    // // register a configuration provider for 'ESP' debug type
    // const provider = new ESPDebugConfigurationProvider()
    // context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('esp32-debug', provider));
    // context.subscriptions.push(provider);
}

export function deactivate() {
    // nothing to do
}

class ESPDebugConfigurationProvider implements vscode.DebugConfigurationProvider {
    /**
     * Massage a debug configuration just before a debug session is being launched,
     * e.g. add all missing attributes to the debug configuration.
     */
    resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration>
    {

        // if launch.json is missing or empty
        if (!config.type && !config.request && !config.name)
        {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'markdown')
            {
                config.type = 'esp32-debug';
                config.name = 'Launch';
                config.request = 'launch';
                config.program = '${file}';
                config.stopOnEntry = true;
            }
        }

        if (!config.program)
        {
            return vscode.window.showInformationMessage("Cannot find a program to debug").then(_ =>
            {
                return undefined;	// abort launch
            });
        }

        return config;
    }

    dispose() {}
}

