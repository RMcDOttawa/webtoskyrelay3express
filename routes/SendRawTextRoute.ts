import {Request, Response} from "express";
import {RouteMethod} from "../types/RouteMethod";
import {RouteDescriptor} from "../types/RouteDescriptor";
import {TSXConnectService} from "../services/TSXConnectService";
import {StatusCodes} from "http-status-codes";

export class SendRawTextRoute implements RouteDescriptor  {

    path = '/api/sendtext';
    method = RouteMethod.postMethod;

    async handler(req: Request, res: Response): Promise<void> {
        const tsxService: TSXConnectService = new TSXConnectService();
        try {
            console.log('SendRawTextRoute. Request body = ', req.body);
            const textToSend = req.body.message;
            console.log(`  textToSend = '${textToSend}'`);
            const {message, suffix, errorCode} = await tsxService.sendAndReceive(textToSend);
            res.status(200).send(message + suffix);
        } catch (err: any) {
            res.status(StatusCodes.SERVICE_UNAVAILABLE).send(err.message);
        }
        tsxService.close();
    }
}
