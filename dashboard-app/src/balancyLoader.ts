import {
    AppConfig,
    Balancy,
    Environment,
    BalancyPlatform,
    SmartObjectsStoreItem, UnnyObject,
} from '@balancy/core';

import {Utils} from "./Utils";
import {IndexedDBFileHelperAdapter} from "./IndexedDBFileHelperAdapter";

export interface BalancyConfigParams {
    apiGameId: string;
    publicKey: string;
    environment: Environment;
    deviceId?: string;
    appVersion?: string;
    branchName?: string;
}

export const initializeBalancy = async (configParams: BalancyConfigParams): Promise<void> => {
    console.log('Initializing Balancy with params:', configParams);

    const config = AppConfig.create({
        apiGameId: configParams.apiGameId,
        publicKey: configParams.publicKey,
        environment: configParams.environment,
    });

    // Set platform (fixed value)
    config.balancyPlatform = BalancyPlatform.AndroidGooglePlay;

    // Set deviceId - use provided or generate/retrieve one
    config.deviceId = configParams.deviceId || getOrCreateDeviceId();

    if (configParams.branchName)
        config.branchName = configParams.branchName;

    // Fixed customId for now
    config.customId = 'Custom456';

    // Set app version
    config.appVersion = configParams.appVersion || '1.0.0';
    config.engineVersion = 'React_1.0';

    Balancy.Callbacks.clearAll();

    Balancy.Actions.Ads.setAdWatchCallback((storeItem : SmartObjectsStoreItem) => {
        console.log('Fake ad watched for:', storeItem?.name);
        //TODO Implement your ad watch logic here
        storeItem?.adWasWatched();
    });

    Balancy.Actions.Purchasing.setHardPurchaseCallback((productInfo) => {
        console.log('Starting Purchase: ', productInfo?.productId);
        const price = productInfo?.getStoreItem()?.price;
        if (price) {
            const paymentInfo = Utils.createTestPaymentInfo(price);
            Balancy.API.finalizedHardPurchase(true, productInfo, paymentInfo);
        } else
            console.warn('No price information available for the product:', productInfo?.productId);
        // Implement your hard purchase logic here
    });

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

                window.parent.addEventListener('message', listenToParentMessages);
                console.log('Now listening to parent...');
                // Example for Mark
                // const simpleTestHtml = `
                //     <html>
                //         <head>
                //             <title>Balancy Test View</title>
                //         </head>
                //         <body>
                //             <h1>Balancy Test View</h1>
                //             <button id="testButton">Click Me!</button>
                //             <script>
                //                 document.getElementById('testButton').addEventListener('click', function() {
                //                     console.log('Button clicked!');
                //                 });
                //             </script>
                //         </body>
                //     </html>`;
                // UnnyObject.setTestView("940", simpleTestHtml);
            }
        });
    });

    // Create and initialize the IndexedDB adapter in one line
    const fileHelperAdapter = await IndexedDBFileHelperAdapter.create({
        cachePath: '.balancy'
    });

    const stats = fileHelperAdapter.getCacheStats();
    console.log(`📁 Files: ${stats.fileCount}, 💾 Memory: ${stats.memoryUsage}`);

    // Initialize Balancy with the ready adapter
    await Balancy.Main.initializeFileHelper(fileHelperAdapter);

    await Balancy.Main.init(config);
    console.log('Balancy Initialized, waiting for data synchronization...');

    // Wait for the initialization promise to resolve
    await initializationPromise;
    console.log('Balancy Data Synchronized and Ready!');
};

// Good name, and good life advice.
function listenToParentMessages(event: MessageEvent) {
    console.log('>CHILDEVENT', event.origin, event.data);
    if (event.source !== window.parent) return;

    const {
        // Version of this messaging data structure, just in case we change it later
        version,
        // Two types for now: 'handshake' for getting the parent origin, and 'html' for getting the html data
        type,
    } = event.data;

    if (version !== '1') {
        console.error('Unsupported messaging version:', version);
        return;
    }

    switch (type) {
        case 'handshake': {
            const response = {
                version: '1',
                type: 'handshake',
                success: true,
            };
            event.source.postMessage(response, event.origin);
            break;
        }
        case 'html': {
            const html = event.data.html;
            if (!html) return;

            UnnyObject.setTestView("940", html);
            break;
        }
        default: {
            console.error('Unsupported message type:', type);
            break;
        }
    }
}

function cleanup() {
    // Remove event listeners or any other cleanup tasks
    // This should be called in the return of the App useEffect
    window.removeEventListener('message', listenToParentMessages);
    console.log('Balancy cleanup completed.');
}

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
