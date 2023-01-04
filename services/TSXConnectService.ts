import * as net from "net";
import {Socket} from "net";

//  Service to manage network connection with TheSkyX
//  Decorated as a Service so it can be dependency-injected into Route handlers that need it.

const portNumber: number = Number.isInteger(process.env.TSXPORT) ? Number(process.env.TSXPORT) : 3040;
const tsxHost: string = process.env.TSXHOST ? process.env.TSXHOST : 'localhost';

const TSXPrefix =
    '/* Java Script */\n' +
    '/* Socket Start Packet */\n';

const TSXSuffix = '/* Socket End Packet */\n';

export class TSXConnectService {
    socket: Socket | null = null;

    //  Establish net connection in promise form so we can wait for it to succesd
    establishConnection(hostName: string, port: number): Promise<net.Socket> {
        return new Promise ((resolve, reject) => {
            const socket = net.connect(port, hostName, () => {
                // console.log('establishConnection/connect listener called');
            });
            socket.on('connect', () => {
                // console.log('  connect callback called');
                resolve(socket);
            });
            socket.on('error', () => {
                // console.log('  connect error callback called');
                reject('Error on socket.connect');
            });
        });
    }

    //  Send the given command (wrapping it in special javascript comments as TSX requires),
    //  returning a promise of results.  The promise, when resolved, parses the response
    //  and returns a 3-ple of the text message, the suffix, and the error code
    async sendAndReceive(command: string): Promise<TSXResponseParts> {
        console.log('TSXConnectService/sendAndReceive entered');
        console.log('  Establishing connection');
        this.socket = await this.establishConnection(tsxHost, portNumber);
        // console.log('  Socket = ', this.socket);

        return new Promise((resolve, reject) => {

            //  Listen for data coming back from the server. This will resolve the promise
            this.socket!.on('data', (dataBuffer) => {
                const responseString = dataBuffer.toString();
                const parsedParts: TSXResponseParts = this.parseResponseParts(responseString);
                console.log('data event received: ', responseString);
                console.log('  resolving promise with 3ple: ', parsedParts);
                resolve(parsedParts);
            });

            //  If we get an error back from the server we'll reject the promise
            this.socket!.on('error', (error) => {
                console.log('server error received: ', error);
                reject(error);
            })

            //  Send the message to the server
            this.socket!.write(  this.encapsulateJsForTheSky(command + ";\n"), () => {
                console.log('SendAndReceive write callback: write is complete.')
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
            this.socket.destroy();
        }
    }
}
