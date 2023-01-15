import {Request, Response} from "express";
import {RouteMethod} from "../types/RouteMethod";
import {RouteDescriptor} from "../types/RouteDescriptor";
import {TSXConnectService, TSXConnectServiceSingleton} from "../services/TSXConnectService";
import {StatusCodes} from "http-status-codes";
import {CommandsService, CommandsServiceSingleton} from "../services/CommandsService";

const shortTimeoutSimpleInfo = 2 * 1000;

export class GetCoolerInfoRoute implements RouteDescriptor {

    path = '/api/coolerinfo';
    method = RouteMethod.getMethod;

    async handler(req: Request, res: Response): Promise<void> {
        const tsxService: TSXConnectService = new TSXConnectServiceSingleton().getInstance();
        if (tsxService) {
            const commandsService: CommandsService = new CommandsServiceSingleton().getInstance();
            const getCoolerInfoCommand = commandsService.getCoolerInfo();
            console.log('Sending get-cooler-info command: ', getCoolerInfoCommand);
            try {
                const {message, suffix, errorCode} = await tsxService.sendAndReceive(getCoolerInfoCommand, shortTimeoutSimpleInfo);
                console.log(` Result "${message}" code ${errorCode} suffix ${suffix}`);
                const parts = message.split(',');
                if (errorCode == 0) {
                    res.status(StatusCodes.OK).send({
                        temperature: Number(parts[0]),
                        power: Number(parts[1])});
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
