import {Request, Response} from "express";
import {RouteMethod} from "../types/RouteMethod";
import {RouteDescriptor} from "../types/RouteDescriptor";
import {TSXConnectService, TSXConnectServiceSingleton} from "../services/TSXConnectService";
import {StatusCodes} from "http-status-codes";
import {CommandsService, CommandsServiceSingleton} from "../services/CommandsService";

const briefTimeout = 2 * 1000;

export class AbortExposureRoute implements RouteDescriptor  {

    path = '/api/abortexposure';
    method = RouteMethod.getMethod;

    async handler(req: Request, res: Response): Promise<void> {
        const tsxService: TSXConnectService = new TSXConnectServiceSingleton().getInstance();
        const commandsService: CommandsService = new CommandsServiceSingleton().getInstance();
        const abortCommand = commandsService.abortExposure();
        try {
            let { message } = await tsxService.sendAndReceive(abortCommand, briefTimeout);
            res.status(StatusCodes.OK).send(message);
        } catch (err: any) {
            // console.log('command failed: ', err);
            res.status(StatusCodes.SERVICE_UNAVAILABLE).send(err.message);
        }
        tsxService.close();
    }
}
