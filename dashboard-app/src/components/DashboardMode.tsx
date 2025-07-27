import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { BalancyConfigParams } from '../balancyLoader';
import { Balancy, SmartObjectsItem } from '@balancy/core';
import { BalancyMainUI } from './BalancyMainUI';

interface DashboardModeProps {
    currentConfig: BalancyConfigParams;
    onToggleRenderMode: () => void;
    onDisconnect: () => void;
}

const DashboardMode: React.FC<DashboardModeProps> = ({
    currentConfig,
    onToggleRenderMode,
    onDisconnect
}) => {
    const [inventoryUpdateTrigger, setInventoryUpdateTrigger] = useState(0);
    const [itemImages, setItemImages] = useState<{[key: number]: string}>({});

    const handleReset = () => {
        Balancy.Profiles.reset();
        setInventoryUpdateTrigger(prev => prev + 1);
    };

    const handleAddItems = (item: any) => {
        Balancy.API.Inventory.addItems(item, 10);
        setInventoryUpdateTrigger(prev => prev + 1);
    };

    const handleRemoveItems = (item: any) => {
        Balancy.API.Inventory.removeItems(item, 10);
        setInventoryUpdateTrigger(prev => prev + 1);
    };

    // Load item images when component mounts
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
        <Router>
            <div style={styles.container}>
                {/* Navigation Bar */}
                <nav style={styles.nav}>
                    <div style={styles.navLeft}>
                        <button
                            style={styles.modeToggleButton}
                            onClick={onToggleRenderMode}
                            title="Switch to React App Mode"
                        >
                            ⚙️ Console
                        </button>
                    </div>
                    <div style={styles.navLeft}>
                        {/*<span>Game ID: {currentConfig.apiGameId}</span>*/}
                        <span>User ID: {Balancy.Profiles.system?.generalInfo.profileId}</span>
                    </div>
                    <div style={styles.navRight}>
                        <button style={styles.resetButton} onClick={handleReset}>
                            Reset
                        </button>
                    </div>
                </nav>

                {/* Main Content Area */}
                <div style={styles.mainContent}>
                    <h1 style={styles.title}>Game Simulation Screen</h1>
                    <p style={styles.subtitle}>
                        Active events and offers will appear on the left and right sides of the screen
                    </p>

                    {/* Simulated game content */}
                    <div style={styles.gameContent}>
                        {/* Inventory Section */}
                        <div style={styles.inventorySection}>
                            <h2>🎒 Inventory</h2>
                            <div style={styles.inventoryGrid}>
                                {allItems.map((item, index) => {
                                    const itemCount = Balancy.API.Inventory.getTotalItemsCount(item);

                                    return (
                                        <div
                                            key={index}
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
                </div>

                {/* Balancy UI - Events and Offers on sides */}
                <BalancyMainUI />
            </div>
        </Router>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        height: '100vh',
        width: '100vw',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        margin: 0,
        padding: 0
    },
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 15, 30, 0.9)',
        padding: '15px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        height: '70px',
        boxSizing: 'border-box'
    },
    navLeft: {
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        alignItems: 'center',
        fontSize: '75%',
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    modeToggleButton: {
        backgroundColor: '#3498db',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'all 0.2s ease',
        marginRight: '10px'
    },
    resetButton: {
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'background-color 0.2s'
    },
    mainContent: {
        padding: '20px 100px',
        textAlign: 'center',
        height: 'calc(100vh - 70px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box'
    },
    title: {
        fontSize: '2.2em',
        marginBottom: '10px',
        color: '#3498db'
    },
    subtitle: {
        fontSize: '1.1em',
        color: '#95a5a6',
        marginBottom: '30px'
    },
    gameContent: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    inventorySection: {
        backgroundColor: 'rgba(52, 73, 94, 0.3)',
        borderRadius: '20px',
        padding: '5px',
        border: '2px solid rgba(52, 152, 219, 0.3)',
        marginTop: '30px',
        maxWidth: '800px',
        width: '100%'
    },
    inventoryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '10px',
        marginTop: '20px'
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

// Add CSS for hover effects
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerHTML = `
    .inventory-item:hover {
        transform: scale(1.05);
        border-color: rgba(52, 152, 219, 0.5) !important;
    }
    
    .item-button:hover {
        background-color: #2980b9 !important;
        transform: scale(1.1);
    }
    
    .item-button:active {
        transform: scale(0.95);
    }
`;
document.head.appendChild(styleSheet);

export default DashboardMode;
