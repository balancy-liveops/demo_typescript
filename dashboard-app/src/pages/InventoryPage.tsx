import React, { useEffect, useState } from "react";
import { Balancy, SmartObjectsInventory, SmartObjectsInventorySlot, SmartObjectsItem } from "@balancy/core";

interface InventorySlotViewProps {
    slot: SmartObjectsInventorySlot;
    onInventoryChange: () => void;
}

const InventorySlotView: React.FC<InventorySlotViewProps> = ({ slot, onInventoryChange }) => {
    const [itemImage, setItemImage] = useState<string>('');

    useEffect(() => {
        if (slot.item?.item?.icon) {
            slot.item.item.icon.loadSprite((url: string | null) => {
                setItemImage(url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzM0NDk1ZSIvPgo8dGV4dCB4PSIzMiIgeT0iMzYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5NWE1YTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPj88L3RleHQ+Cjwvc3ZnPgo=');
            });
        }
    }, [slot.item?.item?.icon]);

    const addItem = () => {
        if (slot.item) {
            Balancy.API.Inventory.addItems(slot.item.item, 1);
            setTimeout(() => {
                onInventoryChange();
            }, 10);
        }
    };

    const removeItem = () => {
        if (slot.item && slot.item.amount > 0) {
            Balancy.API.Inventory.removeItems(slot.item.item, 1);
            setTimeout(() => {
                onInventoryChange();
            }, 10);
        }
    };

    return (
        <div style={styles.slotContainer} className="inventory-item">
            {slot.item && slot.item.item ? (
                <>
                    <div style={styles.itemIconContainer}>
                        {itemImage ? (
                            <img
                                src={itemImage}
                                alt={slot.item.item.name.value}
                                style={styles.itemIcon}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzM0NDk1ZSIvPgo8dGV4dCB4PSIzMiIgeT0iMzYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5NWE1YTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPj88L3RleHQ+Cjwvc3ZnPgo=';
                                }}
                            />
                        ) : (
                            <div style={styles.loadingPlaceholder}>
                                <span>...</span>
                            </div>
                        )}
                    </div>

                    <div style={styles.itemName}>
                        {slot.item.item.name.value}
                    </div>

                    <div style={styles.itemControls}>
                        <button
                            style={styles.itemButton}
                            className="item-button"
                            onClick={removeItem}
                            disabled={slot.item.amount <= 0}
                        >
                            -
                        </button>

                        <span style={styles.itemCount}>{slot.item.amount}</span>

                        <button
                            style={styles.itemButton}
                            className="item-button"
                            onClick={addItem}
                        >
                            +
                        </button>
                    </div>
                </>
            ) : (
                <div style={styles.emptySlot}>
                    <div style={styles.itemIconContainer}>
                        <div style={styles.loadingPlaceholder}>
                            <span>-</span>
                        </div>
                    </div>
                    <div style={styles.itemName}>Empty</div>
                    <div style={styles.itemControls}>
                        <span style={styles.itemCount}>0</span>
                    </div>
                </div>
            )}
        </div>
    );
};

interface AllItemViewProps {
    item: SmartObjectsItem;
    index: number;
    onInventoryChange: () => void;
}

const AllItemView: React.FC<AllItemViewProps> = ({ item, index, onInventoryChange }) => {
    const [itemImage, setItemImage] = useState<string>('');

    useEffect(() => {
        if (item.icon) {
            item.icon.loadSprite((url: string | null) => {
                setItemImage(url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzM0NDk1ZSIvPgo8dGV4dCB4PSIzMiIgeT0iMzYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5NWE1YTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPj88L3RleHQ+Cjwvc3ZnPgo=');
            });
        }
    }, [item.icon]);

    const itemCount = Balancy.API.Inventory.getTotalItemsCount(item);

    const addItems = () => {
        Balancy.API.Inventory.addItems(item, 10);
        setTimeout(() => {
            onInventoryChange();
        }, 10);
    };

    const removeItems = () => {
        if (itemCount > 0) {
            Balancy.API.Inventory.removeItems(item, 10);
            setTimeout(() => {
                onInventoryChange();
            }, 10);
        }
    };

    return (
        <div
            style={styles.slotContainer}
            className="inventory-item"
            title={item.name.value || `Item ${index + 1}`}
        >
            <div style={styles.itemIconContainer}>
                {itemImage ? (
                    <img
                        src={itemImage}
                        alt={item.name.value}
                        style={styles.itemIcon}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzM0NDk1ZSIvPgo8dGV4dCB4PSIzMiIgeT0iMzYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5NWE1YTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPj88L3RleHQ+Cjwvc3ZnPgo=';
                        }}
                    />
                ) : (
                    <div style={styles.loadingPlaceholder}>
                        <span>...</span>
                    </div>
                )}
            </div>

            <div style={styles.itemName}>
                {item.name.value || `Item ${index + 1}`}
            </div>

            <div style={styles.itemControls}>
                <button
                    style={styles.itemButton}
                    className="item-button"
                    onClick={removeItems}
                    disabled={itemCount <= 0}
                >
                    -
                </button>

                <span style={styles.itemCount}>{itemCount}</span>

                <button
                    style={styles.itemButton}
                    className="item-button"
                    onClick={addItems}
                >
                    +
                </button>
            </div>
        </div>
    );
};

