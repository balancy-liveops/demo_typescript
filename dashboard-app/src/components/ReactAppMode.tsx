import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BalancyConfigParams } from '../balancyLoader';
import { Balancy } from '@balancy/core';

// Import all page components
import HomePage from '../pages/HomePage';
import GeneralInfoPage from "../pages/GeneralInfoPage";
import ABTestsPage from "../pages/ABTestsPage";
import SegmentationPage from "../pages/SegmentationPage";
import AdsPage from "../pages/AdsPage";
import GameEventsPage from "../pages/GameEventsPage";
import InventoryPage from "../pages/InventoryPage";
import GameOffersPage from "../pages/GameOffersPage";
import ShopPage from "../pages/ShopPage";
import UserPropertiesPage from "../pages/UserPropertiesPage";
import LanguagesPage from "../pages/LanguagesPage";
import TimeCheatPage from "../pages/TimeCheatPage";
import DailyBonusPage from "../pages/DailyBonusPage";
import BalancyStatus from "../pages/BalancyStatus";
import {commonHeaderStyles} from "./common/styles";

interface ReactAppModeProps {
    currentConfig: BalancyConfigParams;
    onToggleRenderMode: () => void;
    onDisconnect: () => void;
}

// Define navigation items
const navItems = [
    { path: '/', label: '🏠 Home', value: 'home' },
    { path: '/info', label: 'ℹ️ Info', value: 'info' },
    { path: '/ab-tests', label: '🧪 AB Tests', value: 'ab-tests' },
    { path: '/segmentation', label: '🎯 Segmentation', value: 'segmentation' },
    { path: '/ads', label: '📱 Ads', value: 'ads' },
    { path: '/game-events', label: '🎮 Game Events', value: 'game-events' },
    { path: '/offers', label: '💰 Offers', value: 'offers' },
    { path: '/shop', label: '🛒 Shop', value: 'shop' },
    { path: '/inventory', label: '🎒 Inventory', value: 'inventory' },
    { path: '/daily-bonus', label: '🎁 Daily Bonus', value: 'daily-bonus' },
    { path: '/user-properties', label: '👤 User Properties', value: 'user-properties' },
    { path: '/languages', label: '🌐 Languages', value: 'languages' },
    { path: '/time', label: '⏰ Time', value: 'time' }
];

