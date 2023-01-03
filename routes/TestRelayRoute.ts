import {Request, Response} from "express";
import {RouteMethod} from "../types/RouteMethod";
import {RouteDescriptor} from "../types/RouteDescriptor";

export class TestRelayRoute implements RouteDescriptor  {

    path = '/api/testrelay';
    method = RouteMethod.getMethod;

    handler(req: Request, res: Response): void {
        res.status(200).send('Relay Success');
    }
};
