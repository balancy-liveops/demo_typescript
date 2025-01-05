import {AppConfig, Balancy, Environment, LaunchType, Platform,} from '@balancy/core';
import {FileHelperClass} from "./file-helper.class";

function subscribeToCallbacks() {
    Balancy.Callbacks.onDataUpdated.subscribe((status) => {
        if (status.isCloudSynced) {
            console.log("=== Data is synchronized with cloud ===");

            const systemProfile = Balancy.Profiles.system;

            if (systemProfile) {
                const generalInfo = systemProfile.generalInfo;
                console.log("*** general Info *** ");
                console.log("ProfileId: ", generalInfo.profileId);
                console.log("Country: ", generalInfo.country);
                console.log("First Login: ", generalInfo.firstLoginTime);
                console.log("Session: ", generalInfo.session);
                console.log("PlayTime: ", generalInfo.playTime);

                const activeEvents = systemProfile.smartInfo.gameEvents;
                console.log("*** Active Events: ", activeEvents.count);
                for (let i = 0;i<activeEvents.count;i++) {
                    const event = activeEvents.get(i);
                    console.log(i, ")", event.gameEvent?.name?.getValue());
                }

                const activeOffers = systemProfile.smartInfo.gameOffers;
                console.log("*** Active Offers: ", activeOffers.count);
                for (let i = 0;i<activeOffers.count;i++) {
                    const offer = activeOffers.get(i);
                    console.log(i, ")", offer.gameOffer?.name?.getValue());
                }

                const activeTests = systemProfile.testsInfo.tests;
                console.log("*** A/B Tests: ", activeTests.count);
                for (let i = 0;i<activeTests.count;i++) {
                    const test = activeTests.get(i);
                    console.log(i, ")", test.test?.name,"variant = ", test.variant?.name);
                }
            }
        }
    });
}

(async () => {
    await Balancy.Main.initializeFileHelper(new FileHelperClass("balancy-test-root"));

    //TODO add your game id and public key
    const config = AppConfig.create({
        apiGameId: "6f5d4614-36c0-11ef-9145-066676c39f77",
        publicKey: "MzA5MGY0NWUwNGE5MTk5ZDU4MDAzNT",
        environment: Environment.Development,
    });

    config.platform = Platform.AndroidGooglePlay;
    config.deviceId = "TestDevice";
    config.customId = "Custom456";
    config.appVersion = "1.0.0";
    config.engineVersion = "TypeScript_1.0";

    Balancy.Callbacks.initExamplesWithLogs();

    subscribeToCallbacks();

    await Balancy.Main.init(config);
})();
