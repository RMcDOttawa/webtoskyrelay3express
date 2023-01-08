//  Service to generate command strings for TheSkyX for various functions.


let globalCommandsServiceInstance: CommandsService | null = null

export enum TSXSync {
    sync = 'sync',
    async = 'async'
}

// export enum FrameType {
//     dark = 'dark',
//     bias = 'bias'
// }

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

    //  Command to capture a single bias frame.
    //  Specify whether to wait or let it run async, and whether image is to be saved.
    captureBiasFrame(binning: number, sync: TSXSync, autosave: boolean): string {
        // console.log('captureBiasFrame, binning: ', binning);
        return "ccdsoftCamera.Autoguider=false;\n"        //  Use main camera
            + `ccdsoftCamera.Asynchronous=${sync === TSXSync.async};\n`   //  Wait for camera?
            + "ccdsoftCamera.Frame=2;\n"              //  Bias frame
            + "ccdsoftCamera.ImageReduction=0;\n"       // No autodark or calibration
            + "ccdsoftCamera.ToNewWindow=false;\n"      // Reuse window, not new one
            + "ccdsoftCamera.ccdsoftAutoSaveAs=0;\n"    //  0 = FITS format
            + `ccdsoftCamera.AutoSaveOn=${autosave};\n`
            + `ccdsoftCamera.BinX=${binning};\n`
            + `ccdsoftCamera.BinY=${binning};\n`
            + "ccdsoftCamera.ExposureTime=0;\n"
            + "var cameraResult = ccdsoftCamera.TakeImage();\n"
            + 'var Out;Out=cameraResult+"\\n";\n';
        // console.log(' Returning command: ', command);
        // return command;
    }

    //  Command to get the camera autosave path from TheSky
    getAutosavePath(): string {
        return  "var path=ccdsoftCamera.AutoSavePath;\n"
            + "var Out;\n"
            + "Out=path;\n";


    }

    getServerBuildCommand() {
        return 'var Out;\n' +
            'Out="TheSky Build=" + Application.build\n';
    }
}
