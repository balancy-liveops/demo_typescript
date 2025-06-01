import React, { useState, useEffect, useRef } from "react";
import {
    Nullable,
    SmartObjectsStoreItem,
    SmartObjectsPriceType,
    LiveOpsStoreSlotType,
    LiveOpsStoreSlot
} from "@balancy/core";

// Assuming you have a Slot type - adjust according to your actual Balancy types

interface StoreItemViewAdvancedProps {
    storeSlot: LiveOpsStoreSlot;
    canBuy: boolean;
    onBuy: (storeItem: Nullable<SmartObjectsStoreItem>) => void;
}

const StoreItemViewAdvanced: React.FC<StoreItemViewAdvancedProps> = ({
    storeSlot,
    canBuy: originalCanBuy,
    onBuy
}) => {
    const [isClicked, setIsClicked] = useState(false);
    const [currentCanBuy, setCurrentCanBuy] = useState(originalCanBuy);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isAvailable, setIsAvailable] = useState(true);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const storeItem = storeSlot.storeItem;

    useEffect(() => {
        // Initialize availability state
        const available = storeSlot.isAvailable();
        setIsAvailable(available);


        if (available) {
            setCurrentCanBuy(originalCanBuy);
            clearTimer();
        } else {
            setCurrentCanBuy(false);
            updateTimers();
            // Start periodic timer (every second)
            timerRef.current = setInterval(() => {
                updateTimers();
            }, 1000);
        }

        // Cleanup on unmount
        return () => {
            clearTimer();
        };
    }, [storeSlot, originalCanBuy]);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const updateTimers = () => {
        if (storeSlot.isAvailable()) {
            clearTimer();
            setIsAvailable(true);
            setCurrentCanBuy(originalCanBuy);
            return;
        }

        const seconds = storeSlot.getSecondsLeftUntilAvailable();
        setSecondsLeft(seconds);
        setIsAvailable(false);
        setCurrentCanBuy(false);
    };

    const handleBuy = () => {
        if (storeItem && currentCanBuy) {
            onBuy(storeItem);
        }
    };

    const handleMouseDown = () => {
        if (currentCanBuy) {
            setIsClicked(true);
        }
    };

    const handleMouseUp = () => {
        setIsClicked(false);
    };

    const handleMouseLeave = () => {
        setIsClicked(false);
    };

    // Format seconds to human readable time
    const formatTime = (seconds: number): string => {
        if (seconds <= 0) return "0s";

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${remainingSeconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    };

    let priceStr = "N/A";
    if (storeItem) {
        switch (storeItem.price?.type) {
            case SmartObjectsPriceType.Hard:
                priceStr = storeItem.price?.product ? `$ ${storeItem.price?.product?.price.toFixed(2)}` : `N/A`;
                break;
            case SmartObjectsPriceType.Soft:
                let price = storeItem.price?.items;
                if (price && price.length > 0) {
                    priceStr = '';
                    for (let i = 0; i < price.length; i++) {
                        let p = price[i];
                        if (p && p.item) {
                            priceStr += `${p.item.name.value} x ${p.count} \n`;
                            break;
                        }
                    }
                }
                break;
            case SmartObjectsPriceType.Ads:
                priceStr = `▶️ ${storeItem.getAdsWatched()} / ${storeItem.price?.ads}`;
                break;
            default:
                priceStr = "N/A";
        }
    }

    // Function to get the display text for the slot type
    const getTypeDisplayText = (slotType: LiveOpsStoreSlotType): string => {
        switch (slotType) {
            case LiveOpsStoreSlotType.Default:
                return "Default";
            case LiveOpsStoreSlotType.Popular:
                return "Popular";
            case LiveOpsStoreSlotType.Best:
                return "Best";
            case LiveOpsStoreSlotType.New:
                return "New";
            case LiveOpsStoreSlotType.Great:
                return "Great";
            case LiveOpsStoreSlotType.Limited:
                return "Limited";
            case LiveOpsStoreSlotType.Once:
                return "Once";
            case LiveOpsStoreSlotType.Free:
                return "Free";
            default:
                return "";
        }
    };

    return (
        <div
            style={{
                border: "1px solid #ddd",
                padding: "10px",
                borderRadius: "5px",
                minWidth: "120px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
                opacity: isAvailable ? 1 : 0.7, // Dim when not available
            }}
        >
            {/* Type Badge */}
            {storeSlot.type !== undefined && storeSlot.type !== LiveOpsStoreSlotType.Default && (
                <div
                    style={{
                        position: "absolute",
                        top: "8px",
                        right: "-20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        padding: "4px 8px",
                        fontSize: "10px",
                        fontWeight: "bold",
                        transform: "rotate(45deg)",
                        transformOrigin: "center",
                        borderRadius: "3px",
                        zIndex: 10,
                        minWidth: "60px",
                        textAlign: "center",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                >
                    {getTypeDisplayText(storeSlot.type)}
                </div>
            )}

            {/* Name */}
            <p style={{ fontWeight: "bold", fontSize: "14px", margin: 0 }}>
                {storeItem?.name?.value}
            </p>

            {/* Sprite */}
            <img
                src={storeItem?.sprite?.getFullUrl() || ""}
                alt="Sprite"
                style={{
                    minWidth: "80px",
                    minHeight: "80px",
                    width: "80px",
                    height: "80px",
                    objectFit: "contain",
                    margin: "10px auto",
                    display: "block",
                }}
            />

            {/* Reward Items List */}
            {storeItem?.reward?.items && storeItem.reward.items.length > 0 && (
                <div style={{ marginBottom: "10px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "bold" }}>Reward Items:</p>
                    <ul style={{ paddingLeft: "20px", textAlign: "left" }}>
                        {storeItem.reward.items.map((rewardItem, index) => (
                            <li key={index} style={{ fontSize: "12px" }}>
                                {rewardItem?.item?.name?.value} (x{rewardItem?.count})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Timer Display - shown when item is not available */}
            {!isAvailable && (
                <div
                    style={{
                        backgroundColor: "#ff6b6b",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        margin: "5px 0",
                    }}
                >
                    Available in {formatTime(secondsLeft)}
                </div>
            )}

            {/* Limits Display - shown when slot has purchase limits */}
            {storeSlot.hasLimits() && (
                <div
                    style={{
                        backgroundColor: "#f8f9fa",
                        color: "#6c757d",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        margin: "5px 0",
                        border: "1px solid #dee2e6",
                    }}
                >
                    Purchased {storeSlot.getPurchasesDoneDuringTheLastCycle()}/{storeSlot.getPurchasesLimitForCycle()}
                </div>
            )}

            {/* Buy Button */}
            <button
                onClick={handleBuy}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                disabled={!currentCanBuy}
                style={{
                    padding: "8px 12px",
                    backgroundColor: currentCanBuy ? "#007bff" : "#ccc",
                    color: currentCanBuy ? "#fff" : "#666",
                    border: "none",
                    borderRadius: "4px",
                    cursor: currentCanBuy ? "pointer" : "not-allowed",
                    marginTop: "auto",
                    transform: isClicked ? "scale(0.95)" : "scale(1)",
                    transition: "transform 0.1s ease-in-out",
                }}
            >
                {!isAvailable ? "Not Available" : priceStr}
            </button>
        </div>
    );
};

export default StoreItemViewAdvanced;