const ReactAppMode: React.FC<ReactAppModeProps> = ({
    currentConfig,
    onToggleRenderMode,
    onDisconnect
}) => {
    const handleReset = () => {
        Balancy.Profiles.reset();
    };

    // Function to handle route changes and ensure URL params persist
    const handleRouteChange = () => {
        // Update URL with config params when routes change
        const url = new URL(window.location.href);
        url.searchParams.set('game_id', currentConfig.apiGameId);
        url.searchParams.set('public_key', currentConfig.publicKey);
        url.searchParams.set('environment', Number(currentConfig.environment).toString());

        if (currentConfig.deviceId) {
            url.searchParams.set('device_id', currentConfig.deviceId);
        }

        if (currentConfig.appVersion) {
            url.searchParams.set('app_version', currentConfig.appVersion);
        }

        if (currentConfig.branchName) {
            url.searchParams.set('branch_name', currentConfig.branchName);
        }

        window.history.replaceState({}, '', url.toString());
    };

    return (
        <Router>
            <RouteChangeHandler onRouteChange={handleRouteChange} />
            <div>
                <nav style={styles.nav}>
                    <div style={styles.navLeft}>
                        <button
                            style={styles.modeToggleButton}
                            onClick={onToggleRenderMode}
                            title="Switch to Dashboard Mode"
                            className="mode-toggle-button"
                        >
                            🎮 Game Mode
                        </button>
                    </div>
                    <div style={styles.navCenter}>
                        <NavigationDropdown />
                    </div>
                    <div style={styles.navRight}>
                        <button
                            style={styles.resetButton}
                            onClick={handleReset}
                            className="reset-button"
                        >
                            Reset
                        </button>
                    </div>
                </nav>

                <BalancyStatus />

                <div style={styles.content}>
                    <Routes>
                        <Route path="/" element={<HomePage config={currentConfig} onDisconnect={onDisconnect} />} />
                        <Route path="/info" element={<GeneralInfoPage />} />
                        <Route path="/ab-tests" element={<ABTestsPage />} />
                        <Route path="/segmentation" element={<SegmentationPage />} />
                        <Route path="/ads" element={<AdsPage />} />
                        <Route path="/game-events" element={<GameEventsPage />} />
                        <Route path="/offers" element={<GameOffersPage />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route path="/daily-bonus" element={<DailyBonusPage />} />
                        <Route path="/user-properties" element={<UserPropertiesPage />} />
                        <Route path="/languages" element={<LanguagesPage />} />
                        <Route path="/time" element={<TimeCheatPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

// Navigation Dropdown Component
const NavigationDropdown: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    // Find current page info
    const currentPage = navItems.find(item => item.path === location.pathname) || navItems[0];

    const handleNavigation = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.dropdown-container')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="dropdown-container" style={styles.dropdown}>
            <button
                style={styles.dropdownButton}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }
                }}
            >
                <span style={styles.currentPageLabel}>{currentPage.label}</span>
                <span style={{...styles.dropdownArrow, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                    ▼
                </span>
            </button>

            {isOpen && (
                <div style={styles.dropdownMenu}>
                    {navItems.map((item) => (
                        <button
                            key={item.value}
                            style={{
                                ...styles.dropdownItem,
                                ...(item.path === location.pathname ? styles.dropdownItemActive : {})
                            }}
                            onClick={() => handleNavigation(item.path)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleNavigation(item.path);
                                }
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Helper component to detect route changes
const RouteChangeHandler: React.FC<{ onRouteChange: () => void }> = ({ onRouteChange }) => {
    const location = useLocation();

    useEffect(() => {
        onRouteChange();
    }, [location, onRouteChange]);

    return null;
};

const styles: { [key: string]: React.CSSProperties } = {
    nav: {
        ...commonHeaderStyles,
        backgroundColor: '#f0f0f0',
        position: 'relative'
    },
    navLeft: {
        display: 'flex',
        alignItems: 'center'
    },
    navCenter: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
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
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'all 0.2s ease'
    },
    resetButton: {
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'background-color 0.2s ease'
    },
    content: {
        padding: '20px',
        textAlign: 'center',
    },
    // Dropdown Styles
    dropdown: {
        position: 'relative',
        display: 'inline-block'
    },
    dropdownButton: {
        backgroundColor: '#fff',
        border: '2px solid #007bff',
        borderRadius: '6px',
        padding: '10px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#007bff',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '180px',
        transition: 'all 0.2s ease',
        outline: 'none'
    },
    currentPageLabel: {
        flex: 1,
        textAlign: 'left'
    },
    dropdownArrow: {
        fontSize: '12px',
        transition: 'transform 0.2s ease',
        color: '#007bff'
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        border: '2px solid #007bff',
        borderTop: 'none',
        borderRadius: '0 0 6px 6px',
        zIndex: 1000,
        maxHeight: '600px',
        overflowY: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    dropdownItem: {
        width: '100%',
        padding: '12px 16px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '14px',
        textAlign: 'left',
        color: '#333',
        transition: 'all 0.2s ease',
        outline: 'none',
        borderBottom: '1px solid #f0f0f0'
    },
    dropdownItemActive: {
        backgroundColor: '#007bff',
        color: '#fff',
        fontWeight: 'bold'
    }
};

// Add hover styles
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerHTML = `
    .dropdown-container button:hover {
        background-color: #007bff !important;
        color: #fff !important;
    }
    
    .dropdown-container button:hover span {
        color: #fff !important;
    }
    
    .dropdown-menu button:hover:not([style*="background-color: rgb(0, 123, 255)"]) {
        background-color: #f8f9fa !important;
        color: #007bff !important;
    }
    
    .dropdown-menu button:last-child {
        border-bottom: none !important;
    }
    
    .reset-button:hover {
        background-color: #c82333 !important;
    }
    
    .mode-toggle-button:hover {
        background-color: #2980b9 !important;
    }
`;
document.head.appendChild(styleSheet);

export default ReactAppMode;
