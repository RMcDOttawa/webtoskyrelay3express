import {Request, Response} from "express";
import {RouteMethod} from "../types/RouteMethod";
import {RouteDescriptor} from "../types/RouteDescriptor";
import { TSXConnectServiceSingleton} from "../services/TSXConnectService";
import {StatusCodes} from "http-status-codes";
import {CommandsService, CommandsServiceSingleton, TSXSync} from "../services/CommandsService";

const briefTimeoutStartingAsyncOperation = 2 * 1000;

export class AcquireRoute implements RouteDescriptor {

    path = '/api/acquire/:type/:binning/:exposure?';
    method = RouteMethod.getMethod;

    async handler(req: Request, res: Response): Promise<void> {
        console.log('Handling acquire endpoint');
        const type = req.params.type.toLowerCase();
        const binning = req.params.binning;
        const exposure = req.params.exposure;
        console.log('  Type parameter: ', type);
        console.log('  Binning parameter: ', binning);
        console.log('  Exposure parameter: ', exposure);
        if (isNaN(Number(binning))) {
            res.status(StatusCodes.BAD_REQUEST).send(`Binning value ${binning} is not a number`);
        } else if (type !== 'dark' && type !== 'bias') {
            res.status(StatusCodes.BAD_REQUEST).send(`Type must be "dark" or "bias" not "${type}"`);
        } else if (type === 'bias' && typeof exposure !== 'undefined') {
            res.status(StatusCodes.BAD_REQUEST).send(`Do not specify exposure length with bias frame`);
        } else if (type === 'dark' && typeof exposure === 'undefined') {
            res.status(StatusCodes.BAD_REQUEST).send(`Exposure length is required for dark frame`);
        } else if (type === 'dark' && isNaN(Number(exposure))) {
            res.status(StatusCodes.BAD_REQUEST).send(`Dark frame exposure must be a number, not "${exposure}"`);
        } else {
            const binningValue = Number(binning);
            const tsxService = new TSXConnectServiceSingleton().getInstance();
            const commandsService: CommandsService = new CommandsServiceSingleton().getInstance();
            try {
                let message = '', suffix = '', errorCode = 0;
                console.log('checking server health');
                if (await tsxService.serverHealthy()) {
                    console.log('Server reports healthy');
                    if (type === 'dark') {
                        console.log(`Starting dark frame, ${exposure} seconds binned ${binningValue}`);
                        const captureDarkCommand = commandsService.captureDarkFrame(binningValue,
                            Number(exposure),TSXSync.async, true);
                        console.log('  Dark capture command: ', captureDarkCommand);
                        let { message, errorCode } = await tsxService.sendAndReceive(captureDarkCommand,
                            briefTimeoutStartingAsyncOperation);
                        console.log(`Dark frame command returned code ${errorCode}, message: `, message);
                    } else {
                        console.log(`Starting bias frame, binned ${binningValue}`);
                        const captureBiasCommand = commandsService.captureBiasFrame(binningValue,
                            TSXSync.async, true);
                        console.log('  Bias capture command: ', captureBiasCommand);
                        let { message, errorCode } = await tsxService.sendAndReceive(captureBiasCommand,
                            briefTimeoutStartingAsyncOperation);
                        console.log(`Bias frame command returned code ${errorCode}, message: `, message);
                    }
                    if (errorCode === 0) {
                        res.status(StatusCodes.OK).send("OK");
                    }
                } else {
                    res.status(StatusCodes.SERVICE_UNAVAILABLE).send(message + suffix);
                }
            } catch (err: any) {
                res.status(StatusCodes.SERVICE_UNAVAILABLE).send(err.message);
            }
            tsxService.close();
        }
    }
}
