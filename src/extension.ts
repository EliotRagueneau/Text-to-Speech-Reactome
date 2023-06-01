// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {TextToSpeechClient} from "@google-cloud/text-to-speech";
import * as fs from 'fs';
import * as util from 'util';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "reactome-text-to-speech" is now active!');


    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('reactome-text-to-speech.synthesize', async (args) => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        const path = args.path;
        const content = fs.readFileSync(path).toString();
        const input = path.endsWith("ssml") ? {ssml: content} : {text: content};
        const configuration = vscode.workspace.getConfiguration("reactomeTextToSpeech");
        const client = new TextToSpeechClient({
            credentials: {
                client_email: configuration.credentials.mail,
                private_key: configuration.credentials.privateKey.replaceAll("\\n", "\n")
            }
        });

		console.log("Synthesizing");
        // Performs the text-to-speech request
        const [response] = await client.synthesizeSpeech(
            {
                input: input,
                voice: {
                    languageCode: configuration.parameters.languageCode,
                    name: configuration.parameters.name
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    pitch: configuration.parameters.pitch, // between -20 and 20
                    speakingRate: configuration.parameters.speakingRate // between 0.25 and 4
                }
            }
        );
        // Write the binary audio content to a local file
        const writeFile = util.promisify(fs.writeFile);
        await writeFile(path.replace(/\.\w+$/g, ".mp3") || "", response.audioContent as string, 'binary');
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
}
