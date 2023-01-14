import {Request, Response} from "express";
import {RouteMethod} from "../types/RouteMethod";
import {RouteDescriptor} from "../types/RouteDescriptor";
import { TSXConnectServiceSingleton} from "../services/TSXConnectService";
import {StatusCodes} from "http-status-codes";
import {CommandsService, CommandsServiceSingleton} from "../services/CommandsService";

const briefSettingOnly = 2 * 1000;

export class SetCoolingRoute implements RouteDescriptor {

    path = '/api/setcooling/:status/:temperature?';
    method = RouteMethod.getMethod;

    async handler(req: Request, res: Response): Promise<void> {
        const status: string = req.params.status.toLowerCase();
        const temperature: string = req.params.temperature;

        //  Validate parameters
        if ((status !== 'on') && (status !== 'off')) {
            res.status(StatusCodes.BAD_REQUEST).send(`Status must be 'on' or 'off'`);
        } else if ((status === 'on') && (typeof temperature === 'undefined')) {
            res.status(StatusCodes.BAD_REQUEST).send(`Missing temperature`);
        } else if ((status === 'on') && isNaN(Number(temperature))) {
            res.status(StatusCodes.BAD_REQUEST).send(`Invalid temperature: ${temperature}`);
        } else {
            //  Send cooling command to server
            const tsxService = new TSXConnectServiceSingleton().getInstance();
            const commandsService: CommandsService = new CommandsServiceSingleton().getInstance();
            try {
                // console.log('checking server health');
                if (await tsxService.serverHealthy()) {
                    // console.log('Server reports healthy');
                    const command = commandsService.setCooling(status, temperature);
                    console.log('Cooling command: ');
                    console.log(command);
                    await tsxService.sendAndReceive(command, briefSettingOnly);
                    const statusSuffix = (status === 'on' ? ', temperature ' + temperature : '');
                    res.status(StatusCodes.OK).send(`Set cooling ${status}${statusSuffix} `);
                }
            } catch (err: any) {
                res.status(StatusCodes.SERVICE_UNAVAILABLE).send(err.message);
            } finally {
                tsxService.close();
            }
        }
    }
}
