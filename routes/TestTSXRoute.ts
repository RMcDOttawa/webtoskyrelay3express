import {Request, Response} from "express";
import {RouteMethod} from "../types/RouteMethod";
import {RouteDescriptor} from "../types/RouteDescriptor";
import {TSXConnectService, TSXConnectServiceSingleton} from "../services/TSXConnectService";
import {StatusCodes} from "http-status-codes";


export class TestTSXRoute implements RouteDescriptor  {

    path = '/api/testtsx';
    method = RouteMethod.getMethod;

    async handler(req: Request, res: Response): Promise<void> {
        const tsxService: TSXConnectService = new TSXConnectServiceSingleton().getInstance();
        try {
            if (await tsxService.serverHealthy()) {
                    res.status(StatusCodes.OK).send('TSX Success');
            } else {
                res.status(StatusCodes.SERVICE_UNAVAILABLE).send('Server not responding');
            }
        } catch (err: any) {
            res.status(StatusCodes.SERVICE_UNAVAILABLE).send(err.message);
        }
        tsxService.close();
    }
}
