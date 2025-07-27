import React, { useEffect, useState } from "react";
import {
    Balancy,
    SmartObjectsGameShop,
    SmartObjectsShopPage,
    SmartObjectsShopSlot,
    SmartObjectsStoreItem,
    SmartObjectsPriceType, Nullable,
} from "@balancy/core";
import StoreItemViewAdvanced from "./StoreItemViewAdvanced"; // Reuse from previous implementation

const ShopPage: React.FC = () => {
    const [shopPages, setShopPages] = useState<SmartObjectsShopPage[]>([]);
    const [activePage, setActivePage] = useState<SmartObjectsShopPage | null>(null);
    const [activeShop, setActiveShop] = useState<SmartObjectsGameShop | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = () => {
        if (!Balancy.Main.isReadyToUse) {
            console.warn("Balancy is not ready to use.");
            return;
        }

        const shops = Balancy.Profiles.system?.shopsInfo;
        if (shops && shops.gameShops && shops.gameShops.count > 0) {
            const activeShop = shops.activeShopInfo;
            setShopPages(activeShop?.activePages?.toArray() || []);
            setActiveShop(activeShop);
            setActivePage(activeShop?.activePages?.get(0) || null);
        }

        setRefreshKey((prev) => prev + 1);
    };

    const showPage = (page: SmartObjectsShopPage | null) => {
        setActivePage(page);
    };

    const tryToBuySlot = (shopSlot: Nullable<SmartObjectsShopSlot>) => {
        Balancy.API.initPurchaseShop(shopSlot, (success, errorMessage) => {
            console.log("Purchase initialized:", success, errorMessage);
            refresh();
        });
    };

    useEffect(() => {
        const shopUpdatedId = Balancy.Callbacks.onShopUpdated.subscribe(refresh);

        refresh();

        return () => {
            Balancy.Callbacks.onShopUpdated.unsubscribe(shopUpdatedId);
        };
    }, []);

    return (
        <div key={refreshKey} style={{ padding: "20px" }}>
            <h2>{"Shop: " + activeShop?.shop?.name.value}</h2>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "20px" }}>
                {activePage?.activeSlots?.toArray().map((shopSlot: SmartObjectsShopSlot) => {
                    const localShopSlot = shopSlot;
                    if (!localShopSlot?.slot)
                        return  null;

                    return (<StoreItemViewAdvanced
                        key={shopSlot.slot?.unnyId}
                        shopSlot={localShopSlot}
                        canBuy={true} // Adjust logic if needed to determine availability
                        onBuy={() => tryToBuySlot(localShopSlot)}
                    />);
                })}
            </div>
        </div>
    );
};

export default ShopPage;
