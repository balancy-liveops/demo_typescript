import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {BalancyConfigParams} from '../balancyLoader';
import {Balancy} from '@balancy/core';
import {BalancyMainUI} from './BalancyMainUI';
import InventoryComponent from './InventoryComponent';
import BalancyStatus from '../pages/BalancyStatus';
import {commonHeaderStyles} from './common/styles';
import DeviceSelect from "../features/deviceSelect/DeviceSelect";
import {DeviceSelectProvider} from "../features/deviceSelect/context";
import DeviceWrapper from "../features/deviceSelect/DeviceWrapper";

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

    const [level, setLevel] = useState<number>(0);
    const [winStreak, setWinStreak] = useState<number>(0);

    const handleReset = () => {
        if (Balancy.Profiles?.reset) {
            Balancy.Profiles.reset();
            updateGameStats();
        }
    };

    const updateGameStats = () => {
        if (Balancy.Profiles.system?.generalInfo) {
            const generalInfo = Balancy.Profiles.system.generalInfo as any;
            setLevel(generalInfo.level || 0);
            setWinStreak(generalInfo.winStreak || 0);
        } else {
            setLevel(1);
            setWinStreak(0);
        }
    };

    const handleWin = () => {
        Balancy.API.General.levelCompleted();
        updateGameStats();
    };

    const handleLose = () => {
        Balancy.API.General.levelFailed();
        updateGameStats();
    };

    const handleOpenShop = () => {
        Balancy.Profiles.system?.shopsInfo?.activeShopInfo?.shop?.unnyView?.openView((success: boolean)=> {
            console.log("shop opened ? ", success);
        }, Balancy.Profiles.system?.shopsInfo?.activeShopInfo);
    };

    useEffect(() => {
        updateGameStats();
    }, []);

    return (
        <Router>
            <DeviceSelectProvider>
                <DeviceWrapper>
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
                                <span>User ID: {Balancy.Profiles.system?.generalInfo ? (Balancy.Profiles.system.generalInfo as any).profileId : 'Loading...'}</span>
                                <DeviceSelect/>
                            </div>
                            <div style={styles.navRight}>
                                <button style={styles.resetButton} onClick={handleReset}>
                                    Reset
                                </button>
                            </div>
                        </nav>

                        <BalancyStatus/>

                        {/* Main Content Area */}
                        <div style={styles.mainContent}>
                            <h1 style={styles.title}>Game Simulation</h1>

                            {/* Game Stats */}
                            <div style={styles.gameStats}>
                                <div style={styles.statItem}>
                                    <span style={styles.statLabel}>Current Level:</span>
                                    <span style={styles.statValue}>{level}</span>
                                </div>
                                <div style={styles.statItem}>
                                    <span style={styles.statLabel}>Win Streak:</span>
                                    <span style={styles.statValue}>{winStreak}</span>
                                </div>
                            </div>

                            {/* Simulation Buttons */}
                            <div style={styles.simulationButtons}>
                                <button
                                    className="action-button win-button"
                                    style={{...styles.actionButton, ...styles.winButton}}
                                    onClick={handleWin}
                                >
                                    🏆 Win
                                </button>
                                <button
                                    className="action-button lose-button"
                                    style={{...styles.actionButton, ...styles.loseButton}}
                                    onClick={handleLose}
                                >
                                    ❌ Lose
                                </button>
                            </div>

                            {Balancy.Profiles.system?.shopsInfo?.activeShopInfo && (
                                <div style={styles.shopButtonContainer}>
                                    <button
                                        style={{...styles.actionButton, ...styles.shopButton}}
                                        onClick={handleOpenShop}>
                                        🛒 Open Shop
                                    </button>
                                </div>
                            )}

                            {/* Simulated game content */}
                            <div style={styles.gameContent}>
                                {/* Inventory Component */}
                                <InventoryComponent />
                            </div>
                        </div>

                        {/* Balancy UI - Events and Offers on sides */}
                        <BalancyMainUI />
                    </div>
                </DeviceWrapper>
            </DeviceSelectProvider>
        </Router>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        height: '100%',
        width: '100%',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        margin: 0,
        padding: 0
    },
    nav: {
        ...commonHeaderStyles,
        backgroundColor: 'rgba(15, 15, 30, 0.9)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
    },
    navLeft: {
        display: 'flex',
        flexDirection: 'column',
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
    gameStats: {
        display: 'flex',
        gap: '40px',
        justifyContent: 'center',
        marginBottom: '25px',
        flexShrink: 0
    },
    statItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '15px 25px',
        backgroundColor: 'rgba(52, 73, 94, 0.3)',
        borderRadius: '10px',
        border: '1px solid rgba(52, 152, 219, 0.3)'
    },
    statLabel: {
        fontSize: '0.9em',
        color: '#95a5a6',
        marginBottom: '8px',
        fontWeight: 'normal'
    },
    statValue: {
        fontSize: '1.8em',
        color: '#3498db',
        fontWeight: 'bold'
    },
    simulationButtons: {
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        marginBottom: '30px',
        flexShrink: 0
    },
    actionButton: {
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        minWidth: '120px'
    },
    winButton: {
        backgroundColor: '#27ae60',
        color: '#fff',
    },
    loseButton: {
        backgroundColor: '#e74c3c',
        color: '#fff',
    },
    shopButtonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
        flexShrink: 0
    },
    shopButton: {
        backgroundColor: '#9b59b6',
        color: '#fff',
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
    
    /* Стили для кнопок симуляции */
    .action-button:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .action-button:active {
        transform: scale(0.95);
    }
    
    .win-button:hover {
        background-color: #229954 !important;
    }
    
    .lose-button:hover {
        background-color: #c0392b !important;
    }
`;
document.head.appendChild(styleSheet);

export default DashboardMode;
