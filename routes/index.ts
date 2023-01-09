import {TestRelayRoute} from "./TestRelayRoute";
import {TestTSXRoute} from "./TestTSXRoute";
import {SendRawTextRoute} from "./SendRawTextRoute";
import {GetAutosavePathRoute} from "./GetAutosavePathRoute";
import {TimeDownloadRoute} from "./TimeDownloadRoute";
import {AcquireRoute} from "./AcquireRoute";
import {IsExposingRoute} from "./IsExposingRoute";
import {AbortExposureRoute} from "./AbortExposureRoute";

export const routes = [
    new TestRelayRoute(),
    new TestTSXRoute(),
    new SendRawTextRoute(),
    new GetAutosavePathRoute(),
    new TimeDownloadRoute(),
    new AcquireRoute(),
    new IsExposingRoute(),
    new AbortExposureRoute(),
];
