import {Request, Response} from "express";
import {RouteMethod} from "../types/RouteMethod";
import {RouteDescriptor} from "../types/RouteDescriptor";
import {TSXConnectService, TSXConnectServiceSingleton} from "../services/TSXConnectService";
import {StatusCodes} from "http-status-codes";
import {CommandsService, CommandsServiceSingleton} from "../services/CommandsService";

const briefTimeoutStatusCheckOnly = 2 * 1000;
//  Ask TSX if it is (still) busy waiting while the camera is exposing an image

export class IsExposingRoute implements RouteDescriptor  {

    path = '/api/exposing';
    method = RouteMethod.getMethod;

    async handler(req: Request, res: Response): Promise<void> {
        console.log('IsExposingRoute route');
        const tsxService: TSXConnectService = new TSXConnectServiceSingleton().getInstance();
        const commandsService: CommandsService = new CommandsServiceSingleton().getInstance();
        const exposureCompleteCommand = commandsService.exposureCompleteCommand();
        console.log('  Using command: ', exposureCompleteCommand);
        try {
            let { message } = await tsxService.sendAndReceive(exposureCompleteCommand,
                briefTimeoutStatusCheckOnly);
            // console.log(`Exposure complete command returned code ${errorCode}, message: `, message);
            const exposureComplete = (Number(message) === 1);
            const isExposing = !exposureComplete;
            res.status(StatusCodes.OK).send({exposing: isExposing});
        } catch (err: any) {
            // console.log('command failed: ', err);
            res.status(StatusCodes.SERVICE_UNAVAILABLE).send(err.message);
        }
        tsxService.close();
    }
}
