import {
    AppConfig,
    Balancy,
    Environment,
    BalancyPlatform,
    SmartObjectsStoreItem, UnnyObject, BalancyHardProductInfo,
} from '@balancy/core';

import {Utils} from "./Utils";
import {IndexedDBFileHelperAdapter} from "@balancy/utils";

export interface BalancyConfigParams {
    apiGameId: string;
    publicKey: string;
    environment: Environment;
    deviceId?: string;
    appVersion?: string;
    branchName?: string;
}

function preparePayments() {
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

    Balancy.Actions.Purchasing.setGetHardPurchaseInfoCallback((productId) => {
        const allStoreItems = Balancy.CMS.getModels(SmartObjectsStoreItem, true);
        let price = 0.01;
        for (const storeItem of allStoreItems) {
            if (storeItem?.price?.product?.productId === productId) {
                price = storeItem.price.product.price;
                break;
            }
        }
        return new BalancyHardProductInfo(
            "Test Purchase",
            "Test Purchase Description",
            `$${Number(price).toFixed(2)}`,
            price,
            "USD");
    });
}

export const initializeBalancy = async (configParams: BalancyConfigParams): Promise<void> => {
    console.log('Initializing Balancy with params:', configParams);

    const config = AppConfig.create({
        apiGameId: configParams.apiGameId,
        publicKey: configParams.publicKey,
        environment: configParams.environment,
    });

    config.balancyPlatform = BalancyPlatform.AndroidGooglePlay;
    config.deviceId = configParams.deviceId || getOrCreateDeviceId();

    if (configParams.branchName)
        config.branchName = configParams.branchName;

    config.appVersion = configParams.appVersion || '1.0.0';
    config.engineVersion = 'React_1.0';

    preparePayments();
    Balancy.Callbacks.clearAll();
    Balancy.Callbacks.initExamplesWithLogs();

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

                window.addEventListener('message', listenToParentMessages);
            }
        });
    });

    const fileHelperAdapter = await IndexedDBFileHelperAdapter.create({
        cachePath: '.balancy'
    });

    await Balancy.Main.initializeFileHelper(fileHelperAdapter);

    await Balancy.Main.init(config);
    console.log('Balancy Initialized, waiting for data synchronization...');

    await initializationPromise;
    console.log('Balancy Data Synchronized and Ready!');
};

// Good name, and good life advice.
function listenToParentMessages(event: MessageEvent) {
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
            const {
                html,
                viewId,
            } = event.data;
            if (!html || !viewId) return;

            console.log(`Received HTML for View '${viewId}':`, html);
            UnnyObject.setTestView(viewId, html);
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
