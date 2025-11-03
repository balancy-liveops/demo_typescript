import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Balancy,
    Callbacks,
    Environment,
    AppConfig,
    BalancyPlatform,
    SmartObjectsStoreItem,
    BalancyHardProductInfo, SmartObjectsPrice, BalancyPaymentInfo
} from '@balancy/core';
import { IndexedDBFileHelperAdapter } from '@balancy/utils';
import BalancyMainUI from './BalancyMainUI';

// Simple configuration interface for the component
export interface SimpleBalancyConfig {
  apiGameId: string;
  publicKey: string;
  environment?: Environment;
  deviceId?: string;
  appVersion?: string;
}

// Props for the main component
interface BalancySimpleIntegrationProps {
  config: SimpleBalancyConfig;
  onReady?: () => void;
  onError?: (error: string) => void;
}

function generateGuid(): string {
    // Generates a GUID-like string
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
        const random = (Math.random() * 16) | 0;
        const value = char === "x" ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
}

function createTestPaymentInfo(price: SmartObjectsPrice): BalancyPaymentInfo {
    const orderId = generateGuid();
    const productId = price.product?.productId || "";
    const productPrice = price.product?.price || 0;

    const paymentInfo: BalancyPaymentInfo = {
        price: productPrice,
        currency: "USD",
        orderId: orderId,
        productId: productId,
        receipt: `<receipt>` // Placeholder for receipt
    };

    // Below is the testing receipt, it's not designed for production
    paymentInfo.receipt = JSON.stringify({
        Payload: JSON.stringify({
            json: JSON.stringify({
                orderId: paymentInfo.orderId,
                productId: paymentInfo.productId
            }),
            signature: "bypass"
        })
    });

    return paymentInfo;
}

function preparePayments() {
    Balancy.Actions.Ads.setAdWatchCallback((callback: (success: boolean) => void) => {
        console.log('Fake ad watched.');
        //TODO Implement your ad watch logic here
        if (callback)
            callback(true);
    });

    Balancy.Actions.Purchasing.setHardPurchaseCallback((productInfo) => {
        console.log('Starting Purchase: ', productInfo?.productId);
        const price = productInfo?.getStoreItem()?.price;

        // Implement your hard purchase logic here
        if (price) {
            const paymentInfo = createTestPaymentInfo(price);
            //Tell Balancy that payment was successful
            Balancy.API.finalizedHardPurchase(true, productInfo, paymentInfo);
        } else {
            console.warn('No price information available for the product:', productInfo?.productId);
            Balancy.API.finalizedHardPurchase(false, productInfo, null);
        }
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

// Main component
export const BalancySimpleIntegration: React.FC<BalancySimpleIntegrationProps> = ({
  config,
  onReady,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializationRef = useRef(false);

  // Get or create persistent device ID using localStorage
  const getOrCreateDeviceId = useCallback((): string => {
    const storageKey = 'balancy_device_id';
    let deviceId = localStorage.getItem(storageKey);

    if (!deviceId) {
      deviceId = generateGuid();
      localStorage.setItem(storageKey, deviceId);
    }

    return deviceId;
  }, []);

  // Initialize Balancy
  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) {
      return;
    }

    // Check if Balancy is already initialized and ready
    if (Balancy.Main.isReadyToUse) {
      setIsReady(true);
      setIsLoading(false);
      onReady?.();
      return;
    }

    initializationRef.current = true;

    const initializeBalancy = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create Balancy configuration
        const appConfig = AppConfig.create({
          apiGameId: config.apiGameId,
          publicKey: config.publicKey,
          environment: config.environment || Environment.Development,
        });

        // Set additional config
        appConfig.balancyPlatform = BalancyPlatform.AndroidGooglePlay;
        appConfig.deviceId = config.deviceId || getOrCreateDeviceId();
        appConfig.appVersion = config.appVersion || '1.0.0';
        appConfig.engineVersion = 'React_Simple_1.0';

        // Initialize file helper
        const fileHelperAdapter = await IndexedDBFileHelperAdapter.create({
          cachePath: '.balancy'
        });
        await Balancy.Main.initializeFileHelper(fileHelperAdapter);

        preparePayments();

        // Set up data update callback
        const dataUpdatePromise = new Promise<void>((resolve) => {
          const subscriptionId = Callbacks.onDataUpdated.subscribe((status) => {
            if (status.isCloudSynced) {
              Callbacks.onDataUpdated.unsubscribe(subscriptionId);
              resolve();
            }
          });
        });

        // Initialize Balancy
        await Balancy.Main.init(appConfig);

        // Wait for data to be synchronized
        await dataUpdatePromise;

        setIsReady(true);
        setIsLoading(false);
        onReady?.();

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Balancy';
        setError(errorMessage);
        setIsLoading(false);
        onError?.(errorMessage);
        console.error('Balancy initialization error:', err);
        // Reset the ref so user can try again
        initializationRef.current = false;
      }
    };

    initializeBalancy();
  }, [config, getOrCreateDeviceId, onReady, onError]);

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(44, 62, 80, 0.95)',
          padding: '20px',
          borderRadius: '8px',
          color: '#fff',
          textAlign: 'center',
          zIndex: 2000
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid #2c3e50',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 10px'
          }}
        />
        Initializing Balancy...
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(231, 76, 60, 0.95)',
          padding: '20px',
          borderRadius: '8px',
          color: '#fff',
          textAlign: 'center',
          zIndex: 2000
        }}
      >
        <h3 style={{ margin: '0 0 10px 0' }}>Error</h3>
        <p style={{ margin: 0 }}>{error}</p>
      </div>
    );
  }

  // Ready state - show Balancy Main UI with Reset button
  if (isReady) {
    return (
      <>
        <BalancyMainUI />
        <button
          onClick={() => {
            console.log('Resetting Balancy profiles...');
            Balancy.Profiles.reset();
          }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 2000,
            boxShadow: '0 2px 8px rgba(231, 76, 60, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#c0392b';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#e74c3c';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Reset
        </button>
      </>
    );
  }

  return null;
};

export default BalancySimpleIntegration;
