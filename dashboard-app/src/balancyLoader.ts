import {
    AppConfig,
    Balancy,
    Environment,
    BalancyPlatform,
    SmartObjectsStoreItem, UnnyObject, BalancyHardProductInfo, SmartObjectsPrice,
} from '@balancy/core';

import {Utils} from "./Utils";
import {IndexedDBFileHelperAdapter} from "@balancy/utils";
import {IAPEventEmitter, IAPEvents} from "./features/simulateIAP";

// Declare global types for TypeScript at the top level
declare global {
    interface Window {
        Balancy: typeof Balancy;
        currentBalancyConfig: BalancyConfigParams;
        BalancyDebug: {
            Balancy: typeof Balancy;
            Main: typeof Balancy.Main;
            CMS: typeof Balancy.CMS;
            API: typeof Balancy.API;
            Callbacks: typeof Balancy.Callbacks;
            Actions: typeof Balancy.Actions;
            Profiles: typeof Balancy.Profiles;
            DataObjectsManager: typeof Balancy.DataObjectsManager;
            
            // Utility functions
            isReady: () => boolean;
            enableLogs: () => void;
            clearAllCallbacks: () => void;
            
            // Debug functions
            logStatus: () => void;
            logProfiles: () => void;
            logCMSData: () => void;
            logSystemProfile: () => void;
            call: (methodPath: string, ...args: any[]) => any;
        };
    }
}

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

        const storeItem = productInfo?.getStoreItem();
        const price = storeItem?.price;
        if (price) {
            const productName = storeItem?.name.value || 'Unknown Product';
            const priceValue = price.product?.price || 0;
            storeItem?.sprite?.loadSprite((url) => {
                IAPEventEmitter.emit(
                    IAPEvents.IAP_OPENED,
                    productName,
                    `$${priceValue.toFixed(2)}`,
                    url ?? undefined
                );
            });
            IAPEventEmitter.once(IAPEvents.IAP_PURCHASED, (isSuccess) => {
                if (!isSuccess) {
                    console.log('Purchase cancelled by user');
                    Balancy.API.finalizedHardPurchase(false, productInfo, null);
                    return;
                }

                console.log('User confirmed purchase');
                const paymentInfo = Utils.createTestPaymentInfo(price);
                Balancy.API.finalizedHardPurchase(true, productInfo, paymentInfo);
            });
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

    // Save config for debugging
    (window as any).currentBalancyConfig = configParams;
    
    // Setup global access for debugging
    setupGlobalBalancyAccess();
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

// Setup global access to Balancy SDK for debugging
function setupGlobalBalancyAccess() {
    // Create the BalancyDebug object with useful debugging functions
    (window as any).BalancyDebug = {
        // Main classes
        Balancy,
        Main: Balancy.Main,
        CMS: Balancy.CMS,
        API: Balancy.API,
        Callbacks: Balancy.Callbacks,
        Actions: Balancy.Actions,
        Profiles: Balancy.Profiles,
        DataObjectsManager: Balancy.DataObjectsManager,
        
        // Utility functions
        isReady: () => Balancy.Main.isReadyToUse,
        enableLogs: () => Balancy.Callbacks.initExamplesWithLogs(),
        clearAllCallbacks: () => Balancy.Callbacks.clearAll(),
        
        // Debug functions
        logStatus: () => {
            console.group('🔍 Balancy Status');
            console.log('IsReady:', Balancy.Main.isReadyToUse);
            console.log('Environment:', (window as any).currentBalancyConfig?.environment);
            console.log('Game ID:', (window as any).currentBalancyConfig?.apiGameId);
            console.groupEnd();
        },
        
        logProfiles: () => {
            console.group('👤 Balancy Profiles');
            console.log('System Profile:', Balancy.Profiles.system);
            if (Balancy.Profiles.system) {
                console.log('General Info:', Balancy.Profiles.system.generalInfo);
                console.log('Smart Info:', Balancy.Profiles.system.smartInfo);
                console.log('Live Ops Info:', Balancy.Profiles.system.liveOpsInfo);
            }
            console.groupEnd();
        },
        
        logCMSData: () => {
            console.group('📊 Balancy CMS Data');
            try {
                // Get all available model types and their data
                console.log('Store Items:', Balancy.CMS.getModels(SmartObjectsStoreItem, true));
                
                // You can add more specific model types here as needed
                console.log('CMS instance:', Balancy.CMS);
            } catch (error) {
                console.error('Error getting CMS data:', error);
            }
            console.groupEnd();
        },
        
        logSystemProfile: () => {
            console.group('⚙️ System Profile Details');
            const systemProfile = Balancy.Profiles.system;
            if (systemProfile) {
                const generalInfo = systemProfile.generalInfo;
                console.log('Profile ID:', generalInfo.profileId);
                console.log('Country:', generalInfo.country);
                console.log('First Login:', generalInfo.firstLoginTime);
                console.log('Session:', generalInfo.session);
                console.log('Play Time:', generalInfo.playTime);
                console.log('Device Info:', {
                    deviceId: generalInfo.deviceId,
                    appVersion: generalInfo.appVersion,
                    engineVersion: generalInfo.engineVersion
                });
            } else {
                console.log('System profile not available');
            }
            console.groupEnd();
        },
        
        // Universal method caller
        call: (methodPath: string, ...args: any[]) => {
            try {
                const paths = methodPath.split('.');
                let obj = Balancy as any;
                
                for (const path of paths) {
                    obj = obj[path];
                }
                
                if (typeof obj === 'function') {
                    return obj.apply(Balancy, args);
                } else {
                    return obj;
                }
            } catch (error) {
                console.error('❌ Error calling method:', methodPath, error);
                return null;
            }
        }
    };
    
    // Also make Balancy directly available
    (window as any).Balancy = Balancy;
    
    console.log('✅ Balancy SDK is now available in console!');
    console.log('📚 Available commands:');
    console.log('  🔍 BalancyDebug.logStatus() - show SDK status');
    console.log('  👤 BalancyDebug.logProfiles() - show profiles');
    console.log('  📊 BalancyDebug.logCMSData() - show CMS data');
    console.log('  ⚙️ BalancyDebug.logSystemProfile() - system profile details');
    console.log('  🎯 BalancyDebug.call("Main.isReadyToUse") - call any method');
    console.log('  📱 Balancy.Main, Balancy.CMS, Balancy.API - direct access');
    console.log('');
    console.log('🚀 Examples:');
    console.log('  BalancyDebug.isReady()');
    console.log('  BalancyDebug.call("CMS.getModels", SmartObjectsStoreItem, true)');
    console.log('  Balancy.Profiles.system.generalInfo');
}
