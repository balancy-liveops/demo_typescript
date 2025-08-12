import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { BalancyConfigParams } from '../balancyLoader';
import { Balancy } from '@balancy/core';
import { BalancyMainUI } from './BalancyMainUI';
import InventoryComponent from './InventoryComponent';

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

    const handleReset = () => {
        Balancy.Profiles.reset();
    };



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
                        {/* Inventory Component */}
                        <InventoryComponent />
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
        // Изменяем с center на flex-start, чтобы контент не выходил за пределы экрана
        justifyContent: 'flex-start',
        alignItems: 'center',
        // Убираем overflow: 'hidden', чтобы разрешить скролл внутри компонентов
        overflow: 'visible',
        boxSizing: 'border-box'
    },
    title: {
        fontSize: '2.2em',
        marginBottom: '10px',
        color: '#3498db',
        // Делаем заголовок не сжимаемым
        flexShrink: 0
    },
    subtitle: {
        fontSize: '1.1em',
        color: '#95a5a6',
        marginBottom: '30px',
        // Делаем подзаголовок не сжимаемым
        flexShrink: 0
    },
    gameContent: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start', // Изменяем с center на flex-start
        flex: 1,
        width: '100%',
        // Ограничиваем высоту, чтобы не выходить за пределы доступного пространства
        minHeight: 0, // Важно для правильной работы flex
    },

};

// Add CSS for hover effects and custom scrollbar
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

    /* Кастомные стили для скроллбара в WebKit браузерах */
    .inventory-container::-webkit-scrollbar {
        width: 8px;
    }

    .inventory-container::-webkit-scrollbar-track {
        background: rgba(52, 73, 94, 0.3);
        border-radius: 4px;
    }

    .inventory-container::-webkit-scrollbar-thumb {
        background: rgba(52, 152, 219, 0.5);
        border-radius: 4px;
    }

    .inventory-container::-webkit-scrollbar-thumb:hover {
        background: rgba(52, 152, 219, 0.7);
    }
`;
document.head.appendChild(styleSheet);

export default DashboardMode;
