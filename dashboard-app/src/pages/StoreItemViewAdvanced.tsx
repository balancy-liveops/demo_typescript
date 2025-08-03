import React, { useState, useEffect, useRef } from "react";
import {
    Nullable,
    SmartObjectsStoreItem,
    SmartObjectsPriceType,
    LiveOpsStoreSlotType,
    SmartObjectsShopSlot
} from "@balancy/core";
import { useCachedSprite } from "../hooks/useCachedSprite";
import {Utils} from "../Utils";

// Assuming you have a Slot type - adjust according to your actual Balancy types

interface StoreItemViewAdvancedProps {
    shopSlot: SmartObjectsShopSlot;
    canBuy: boolean;
    onBuy: (storeItem: Nullable<SmartObjectsStoreItem>) => void;
}

const StoreItemViewAdvanced: React.FC<StoreItemViewAdvancedProps> = ({
    shopSlot,
    canBuy: originalCanBuy,
    onBuy
}) => {
    const [isClicked, setIsClicked] = useState(false);
    const [currentCanBuy, setCurrentCanBuy] = useState(originalCanBuy);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isAvailable, setIsAvailable] = useState(true);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const storeSlot = shopSlot.slot;
    const storeItem = storeSlot?.storeItem;

    // Используем хук для кеширования спрайтов
    const { spriteUrl, isLoading: isSpriteLoading, error: spriteError } = useCachedSprite(storeItem?.sprite);

    useEffect(() => {
        // Initialize availability state
        const available = shopSlot.isAvailable();
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
    }, [shopSlot, storeSlot, originalCanBuy]);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const updateTimers = () => {
        if (shopSlot.isAvailable()) {
            clearTimer();
            setIsAvailable(true);
            setCurrentCanBuy(originalCanBuy);
            return;
        }

        const seconds = shopSlot.getSecondsLeftUntilAvailable();
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

    let priceStr = Utils.getPriceString(storeItem);

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

    if (!storeSlot)
        return null;

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
            <div style={{ position: 'relative' }}>
                {isSpriteLoading && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '12px',
                            color: '#666',
                            zIndex: 1
                        }}
                    >
                        Загрузка...
                    </div>
                )}

                {/* Показываем ошибку кеширования если есть */}
                {spriteError && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '10px',
                            color: '#ff6b6b',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            padding: '2px 4px',
                            borderRadius: '2px',
                            zIndex: 1
                        }}
                        title={spriteError}
                    >
                        ⚠️
                    </div>
                )}

                <img
                    src={spriteUrl || ""}
                    alt="Sprite"
                    style={{
                        minWidth: "80px",
                        minHeight: "80px",
                        width: "80px",
                        height: "80px",
                        objectFit: "contain",
                        margin: "10px auto",
                        display: "block",
                        opacity: isSpriteLoading ? 0.5 : 1,
                        transition: 'opacity 0.3s ease'
                    }}
                />
            </div>

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
            {shopSlot.hasLimits() && (
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
                    Purchased {shopSlot.getPurchasesDoneDuringTheLastCycle()}/{shopSlot.getPurchasesLimitForCycle()}
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
