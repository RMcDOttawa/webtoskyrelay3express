import {Request, Response} from "express";
import {RouteMethod} from "../types/RouteMethod";
import {RouteDescriptor} from "../types/RouteDescriptor";
import {TSXConnectService, TSXConnectServiceSingleton} from "../services/TSXConnectService";
import {StatusCodes} from "http-status-codes";
import {CommandsService, CommandsServiceSingleton, TSXSync} from "../services/CommandsService";

const longTimeoutBiasFrame = 60 * 1000;

export class TimeDownloadRoute implements RouteDescriptor {

    path = '/api/timedownload/:binning';
    method = RouteMethod.getMethod;

    async handler(req: Request, res: Response): Promise<void> {
        // console.log('Handling timedownload endpoint');
        const binning = req.params.binning;
        // console.log('  Binning parameter: ', binning);
        if (isNaN(Number(binning))) {
            res.status(StatusCodes.BAD_REQUEST).send(`Binning value ${binning} is not a number`);
        } else {
            const binningValue = Number(binning);
            const tsxService: TSXConnectService = new TSXConnectServiceSingleton().getInstance();

            //  Get command string to capture a bias frame with the specified binning
            const commandsService: CommandsService = new CommandsServiceSingleton().getInstance();
            const captureBiasCommand = commandsService.captureBiasFrame(binningValue, TSXSync.sync, false);

            try {
                if (await tsxService.serverHealthy()) {
                    console.log('Server reports healthy');
                    const timeBeforeCapture = new Date();
                    console.log('Asking for bias frame: ', captureBiasCommand);
                    const {message, suffix, errorCode } = await tsxService.sendAndReceive(captureBiasCommand, longTimeoutBiasFrame);
                    const timeNow = new Date();
                    const elapsedTime = (timeNow.getTime() - timeBeforeCapture.getTime()) / 1000.0;
                    if (errorCode == 0) {
                        res.status(200).send({time: elapsedTime});
                    } else {
                        res.status(StatusCodes.SERVICE_UNAVAILABLE).send(message + suffix);
                    }
                } else {
                    res.status(StatusCodes.SERVICE_UNAVAILABLE).send('Server not responding');
                }
            } catch (err: any) {
                res.status(StatusCodes.SERVICE_UNAVAILABLE).send(err.message);
            }
            tsxService.close();
        }
    }
}
