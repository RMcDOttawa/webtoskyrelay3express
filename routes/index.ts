import {TestRelayRoute} from "./TestRelayRoute";
import {TestTSXRoute} from "./TestTSXRoute";
import {SendRawTextRoute} from "./SendRawTextRoute";
import {GetAutosavePathRoute} from "./GetAutosavePathRoute";

export const routes = [
    new TestRelayRoute(),
    new TestTSXRoute(),
    new SendRawTextRoute(),
    new GetAutosavePathRoute(),
];
