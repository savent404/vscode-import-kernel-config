// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "linux-config-import" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.import', () => {

		if (vscode.workspace.rootPath === undefined) {
			return;
		}
		let configFile = path.join(vscode.workspace.rootPath, ".config");

		// try to find linux .config file first
		if (!fs.existsSync(configFile)) {
			vscode.window.showInformationMessage(`can't find config file`);
		}
		let reader = readline.createInterface(fs.createReadStream(configFile));
		let result:Array<string> = [];
		let v:RegExpExecArray | null;
		let regexInvalide = /^#/;
		let regexValide = /^(\w+)=y/;
		let regexNumber = /^(\w+)=(\d+)/;
		let regexModule = /^(\w+)=m/;
		let regexString = /^(\w+)=\"(.+)\"/;
		reader.on('line', (l:string) => {
			if (regexInvalide.test(l)) {
			}
			else if (regexValide.test(l)) {
				v = regexValide.exec(l);
				if (v !== null) {
					result.push(v[1]);
				}
			}
			else if (regexModule.test(l)) {
				v = regexValide.exec(l);
				if (v !== null) {
					result.push(v[1]);
				}
			}
			else if (regexNumber.test(l)) {
				result.push(l);
			}
			else if (regexString.test(l)) {
				result.push(l);
			}
		});
		reader.on('close', () => {
			// check if .vscode/c_cpp_properties.json exists?
			if (vscode.workspace.rootPath === undefined) {
				return;
			}
			configFile = path.join(vscode.workspace.rootPath, '.vscode/c_cpp_properties.json');
			let obj;
			if (!fs.existsSync(configFile)) {
				obj = {
					configurations: [
						{
							defines: [],
							cStandard: "c89"
						}
					]
				};
			} else {
				let d = fs.readFileSync(configFile);
				obj = JSON.parse(d.toString());
			}
			obj.configurations[0].defines = result;
			fs.writeFileSync(configFile, JSON.stringify(obj, null, 4));
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
