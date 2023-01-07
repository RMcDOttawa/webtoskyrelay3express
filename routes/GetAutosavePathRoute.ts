import {Request, Response} from "express";
import {RouteMethod} from "../types/RouteMethod";
import {RouteDescriptor} from "../types/RouteDescriptor";
import {TSXConnectService, TSXConnectServiceSingleton} from "../services/TSXConnectService";
import {StatusCodes} from "http-status-codes";

const getAutosavePathCommand = "var path=ccdsoftCamera.AutoSavePath;\n"
    + "var Out;\n"
    + "Out=path;\n";

export class GetAutosavePathRoute implements RouteDescriptor {

    path = '/api/getautosavepath';
    method = RouteMethod.getMethod;

    async handler(req: Request, res: Response): Promise<void> {
        const tsxService: TSXConnectService = new TSXConnectServiceSingleton().getInstance();
        if (tsxService) {
            console.log('Sending get-autosave command: ', getAutosavePathCommand);
            try {
                const {message, suffix, errorCode} = await tsxService.sendAndReceive(getAutosavePathCommand);
                console.log('  Message returned: ', message);
                if (errorCode == 0) {
                    res.status(200).send(message);
                } else {
                    res.status(StatusCodes.SERVICE_UNAVAILABLE).send(message + suffix);
                }
            } catch (err: any) {
                res.status(StatusCodes.SERVICE_UNAVAILABLE).send(err.message);
            }
            tsxService.close();
        } else {
            res.status(StatusCodes.SERVICE_UNAVAILABLE).send('Unable to connect to TheSkyX');
        }
    }
}
