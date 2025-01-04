import React from "react";
import { Nullable, SmartObjectsStoreItem } from "@balancy/core";

interface StoreItemViewProps {
    storeItem: Nullable<SmartObjectsStoreItem>;
    canBuy: boolean;
    onBuy: (storeItem: Nullable<SmartObjectsStoreItem>) => void;
}

const StoreItemView: React.FC<StoreItemViewProps> = ({ storeItem, canBuy, onBuy }) => {
    const handleBuy = () => {
        if (storeItem) {
            onBuy(storeItem);
        }
    };

    let priceStr = "N/A";
    if (storeItem?.price?.product)
        priceStr = `$ ${storeItem?.price?.product?.price.toFixed(2)}`;

    return (
        <div
            style={{
                border: "1px solid #ddd",
                padding: "10px",
                borderRadius: "5px",
                minWidth: "120px",
                textAlign: "center",
            }}
        >
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
                    margin: "10px 0",
                }}
            />
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
                }}
            >
                {priceStr}
            </button>
        </div>
    );
};

export default StoreItemView;
