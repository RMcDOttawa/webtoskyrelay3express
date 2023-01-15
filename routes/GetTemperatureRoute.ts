import {Request, Response} from "express";
import {RouteMethod} from "../types/RouteMethod";
import {RouteDescriptor} from "../types/RouteDescriptor";
import {TSXConnectService, TSXConnectServiceSingleton} from "../services/TSXConnectService";
import {StatusCodes} from "http-status-codes";
import {CommandsService, CommandsServiceSingleton} from "../services/CommandsService";

const shortTimeoutSimpleInfo = 2 * 1000;

export class GetTemperatureRoute implements RouteDescriptor {

    path = '/api/gettemperature';
    method = RouteMethod.getMethod;

    async handler(req: Request, res: Response): Promise<void> {
        const tsxService: TSXConnectService = new TSXConnectServiceSingleton().getInstance();
        if (tsxService) {
            const commandsService: CommandsService = new CommandsServiceSingleton().getInstance();
            const getTemperatureCommand = commandsService.getTemperature();
            console.log('Sending get-temperature command: ', getTemperatureCommand);
            try {
                const {message, suffix, errorCode} = await tsxService.sendAndReceive(getTemperatureCommand, shortTimeoutSimpleInfo);
                if (errorCode == 0) {
                    res.status(StatusCodes.OK).send(message);
                } else {
                    res.status(StatusCodes.SERVICE_UNAVAILABLE).send(message + suffix);
                }
            } catch (err: any) {
                res.status(StatusCodes.SERVICE_UNAVAILABLE).send(err.message);
            } finally {
                tsxService.close();
            }
        } else {
            res.status(StatusCodes.SERVICE_UNAVAILABLE).send('Unable to connect to TheSkyX');
        }
    }
}
