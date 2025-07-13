import React, { useEffect, useState } from "react";
import { Balancy, SmartObjectsInventory, SmartObjectsInventorySlot } from "@balancy/core";

interface InventorySlotViewProps {
    slot: SmartObjectsInventorySlot;
    onInventoryChange: () => void;
}

const InventorySlotView: React.FC<InventorySlotViewProps> = ({ slot, onInventoryChange }) => {
    const addItem = () => {
        if (slot.item) {
            Balancy.API.Inventory.addItems(slot.item.item, 1);
            // Добавляем небольшую задержку для обновления
            setTimeout(() => {
                onInventoryChange();
            }, 10);
        }
    };

    const removeItem = () => {
        if (slot.item && slot.item.amount > 0) {
            Balancy.API.Inventory.removeItems(slot.item.item, 1);
            // Добавляем небольшую задержку для обновления
            setTimeout(() => {
                onInventoryChange();
            }, 10);
        }
    };

    return (
        <div style={styles.slotContainer}>
            {slot.item && slot.item.item ? (
                <>
                    <h4>{slot.item.item.name.value}</h4>
                    <p>ID: {slot.item.item.unnyId}</p>
                    <p>Amount: x{slot.item.amount}</p>
                    <div style={styles.buttons}>
                        <button onClick={removeItem} style={styles.button}>-</button>
                        <button onClick={addItem} style={styles.button}>+</button>
                    </div>
                </>
            ) : (
                <p>Empty Slot</p>
            )}
        </div>
    );
};

const InventoryPage: React.FC = () => {
    const [currencies, setCurrencies] = useState<SmartObjectsInventorySlot[]>([]);
    const [eventItems, setEventItems] = useState<SmartObjectsInventorySlot[]>([]);
    const [items, setItems] = useState<SmartObjectsInventorySlot[]>([]);
    const [updateKey, setUpdateKey] = useState(0); // Для принудительного обновления

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
        setCurrencies([...inventories.currencies.slots.toArray()]); // Создаем новый массив
        setEventItems([...inventories.eventItems.slots.toArray()]); // Создаем новый массив
        setItems([...inventories.items.slots.toArray()]); // Создаем новый массив
        setUpdateKey(prev => prev + 1); // Обновляем ключ для принудительного рендера
    };

    useEffect(() => {
        refreshInventory();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h2>Inventory</h2>

            {/* Currencies */}
            <div>
                <h3>Currencies</h3>
                <div style={styles.horizontalScroll}>
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
            <div>
                <h3>Event Items</h3>
                <div style={styles.horizontalScroll}>
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
            <div>
                <h3>Items</h3>
                <div style={styles.horizontalScroll}>
                    {items.map((slot, index) => (
                        <InventorySlotView 
                            key={`item-${index}-${updateKey}`} 
                            slot={slot} 
                            onInventoryChange={refreshInventory}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    horizontalScroll: {
        display: "flex",
        overflowX: "auto",
        gap: "10px",
        padding: "10px 0",
    },
    slotContainer: {
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "5px",
        minWidth: "200px",
        textAlign: "center",
        backgroundColor: "#f9f9f9",
    },
    buttons: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
    },
    button: {
        padding: "5px 10px",
        cursor: "pointer",
    },
};

export default InventoryPage;
