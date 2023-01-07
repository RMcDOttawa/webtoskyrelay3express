import {Request, Response} from "express";
import {RouteMethod} from "../types/RouteMethod";
import {RouteDescriptor} from "../types/RouteDescriptor";
import {TSXConnectService, TSXConnectServiceSingleton} from "../services/TSXConnectService";
import {StatusCodes} from "http-status-codes";

export class TimeDownloadRoute implements RouteDescriptor  {

    path = '/api/timedownload/:binning';
    method = RouteMethod.getMethod;

    async handler(req: Request, res: Response): Promise<void> {
        console.log('Handling timedownload endpoint');
        const binning = req.params.binning;
        const tsxService: TSXConnectService = new TSXConnectServiceSingleton().getInstance();
        const captureBiasCommand = 'var Out;\n' +
            'Out="TheSky Build=" + Application.build\n';
        // const commandService:
        // const captureBiasCommand =
        // console.log('   Sending command: ', captureBiasCommand);
        try {
            const timeBeforeCapture = new Date();
            const {message, suffix} = await tsxService.sendAndReceive(captureBiasCommand);
            console.log('  message: ', message);
            console.log('  suffix: ', suffix);
            const timeNow = new Date();
            const elapsedTime = (timeNow.getTime() - timeBeforeCapture.getTime()) / 1000.0;
            console.log('   Calculated elapsed time: ', elapsedTime);
            res.status(200).send({time: elapsedTime});
            // if (errorCode == 0 && message.startsWith('TheSky Build=')) {
            //     res.status(200).send('TSX Success');
            // } else {
            //     res.status(StatusCodes.SERVICE_UNAVAILABLE).send(message + suffix);
            // }
        } catch (err: any) {
            res.status(StatusCodes.SERVICE_UNAVAILABLE).send(err.message);
        }
        tsxService.close();
        res.status(200).send('Time download binned ' + binning);
    }
}
