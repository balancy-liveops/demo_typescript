import { AppConfig, Balancy, Environment, Platform } from '@balancy/core';
import {FileHelperClassBrowser} from "./FileHelperClassBrowser";

export const initializeBalancy = async (): Promise<void> => {
    console.log('Initializing Balancy...');

    const config = AppConfig.create({
        apiGameId: '6f5d4614-36c0-11ef-9145-066676c39f77',
        publicKey: 'MzA5MGY0NWUwNGE5MTk5ZDU4MDAzNT',
        environment: Environment.Development,
    });

    config.platform = Platform.AndroidGooglePlay;
    //config.deviceId = 'TestDevice';
    config.deviceId = 'DE2309EA-0E81-531C-BDDC-D35BA4C9FA16';
    config.customId = 'Custom456';
    config.appVersion = '1.0.0';
    config.engineVersion = 'React_1.0';

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

                    // Uncomment for more detailed information
                    // console.log('*** Active Events ***');
                    // systemProfile.smartInfo.gameEvents.forEach((event, i) => {
                    //     console.log(`${i + 1}) ${event.gameEvent?.name?.getValue()}`);
                    // });
                    //
                    // console.log('*** Active Offers ***');
                    // systemProfile.smartInfo.gameOffers.forEach((offer, i) => {
                    //     console.log(`${i + 1}) ${offer.gameOffer?.name?.getValue()}`);
                    // });
                    //
                    // console.log('*** A/B Tests ***');
                    // systemProfile.testsInfo.tests.forEach((test, i) => {
                    //     console.log(
                    //         `${i + 1}) ${test.test?.name} - Variant: ${test.variant?.name}`
                    //     );
                    // });
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
