import * as net from "net";
import {Socket} from "net";
import {CommandsService, CommandsServiceSingleton} from "./CommandsService";

//  Service to manage network connection with TheSkyX

const portNumber: number = Number.isInteger(process.env.TSXPORT) ? Number(process.env.TSXPORT) : 3040;
const tsxHost: string = process.env.TSXHOST ? process.env.TSXHOST : 'localhost';

const TSXPrefix =
    '/* Java Script */\n' +
    '/* Socket Start Packet */\n';


const TSXSuffix = '/* Socket End Packet */\n';

let globalTSXConnectInstance: TSXConnectService | null = null

//  TSXConnectService is a singleton - only one is ever created
export class TSXConnectServiceSingleton {

    getInstance(): TSXConnectService {
        if (globalTSXConnectInstance) {
            // console.log('Already have TSXConnectService instance, using that');
        } else {
            // console.log('No TSXConnectService instance exists yet, creating one.');
            globalTSXConnectInstance = new TSXConnectService();
        }
        return globalTSXConnectInstance!;
    }
}

export class TSXConnectService {
    socket: Socket | null = null;
    commandsService: CommandsService;

    constructor() {
        this.commandsService = new CommandsServiceSingleton().getInstance();
    }

    //  Establish net connection in promise form, so we can wait for it to succeed
    establishConnection(hostName: string, port: number, timeOut: number): Promise<net.Socket> {
        // console.log(`establishConnection(${hostName},${port}) entered`);
        return new Promise ((resolve, reject) => {
            this.socket = new net.Socket();
            this.socket.setTimeout(timeOut);
            // console.log('  Setting up event handlers');
            this.socket.on('timeout', () => {
                this.socket!.emit('error', new Error('ETIMEDOUT'));
            });
            this.socket.on('connect', () => {
                // console.log('  connect callback called');
                resolve(this.socket!);
            });
            this.socket.on('error', () => {
                // console.log('  connect error callback called');
                reject('Error on socket.connect');
            });
            // console.log('  Connecting');
            this.socket.connect(port, hostName, () => {
                // console.log('establishConnection/connect listener called');
            });
        });
    }

    //  Send the given command (wrapping it in special javascript comments as TSX requires),
    //  returning a promise of results.  The promise, when resolved, parses the response
    //  and returns a 3-ple of the text message, the suffix, and the error code
    async sendAndReceive(command: string, timeout: number): Promise<TSXResponseParts> {
        // console.log('TSXConnectService/sendAndReceive entered');
        // console.log('  Establishing connection');
        this.socket = await this.establishConnection(tsxHost, portNumber, timeout);
        // console.log('  Socket = ', this.socket);

        return new Promise((resolve, reject) => {

            //  Listen for data coming back from the server. This will resolve the promise
            this.socket!.on('data', (dataBuffer) => {
                const responseString = dataBuffer.toString();
                const parsedParts: TSXResponseParts = this.parseResponseParts(responseString);
                // console.log('data event received: ', responseString);
                // console.log('  resolving promise with 3ple: ', parsedParts);
                resolve(parsedParts);
            });

            //  If we get an error back from the server we'll reject the promise
            this.socket!.on('error', (error) => {
                // console.log('server error received: ', error);
                reject(error);
            })

            //  Send the message to the server
            this.socket!.write(  this.encapsulateJsForTheSky(command + ";\n"), () => {
                // console.log('SendAndReceive write callback: write is complete.')
            });
        })
    }

    encapsulateJsForTheSky(textToSend: string) {
        return TSXPrefix + textToSend + TSXSuffix;
    }

    //  Parse the given TSX server response, which is usually in the form: Message|error info
    //  example: TheSky Build=12978|No error. Error = 0.
    //  and return the message and error info separately.
    //  Returns an object with attributes:
    //      message            The message before the |
    //      error suffix       The error info after the |
    //      error code         The error number, if present.

    parseResponseParts(stringFromServer: string): TSXResponseParts {
        const parts = stringFromServer.split('|');
        let message = '';
        let errorSuffix = '';
        let errorCode = 0;
        if (parts.length > 0) message = parts[0];
        if (parts.length > 1) errorSuffix = parts[1];
        const errorParts = errorSuffix.split('Error =');
        if (errorParts.length > 1) {
            errorCode = Number(errorParts[1]);
        }
        return {message: message, suffix: errorSuffix, errorCode: errorCode};
    }

    close() {
        if (this.socket) {
            // console.log('closing connection');
            this.socket.destroy();
            this.socket = null;
        }
    }

    //  Do a quick check whether the server is healthy and responsive by asking it for
    //  its build level
    async serverHealthy(): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            // console.log('serverHealth called');
            const shortTimeoutSimpleInfo = 5 * 1000;
            const trivialCommand = this.commandsService.getServerBuildCommand();
            try {
                const {message, errorCode} = await this.sendAndReceive(trivialCommand, shortTimeoutSimpleInfo);
                if (errorCode == 0 && message.startsWith('TheSky Build=')) {
                    resolve(true);
                    this.close();
                } else {
                    resolve(false);
                    this.close();
                }
            } catch (error) {
                resolve(false);
                this.close();
            }
        })
    }
}
