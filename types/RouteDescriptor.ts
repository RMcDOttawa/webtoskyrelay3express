import {Request, Response} from "express";
import {RouteMethod} from "./RouteMethod";

export interface RouteDescriptor  {
    path: string;
    method: RouteMethod;
    handler: (req: Request, res: Response) => void;
};
