import React from "react";
import { Nullable, SmartObjectsStoreItem, SmartObjectsPriceType, LiveOpsStoreSlotType } from "@balancy/core";

interface StoreItemViewProps {
    storeItem: Nullable<SmartObjectsStoreItem>;
    canBuy: boolean;
    onBuy: (storeItem: Nullable<SmartObjectsStoreItem>) => void;
    type?: LiveOpsStoreSlotType;
}

const StoreItemView: React.FC<StoreItemViewProps> = ({ storeItem, canBuy, onBuy, type }) => {
    const handleBuy = () => {
        if (storeItem) {
            onBuy(storeItem);
        }
    };

    let priceStr = "N/A";
    switch (storeItem?.price?.type) {
        case SmartObjectsPriceType.Hard:
            priceStr = storeItem?.price?.product ? `$ ${storeItem?.price?.product?.price.toFixed(2)}` : `N/A`;
            break;
        case SmartObjectsPriceType.Soft:
            let price = storeItem?.price?.items;
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
            priceStr = `▶️ ${storeItem?.price?.ads}`;
            break;
        default:
            priceStr = "N/A";
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
                flexDirection: "column", // Arrange elements vertically
                justifyContent: "space-between", // Space elements within the container
                position: "relative", // Enable absolute positioning for the badge
                overflow: "hidden", // Mask/clip content that goes outside the container
                // height: "100%", // Ensure the container can expand
            }}
        >
            {/* Type Badge */}
            {type !== undefined && type !== LiveOpsStoreSlotType.Default && (
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
                    {getTypeDisplayText(type)}
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
                    margin: "10px auto", // Center the image horizontally
                    display: "block", // Ensure it behaves like a block element for centering
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
            {/* Buy Button */}
            <button
                onClick={handleBuy}
                disabled={!canBuy}
                style={{
                    padding: "8px 12px",
                    backgroundColor: canBuy ? "#007bff" : "#ccc",
                    color: canBuy ? "#fff" : "#666",
                    border: "none",
                    borderRadius: "4px",
                    cursor: canBuy ? "pointer" : "not-allowed",
                    marginTop: "auto", // Pushes the button to the bottom
                }}
            >
                {priceStr}
            </button>
        </div>
    );
};

export default StoreItemView;
