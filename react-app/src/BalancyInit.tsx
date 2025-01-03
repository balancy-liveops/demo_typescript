import React, { useEffect } from 'react';
import { AppConfig, Balancy, Environment, Platform } from '@balancy/core';

const BalancyIntegration: React.FC = () => {
    useEffect(() => {
        const initializeBalancy = async () => {
            try {
                console.log('Initializing Balancy...');

                // Initialize Balancy FileHelper
                // await Balancy.Main.initializeFileHelper({
                //     saveFile: async (path, data) => {
                //         console.log('Saving file:', path, data);
                //     },
                //     loadFile: async (path) => {
                //         console.log('Loading file:', path);
                //         return '{}'; // Return dummy data for now
                //     },
                // });

                // Create AppConfig
                const config = AppConfig.create({
                    apiGameId: '6f5d4614-36c0-11ef-9145-066676c39f77',
                    publicKey: 'MzA5MGY0NWUwNGE5MTk5ZDU4MDAzNT',
                    environment: Environment.Development,
                });

                config.platform = Platform.AndroidGooglePlay;
                config.deviceId = 'TestDevice';
                config.customId = 'Custom456';
                config.appVersion = '1.0.0';
                config.engineVersion = 'React_1.0';

                // Subscribe to Balancy Callbacks
                Balancy.Callbacks.onDataUpdated = (status) => {
                    console.log('=== Data Updated Callback ===');
                    if (status.isCloudSynchronized) {
                        const systemProfile = Balancy.Profiles.system;

                        if (systemProfile) {
                            const generalInfo = systemProfile.generalInfo;
                            console.log('*** General Info ***');
                            console.log('ProfileId:', generalInfo.profileId);
                            console.log('Country:', generalInfo.country);
                            console.log('First Login:', generalInfo.firstLoginTime);
                            console.log('Session:', generalInfo.session);
                            console.log('PlayTime:', generalInfo.playTime);

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
                    }
                };

                // Initialize Balancy
                await Balancy.Main.init(config);

                console.log('Balancy Initialized Successfully');
            } catch (error) {
                console.error('Error initializing Balancy:', error);
            }
        };

        initializeBalancy();
    }, []);

    return <div>Balancy Integration - Check the console for logs.</div>;
};

export default BalancyIntegration;
