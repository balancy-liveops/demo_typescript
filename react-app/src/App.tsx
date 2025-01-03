import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { initializeBalancy } from './balancyLoader';
import GeneralInfoPage from "./pages/GeneralInfoPage";
import ABTestsPage from "./pages/ABTestsPage";
import SegmentationPage from "./pages/SegmentationPage";

const App: React.FC = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBalancy = async () => {
            try {
                await initializeBalancy();
                setLoading(false);
            } catch (error) {
                console.error('Error initializing Balancy:', error);
            }
        };

        addKeyframes();
        loadBalancy();
    }, []);

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
                    <Link to="/" style={styles.tab}>Home</Link>
                    <Link to="/info" style={styles.tab}>Info</Link>
                    <Link to="/ab-tests" style={styles.tab}>AB Tests</Link>
                    <Link to="/segmentation" style={styles.tab}>Segmentation</Link>
                    <Link to="/about" style={styles.tab}>About</Link>
                    <Link to="/contact" style={styles.tab}>Contact</Link>
                </nav>

                <div style={styles.content}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/info" element={<GeneralInfoPage />} />
                        <Route path="/ab-tests" element={<ABTestsPage />} />
                        <Route path="/segmentation" element={<SegmentationPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    nav: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        padding: '10px',
    },
    tab: {
        margin: '0 15px',
        textDecoration: 'none',
        color: '#007bff',
        fontWeight: 'bold',
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
