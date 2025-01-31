import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { initializeBalancy } from './balancyLoader';
import GeneralInfoPage from "./pages/GeneralInfoPage";
import ABTestsPage from "./pages/ABTestsPage";
import SegmentationPage from "./pages/SegmentationPage";
import AdsPage from "./pages/AdsPage";
import GameEventsPage from "./pages/GameEventsPage";
import InventoryPage from "./pages/InventoryPage";
import GameOffersPage from "./pages/GameOffersPage";
import { Balancy} from '@balancy/core';
import ShopPage from "./pages/ShopPage";
import UserPropertiesPage from "./pages/UserPropertiesPage";
import LanguagesPage from "./pages/LanguagesPage";
import TimeCheatPage from "./pages/TimeCheatPage";
import DailyBonusPage from "./pages/DailyBonusPage";
import BalancyStatus from "./pages/BalancyStatus";

const App: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const initializedRef = React.useRef(false);

    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            const loadBalancy = async () => {
                try {
                    await initializeBalancy();
                    setLoading(false);
                } catch (error) {
                    console.error('Error initializing Balancy:', error);
                }
            };
            loadBalancy();
        }
        addKeyframes();

    }, []);

    const handleReset = () => {
        // console.log("Resetting the app...");
        Balancy.Profiles.reset();
        // Add logic for resetting, e.g., clearing local storage, resetting state, etc.
    };

    if (loading) {
        return (
            <div style={styles.loaderContainer}>
                <div style={styles.loader}></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <Router>
            <div>
                <nav style={styles.nav}>
                    <div style={styles.navLeft}>
                        <Link to="/" style={styles.tab}>Home</Link>
                        <Link to="/info" style={styles.tab}>Info</Link>
                        <Link to="/ab-tests" style={styles.tab}>AB Tests</Link>
                        <Link to="/segmentation" style={styles.tab}>Segmentation</Link>
                        <Link to="/ads" style={styles.tab}>Ads</Link>
                        <Link to="/game-events" style={styles.tab}>Game Events</Link>
                        <Link to="/offers" style={styles.tab}>Offers</Link>
                        <Link to="/shop" style={styles.tab}>Shop</Link>
                        <Link to="/inventory" style={styles.tab}>Inventory</Link>
                        <Link to="/daily-bonus" style={styles.tab}>Daily Bonus</Link>
                        <Link to="/user-properties" style={styles.tab}>User Properties</Link>
                        <Link to="/languages" style={styles.tab}>Languages</Link>
                        <Link to="/time" style={styles.tab}>Time</Link>
                    </div>
                    <button style={styles.resetButton} onClick={handleReset}>Reset</button>
                </nav>

                <BalancyStatus />

                <div style={styles.content}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
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
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between', // Adjust for reset button
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: '10px',
    },
    navLeft: {
        display: 'flex',
        gap: '10px',
    },
    tab: {
        margin: '0 10px',
        textDecoration: 'none',
        color: '#007bff',
        fontWeight: 'bold',
    },
    resetButton: {
        backgroundColor: '#dc3545', // Red button
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: 'pointer',
    },
    content: {
        padding: '20px',
        textAlign: 'center',
    },
    loaderContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
    loader: {
        width: '50px',
        height: '50px',
        border: '5px solid #ccc',
        borderTop: '5px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
};

function addKeyframes() {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

export default App;
