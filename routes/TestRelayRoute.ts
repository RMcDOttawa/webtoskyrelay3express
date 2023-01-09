import {Request, Response} from "express";
import {RouteMethod} from "../types/RouteMethod";
import {RouteDescriptor} from "../types/RouteDescriptor";
import {StatusCodes} from "http-status-codes";

export class TestRelayRoute implements RouteDescriptor  {

    path = '/api/testrelay';
    method = RouteMethod.getMethod;

    handler(req: Request, res: Response): void {
        res.status(StatusCodes.OK).send('Relay Success');
    }
}
