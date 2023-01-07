//  Service to generate command strings for TheSkyX for various functions.


let globalCommandsServiceInstance: CommandsService | null = null

//  TSXConnectService is a singleton - only one is ever created
export class CommandsServiceSingleton {
    constructor() {
    }

    getInstance(): CommandsService {
        if (globalCommandsServiceInstance) {
            // console.log('Already have CommandsService instance, using that');
        } else {
            // console.log('No CommandsService instance exists yet, creating one.');
            globalCommandsServiceInstance = new CommandsService();
        }
        return globalCommandsServiceInstance!;
    }
}

export class CommandsService {

    captureBiasFrame(binning: number): string {
        // console.log('captureBiasFrame, binning: ', binning);
        // console.log(' Returning command: ', command);
        return "ccdsoftCamera.Autoguider=false;"        //  Use main camera
            + "ccdsoftCamera.Asynchronous=false;"   //  Wait for camera?
            + "ccdsoftCamera.Frame=2;"              //  Bias frame
            + "ccdsoftCamera.ImageReduction=0;"       // No autodark or calibration
            + "ccdsoftCamera.ToNewWindow=false;"      // Reuse window, not new one
            + "ccdsoftCamera.ccdsoftAutoSaveAs=0;"    //  0 = FITS format
            + "ccdsoftCamera.AutoSaveOn=false;"
            + `ccdsoftCamera.BinX=${binning};`
            + `ccdsoftCamera.BinY=${binning};`
            + "ccdsoftCamera.ExposureTime=0;"
            + "var cameraResult = ccdsoftCamera.TakeImage();"
            + 'var Out;Out=cameraResult+"\\n";\n';
    }
}
