import React, { useEffect, useState } from "react";
import {
    Nullable,
    SmartObjectsOfferGroupInfo,
    SmartObjectsPriceType,
    SmartObjectsStoreItem,
} from "@balancy/core";
import { TimeFormatter } from "../TimeFormatter"; // Assuming this exists
import { Utils } from "../Utils"; // Assuming this exists
import { Balancy } from "@balancy/core";
import { BalancyPurchaseProductResponseData } from "../../../../plugin_cpp_typescript/packages/wasm";
import StoreItemView from "./StoreItemView";

interface OfferGroupViewProps {
    offerGroupInfo: SmartObjectsOfferGroupInfo;
}

const OfferGroupView: React.FC<OfferGroupViewProps> = ({ offerGroupInfo }) => {
    const [currentOfferGroup, setCurrentOfferGroup] = useState<SmartObjectsOfferGroupInfo>(offerGroupInfo);
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [refreshKey, setRefreshKey] = useState(0);

    // Timer updater
    useEffect(() => {
        const updateTimer = () => {
            const secondsLeft = currentOfferGroup.getSecondsLeftBeforeDeactivation() || 0;
            setTimeLeft(TimeFormatter.formatUnixTime(secondsLeft));
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [currentOfferGroup]);

    const refreshCallback = () => {
        setRefreshKey((prev) => prev + 1);
    };

    const tryToBuyHard = (
        storeItem: Nullable<SmartObjectsStoreItem>,
        offerGroupInfo: SmartObjectsOfferGroupInfo,
        refreshCallback: () => void
    ) => {
        const price = storeItem?.price;
        if (!price || !price.product) {
            console.warn("Invalid price or product information.");
            return;
        }

        // Simulate creating payment info
        const paymentInfo = Utils.createTestPaymentInfo(price);

        const purchaseCompleted = (responseData: BalancyPurchaseProductResponseData) => {
            console.log("Purchase of", responseData.productId, "success =", responseData.success);
            if (!responseData.success) {
                console.error("ErrorCode:", responseData.errorCode);
                console.error("ErrorMessage:", responseData.errorMessage);
            }
            refreshCallback();
        };

        Balancy.API.hardPurchaseGameOfferGroup(offerGroupInfo, storeItem, paymentInfo, purchaseCompleted, false);
    };

    const handlePurchase = (storeItem: Nullable<SmartObjectsStoreItem>) => {
        const priceType = storeItem?.price?.type;
        if (priceType === SmartObjectsPriceType.Hard) {
            console.log("Hard purchase initiated for:", storeItem?.price?.product?.productId);
            tryToBuyHard(storeItem, currentOfferGroup, refreshCallback);
        } else {
            console.error("Purchase type not supported:", priceType);
        }
    };

    return (
        <div key={refreshKey} style={{ border: "1px solid #ccc", borderRadius: "5px", marginBottom: "10px", padding: "10px", maxWidth: "600px" }}>
            {/* First Row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {/* Icon and Name */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img
                        src={currentOfferGroup.gameOfferGroup?.icon?.getFullUrl() || ""}
                        alt="Icon"
                        style={{ width: "40px", height: "40px", objectFit: "contain" }}
                    />
                    <h4 style={{ margin: 0 }}>{currentOfferGroup.gameOfferGroup?.name?.value}</h4>
                </div>
                {/* Time Left */}
                <div style={{ fontSize: "12px", color: "#888" }}>Time left: {timeLeft}</div>
            </div>

            {/* Second Row - Store Items */}
            <div style={{ display: "flex", overflowX: "auto", marginTop: "10px", gap: "10px" }}>
                {currentOfferGroup.gameOfferGroup?.storeItems.map((storeItem) => {
                    const canBuy = currentOfferGroup.canPurchase(storeItem); // Dynamically calculate
                    return (
                        <StoreItemView
                            key={storeItem?.unnyId}
                            storeItem={storeItem}
                            canBuy={canBuy}
                            onBuy={handlePurchase}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default OfferGroupView;
