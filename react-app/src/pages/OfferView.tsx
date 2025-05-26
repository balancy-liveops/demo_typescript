import React, { useEffect, useState } from "react";
import {
    Balancy,
    SmartObjectsOfferInfo,
} from "@balancy/core";
import { TimeFormatter } from "../TimeFormatter";

interface OfferViewProps {
    offerInfo: SmartObjectsOfferInfo;
}

const OfferView: React.FC<OfferViewProps> = ({ offerInfo }) => {
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [refreshKey, setRefreshKey] = useState(0);

    // Timer updater
    useEffect(() => {
        const updateTimer = () => {
            const secondsLeft = offerInfo.getSecondsLeftBeforeDeactivation() || 0;
            setTimeLeft(TimeFormatter.formatUnixTime(secondsLeft));
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [offerInfo]);

    const refreshCallback = () => {
        setRefreshKey((prev) => prev + 1);
    };

    const handlePurchase = () => {
        Balancy.API.initPurchaseOffer(offerInfo, (success, errorMessage) => {
            console.log("Purchase initialized:", success, errorMessage);
            refreshCallback();
        });
    };

    const spriteUrl = offerInfo.gameOffer?.sprite?.getFullUrl() || "";
    const iconUrl = offerInfo.gameOffer?.icon?.getFullUrl() || "";

    let priceStr = "N/A";
    if (offerInfo.gameOffer?.storeItem?.price?.product)
        priceStr = `$ ${offerInfo.gameOffer?.storeItem?.price?.product?.price.toFixed(2)}`;

    return (
        <div key={refreshKey} style={{ border: "1px solid #ccc", borderRadius: "5px", marginBottom: "10px", padding: "10px", maxWidth: "600px"}}>
            {/* First Row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {/* Icon and Name */}
                <div style={{ display: "flex", alignItems: "center" }}>
                    {iconUrl && (
                        <img
                            src={iconUrl}
                            alt="Icon"
                            style={{ width: "40px", height: "40px", marginRight: "10px", objectFit: "contain" }}
                        />
                    )}
                    <h4 style={{ margin: 0 }}>{offerInfo.gameOffer?.name?.value}</h4>
                </div>

                {/* Buy Button and Timer */}
                <div style={{ textAlign: "right" }}>
                    <button
                        onClick={handlePurchase}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#28a745",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        {priceStr}
                    </button>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Time left: {timeLeft}</div>
                </div>
            </div>

            {/* Second Row */}
            <div style={{ display: "flex", marginTop: "10px" }}>
                {/* Sprite */}
                {spriteUrl && (
                    <img
                        src={spriteUrl}
                        alt="Sprite"
                        style={{ width: "80px", height: "80px", marginRight: "10px", objectFit: "contain" }}
                    />
                )}
                {/* Description */}
                <p style={{ margin: 0, flex: 1 }}>{offerInfo.gameOffer?.description?.value}</p>
            </div>
        </div>
    );
};

export default OfferView;
