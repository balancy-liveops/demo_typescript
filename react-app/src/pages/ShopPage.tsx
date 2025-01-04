import React, { useEffect, useState } from "react";
import {
    Balancy,
    SmartObjectsShopPage,
    SmartObjectsShopSlot,
    SmartObjectsStoreItem,
    SmartObjectsPriceType, Nullable,
} from "@balancy/core";
import StoreItemView from "./StoreItemView"; // Reuse from previous implementation
import { Utils } from "../Utils"; // Utility methods

const ShopPage: React.FC = () => {
    const [shopPages, setShopPages] = useState<SmartObjectsShopPage[]>([]);
    const [activePage, setActivePage] = useState<SmartObjectsShopPage | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = () => {
        if (!Balancy.Main.isReadyToUse) {
            console.warn("Balancy is not ready to use.");
            return;
        }

        const shops = Balancy.Profiles.system?.shopsInfo;
        if (shops && shops.gameShops && shops.gameShops.count > 0) {
            const activeShop = shops.gameShops.get(0);
            setShopPages(activeShop.activePages?.toArray() || []);
            setActivePage(activeShop.activePages?.get(0) || null);
        }

        setRefreshKey((prev) => prev + 1);
    };

    const showPage = (page: SmartObjectsShopPage | null) => {
        setActivePage(page);
    };

    const tryToBuySlot = (storeItem: Nullable<SmartObjectsStoreItem> | undefined) => {
        const price = storeItem?.price;
        if (!storeItem || !price || !price.product) {
            console.warn("Invalid price or product information.");
            return;
        }

        // Simulate creating payment info
        const paymentInfo = Utils.createTestPaymentInfo(price);

        const purchaseCompleted = (responseData: any) => {
            console.log("Purchase of", responseData.productId, "success =", responseData.success);
            if (!responseData.success) {
                console.error("ErrorCode:", responseData.errorCode);
                console.error("ErrorMessage:", responseData.errorMessage);
            }
            refresh(); // Refresh after purchase
        };

        if (price.type === SmartObjectsPriceType.Hard) {
            Balancy.API.hardPurchaseStoreItem(storeItem, paymentInfo, purchaseCompleted, false);
        } else {
            console.error("Purchase type not supported:", price.type);
        }
    };

    useEffect(() => {
        Balancy.Callbacks.onShopUpdated = refresh;

        refresh();

        return () => {
            Balancy.Callbacks.onShopUpdated = null;
        };
    }, []);

    return (
        <div key={refreshKey} style={{ padding: "20px" }}>
            <h2>Shop</h2>
            {/* Horizontal Scroll for Shop Pages */}
            <div style={{ display: "flex", overflowX: "auto", gap: "10px", marginBottom: "20px" }}>
                {shopPages.map((page) => (
                    <button
                        key={page.page?.unnyId}
                        onClick={() => showPage(page)}
                        style={{
                            padding: "10px",
                            backgroundColor: activePage === page ? "#007bff" : "#ccc",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            flexShrink: 0,
                        }}
                    >
                        {page.page?.name?.value}
                    </button>
                ))}
            </div>

            {/* Grid of Slots */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "10px" }}>
                {activePage?.activeSlots?.toArray().map((shopSlot: SmartObjectsShopSlot) => {
                    const storeItem = shopSlot.slot?.storeItem;
                    if (!storeItem)
                        return  null;
                        return (<StoreItemView
                            key={shopSlot.slot?.unnyId}
                            storeItem={storeItem}
                            canBuy={true} // Adjust logic if needed to determine availability
                            onBuy={() => tryToBuySlot(shopSlot.slot?.storeItem)}
                        />);
                    })}
            </div>
        </div>
    );
};

export default ShopPage;
