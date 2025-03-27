import { AppConfig, Balancy, Environment, Platform } from '@balancy/core';
import { FileHelperClassBrowser } from "./FileHelperClassBrowser";

export interface BalancyConfigParams {
    apiGameId: string;
    publicKey: string;
    environment: Environment;
    deviceId?: string;
    appVersion?: string;
}

export const initializeBalancy = async (configParams: BalancyConfigParams): Promise<void> => {
    console.log('Initializing Balancy with params:', configParams);

    const config = AppConfig.create({
        apiGameId: configParams.apiGameId,
        publicKey: configParams.publicKey,
        environment: configParams.environment,
    });

    // Set platform (fixed value)
    config.platform = Platform.AndroidGooglePlay;

    // Set deviceId - use provided or generate/retrieve one
    config.deviceId = configParams.deviceId || getOrCreateDeviceId();

    // Fixed customId for now
    config.customId = 'Custom456';

    // Set app version
    config.appVersion = configParams.appVersion || '1.0.0';
    config.engineVersion = 'React_1.0';

    Balancy.Callbacks.clearAll();
    // Create a promise that resolves when Balancy is fully initialized
    const initializationPromise = new Promise<void>((resolve, reject) => {
        Balancy.Callbacks.onDataUpdated.subscribe((status) => {
            console.log(`=== Data Updated Callback === ${status.isCloudSynced} ; isCMSUpdated = ${status.isCMSUpdated} ; isProfileUpdated = ${status.isProfileUpdated}`);
            if (status.isCloudSynced) {
                const systemProfile = Balancy.Profiles.system;

                if (systemProfile) {
                    const generalInfo = systemProfile.generalInfo;
                    console.log('*** General Info ***');
                    console.log('ProfileId:', generalInfo.profileId);
                    console.log('Country:', generalInfo.country);
                    console.log('First Login:', generalInfo.firstLoginTime);
                    console.log('Session:', generalInfo.session);
                    console.log('PlayTime:', generalInfo.playTime);
                }

                resolve(); // Balancy is fully initialized
            }
        });
    });

    await Balancy.Main.initializeFileHelper(new FileHelperClassBrowser({
        cachePath: '.balancy'
    }));

    await Balancy.Main.init(config);
    console.log('Balancy Initialized, waiting for data synchronization...');

    // Wait for the initialization promise to resolve
    await initializationPromise;
    console.log('Balancy Data Synchronized and Ready!');
};

// Helper function to get or create a persistent device ID
function getOrCreateDeviceId(): string {
    const storageKey = 'balancy_device_id';
    let deviceId = localStorage.getItem(storageKey);

    if (!deviceId) {
        // Generate a UUID v4
        deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        localStorage.setItem(storageKey, deviceId);
    }

    return deviceId;
}
