import {
    AppConfig,
    Balancy,
    Environment,
    BalancyPlatform,
    SmartObjectsStoreItem, SmartObjectsGameEvent,
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

    Balancy.Actions.Ads.setAdWatchCallback(showFakeAdOverlay);

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

// Helper function to get or create a persistent device ID
function showFakeAdOverlay(callback: (success: boolean) => void): void {
    console.log('Showing fake ad overlay...');
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        border: none;
        background: #ff4444;
        color: white;
        font-size: 24px;
        border-radius: 50%;
        cursor: pointer;
        z-index: 10001;
    `;
    closeButton.onclick = () => {
        document.body.removeChild(overlay);
        if (callback) callback(false);
    };

    const description = document.createElement('div');
    description.textContent = '📺 Ad Simulation - This is a demo ad';
    description.style.cssText = `
        color: white;
        font-size: 18px;
        margin-bottom: 20px;
        text-align: center;
    `;

    const claimButton = document.createElement('button');
    claimButton.textContent = 'Claim Reward';
    claimButton.style.cssText = `
        padding: 15px 30px;
        font-size: 18px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
    `;
    claimButton.onclick = () => {
        document.body.removeChild(overlay);
        if (callback) callback(true);
    };

    overlay.appendChild(closeButton);
    overlay.appendChild(description);
    overlay.appendChild(claimButton);
    document.body.appendChild(overlay);
}

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