const InventoryPage: React.FC = () => {
    const [currencies, setCurrencies] = useState<SmartObjectsInventorySlot[]>([]);
    const [eventItems, setEventItems] = useState<SmartObjectsInventorySlot[]>([]);
    const [items, setItems] = useState<SmartObjectsInventorySlot[]>([]);
    const [allItems, setAllItems] = useState<SmartObjectsItem[]>([]);
    const [updateKey, setUpdateKey] = useState(0);

    const refreshInventory = () => {
        if (!Balancy.Main.isReadyToUse) {
            console.warn("Balancy is not ready to use.");
            return;
        }

        const profile = Balancy.Profiles.system;
        if (!profile) {
            console.error("Balancy profile is not available.");
            return;
        }

        const inventories = profile.inventories;
        setCurrencies([...inventories.currencies.slots.toArray()]);
        setEventItems([...inventories.eventItems.slots.toArray()]);
        setItems([...inventories.items.slots.toArray()]);

        // Load all items from CMS
        const cmsItems = Balancy.CMS.getModels(SmartObjectsItem, true);
        setAllItems([...cmsItems]);

        setUpdateKey(prev => prev + 1);
    };

    useEffect(() => {
        refreshInventory();
    }, []);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>🎒 Inventory</h2>

            {/* Currencies */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>💰 Currencies</h3>
                <div style={styles.inventoryGrid}>
                    {currencies.map((slot, index) => (
                        <InventorySlotView
                            key={`currency-${index}-${updateKey}`}
                            slot={slot}
                            onInventoryChange={refreshInventory}
                        />
                    ))}
                </div>
            </div>

            {/* Event Items */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🎉 Event Items</h3>
                <div style={styles.inventoryGrid}>
                    {eventItems.map((slot, index) => (
                        <InventorySlotView
                            key={`event-${index}-${updateKey}`}
                            slot={slot}
                            onInventoryChange={refreshInventory}
                        />
                    ))}
                </div>
            </div>

            {/* Items */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📦 Items</h3>
                <div style={styles.inventoryGrid}>
                    {items.map((slot, index) => (
                        <InventorySlotView
                            key={`item-${index}-${updateKey}`}
                            slot={slot}
                            onInventoryChange={refreshInventory}
                        />
                    ))}
                </div>
            </div>

            {/* All Items from CMS */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🗂️ All Items (CMS)</h3>
                <p style={styles.sectionDescription}>
                    All items available in the game. Use +/- buttons to add/remove items in batches of 10.
                </p>
                <div style={styles.inventoryGrid}>
                    {allItems.map((item, index) => (
                        <AllItemView
                            key={`all-item-${index}-${updateKey}`}
                            item={item}
                            index={index}
                            onInventoryChange={refreshInventory}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: "20px",
        backgroundColor: "#1a1a2e",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        overflowY: "auto",
        height: "calc(100vh - 200px)", // Assuming header is about 80px
        paddingBottom: "220px",
    },
    title: {
        fontSize: "2.2em",
        marginBottom: "30px",
        color: "#3498db",
        textAlign: "center",
    },
    section: {
        marginBottom: "40px",
    },
    sectionTitle: {
        fontSize: "1.5em",
        marginBottom: "20px",
        color: "#ecf0f1",
        borderBottom: "2px solid rgba(52, 152, 219, 0.3)",
        paddingBottom: "10px",
    },
    sectionDescription: {
        fontSize: "0.9em",
        color: "#95a5a6",
        marginBottom: "15px",
        fontStyle: "italic",
    },
    inventoryGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
        gap: "15px",
        maxWidth: "100%",
    },
    slotContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "rgba(44, 62, 80, 0.7)",
        borderRadius: "12px",
        padding: "10px",
        border: "2px solid rgba(52, 152, 219, 0.2)",
        transition: "all 0.2s ease",
        cursor: "pointer",
        width: "80px",
        minHeight: "80px",
    },
    emptySlot: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: 0.5,
        width: "100%",
    },
    itemIconContainer: {
        width: "50px",
        height: "50px",
        backgroundColor: "rgba(52, 73, 94, 0.5)",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "8px",
        flexShrink: 0,
    },
    itemIcon: {
        width: "40px",
        height: "40px",
        objectFit: "contain",
        borderRadius: "4px",
    },
    itemName: {
        fontSize: "10px",
        fontWeight: "bold",
        color: "#ecf0f1",
        textAlign: "center",
        marginBottom: "8px",
        lineHeight: "1.2",
        minHeight: "24px",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        textOverflow: "ellipsis",
        wordBreak: "break-word",
    },
    itemControls: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        gap: "4px",
        marginTop: "auto",
    },
    itemButton: {
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        border: "none",
        backgroundColor: "#3498db",
        color: "white",
        fontSize: "12px",
        fontWeight: "bold",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.2s ease",
        flexShrink: 0,
    },
    itemCount: {
        fontSize: "11px",
        fontWeight: "bold",
        color: "#ecf0f1",
        textAlign: "center",
        minWidth: "20px",
        flex: 1,
    },
    loadingPlaceholder: {
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#95a5a6",
        fontSize: "16px",
        fontWeight: "bold",
    },
};

// Add CSS for hover effects
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = `
        .inventory-item:hover {
            transform: scale(1.05);
            border-color: rgba(52, 152, 219, 0.5) !important;
        }
        
        .item-button:hover:not(:disabled) {
            background-color: #2980b9 !important;
            transform: scale(1.1);
        }
        
        .item-button:active:not(:disabled) {
            transform: scale(0.95);
        }
        
        .item-button:disabled {
            background-color: #7f8c8d !important;
            cursor: not-allowed;
            opacity: 0.5;
        }
    `;

    // Only add if not already added
    if (!document.head.querySelector('style[data-inventory-styles]')) {
        styleSheet.setAttribute('data-inventory-styles', 'true');
        document.head.appendChild(styleSheet);
    }
}

export default InventoryPage;
