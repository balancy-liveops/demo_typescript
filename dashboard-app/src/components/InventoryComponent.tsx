import React, { useState, useEffect } from 'react';
import { Balancy, SmartObjectsItem } from '@balancy/core';
import {BalancyStatusMaxHeight} from '../pages/BalancyStatus';

const InventoryComponent: React.FC = () => {
    const [inventoryRefreshTrigger, setInventoryRefreshTrigger] = useState(0);
    const [itemImages, setItemImages] = useState<{[key: number]: string}>({});

    const handleAddItems = (item: any) => {
        Balancy.API.Inventory.addItems(item, 10);
    };

    const handleRemoveItems = (item: any) => {
        Balancy.API.Inventory.removeItems(item, 10);
    };

    useEffect(() => {
        const onInventoryUpdated = () => {
            setInventoryRefreshTrigger(prev => prev + 1);
        };

        const onProfileResetFinish = () => {
            setInventoryRefreshTrigger(prev => prev + 1);
        };

        let inventoryCallbackId = Balancy.Callbacks.onInventoryWasUpdated.subscribe(onInventoryUpdated);
        let resetCallbackId = Balancy.Callbacks.onProfileResetFinish.subscribe(onProfileResetFinish);

        return () => {
            Balancy.Callbacks.onInventoryWasUpdated.unsubscribe(inventoryCallbackId);
            Balancy.Callbacks.onProfileResetFinish.unsubscribe(resetCallbackId);
        };
    }, []);

    useEffect(() => {
        const allItems = Balancy.CMS.getModels(SmartObjectsItem, true);

        allItems.forEach((item, index) => {
            item.icon?.loadSprite((url: string | null) => {
                setItemImages(prev => ({
                    ...prev,
                    [index]: url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzM0NDk1ZSIvPgo8dGV4dCB4PSIzMiIgeT0iMzYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5NWE1YTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPj88L3RleHQ+Cjwvc3ZnPgo='
                }));
            });
        });
    }, []);

    const allItems = Balancy.CMS.getModels(SmartObjectsItem, true);

    return (
        <div style={styles.inventorySection}>
            <h2 style={styles.inventoryTitle}>🎒 Inventory</h2>
            <div style={styles.inventoryContainer}>
                <div style={styles.inventoryGrid}>
                {allItems.map((item, index) => {
                    const itemCount = Balancy.API.Inventory.getTotalItemsCount(item);

                    return (
                        <div
                            key={`${index}-${inventoryRefreshTrigger}`}
                            style={styles.inventoryItem}
                            className="inventory-item"
                            title={item.name.value || `Item ${index + 1}`}
                        >
                            <div style={styles.itemIconContainer}>
                                {itemImages[index] ? (
                                    <img
                                        src={itemImages[index]}
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

                            <div style={styles.itemControls}>
                                <button
                                    style={styles.itemButton}
                                    className="item-button"
                                    onClick={() => handleRemoveItems(item)}
                                >
                                    -
                                </button>

                                <span style={styles.itemCount}>{itemCount}</span>

                                <button
                                    style={styles.itemButton}
                                    className="item-button"
                                    onClick={() => handleAddItems(item)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    );
                })}
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    inventorySection: {
        backgroundColor: 'rgba(52, 73, 94, 0.3)',
        borderRadius: '20px',
        border: '2px solid rgba(52, 152, 219, 0.3)',
        marginTop: '30px',
        maxWidth: '800px',
        width: '100%',
        // Ограничиваем высоту компонента с учетом навигации, заголовков и отступов
        maxHeight: `calc(100vh - 350px - ${BalancyStatusMaxHeight}px)`,
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
    },
    inventoryTitle: {
        margin: '10px 0',
        padding: '0 15px',
        fontSize: '1.2em',
        flexShrink: 0, // Заголовок не сжимается
    },
    inventoryContainer: {
        flex: 1, // Занимает оставшееся место
        overflowY: 'auto', // Включаем вертикальный скролл
        overflowX: 'hidden',
        padding: '5px 15px 15px',
        // Кастомный скроллбар для лучшего внешнего вида
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(52, 152, 219, 0.5) rgba(52, 73, 94, 0.3)',
    },
    inventoryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '10px',
        paddingBottom: '10px', // Добавляем отступ снизу для лучшего скролла
    },
    inventoryItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'rgba(44, 62, 80, 0.7)',
        borderRadius: '12px',
        padding: '8px',
        border: '2px solid rgba(52, 152, 219, 0.2)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
        width: '70px'
    },
    itemIconContainer: {
        width: '60px',
        height: '60px',
        backgroundColor: 'rgba(52, 73, 94, 0.5)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px'
    },
    itemIcon: {
        width: '50px',
        height: '50px',
        objectFit: 'contain',
        borderRadius: '4px'
    },
    itemControls: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: '4px'
    },
    itemButton: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: '#3498db',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s ease',
        flexShrink: 0
    },
    itemCount: {
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#ecf0f1',
        textAlign: 'center',
        minWidth: '20px',
        flex: 1
    },
    loadingPlaceholder: {
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#95a5a6',
        fontSize: '16px',
        fontWeight: 'bold'
    }
};

export default InventoryComponent;
