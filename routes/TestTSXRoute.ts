import {Request, Response} from "express";
import {RouteMethod} from "../types/RouteMethod";
import {RouteDescriptor} from "../types/RouteDescriptor";
import {TSXConnectService, TSXConnectServiceSingleton} from "../services/TSXConnectService";
import {StatusCodes} from "http-status-codes";
import {CommandsService, CommandsServiceSingleton} from "../services/CommandsService";

const shortTimeoutHealthOnly = 2 * 1000;

export class TestTSXRoute implements RouteDescriptor  {

    path = '/api/testtsx';
    method = RouteMethod.getMethod;

    async handler(req: Request, res: Response): Promise<void> {
        const tsxService: TSXConnectService = new TSXConnectServiceSingleton().getInstance();
        const commandsService: CommandsService = new CommandsServiceSingleton().getInstance();
        const serverBuildCommand = commandsService.getServerBuildCommand();
        try {
            const {message, suffix, errorCode} = await tsxService.sendAndReceive(serverBuildCommand, shortTimeoutHealthOnly);
            if (errorCode == 0 && message.startsWith('TheSky Build=')) {
                res.status(200).send('TSX Success');
            } else {
                res.status(StatusCodes.SERVICE_UNAVAILABLE).send(message + suffix);
            }
        } catch (err: any) {
            res.status(StatusCodes.SERVICE_UNAVAILABLE).send(err.message);
        }
        tsxService.close();
    }
}
