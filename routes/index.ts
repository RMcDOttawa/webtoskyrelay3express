import {TestRelayRoute} from "./TestRelayRoute";
import {TestTSXRoute} from "./TestTSXRoute";
import {SendRawTextRoute} from "./SendRawTextRoute";

export const routes = [
    new TestRelayRoute(),
    new TestTSXRoute(),
    new SendRawTextRoute(),
];
