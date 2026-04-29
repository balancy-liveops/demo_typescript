import React, { useEffect, useState, useCallback } from "react";
import {
    Balancy,
    SmartObjectsUnnyProfile,
    SmartObjectsAnalyticsABTest,
    SmartObjectsAnalyticsABTestVariant,
    SmartObjectsAbTestInfo,
    SmartObjectsAnalyticsAbTestStatus,
} from "@balancy/core";

interface ActiveTest {
    testInfo: SmartObjectsAbTestInfo;
    abTest: SmartObjectsAnalyticsABTest;
}

interface SkippedTest {
    testId: string;
    abTest: SmartObjectsAnalyticsABTest | null;
}

const ABTestsPage: React.FC = () => {
    const [activeTests, setActiveTests] = useState<ActiveTest[]>([]);
    const [skippedTests, setSkippedTests] = useState<SkippedTest[]>([]);
    const [expandedTest, setExpandedTest] = useState<string | null>(null);

    const refreshData = useCallback(() => {
        const profile = Balancy.Profiles.system as SmartObjectsUnnyProfile | null;
        if (!profile || !profile.testsInfo) return;

        const info = profile.testsInfo;

        const active: ActiveTest[] = [];
        for (let i = 0; i < info.tests.count; i++) {
            const testInfo = info.tests.get(i);
            if (testInfo?.test) {
                active.push({ testInfo, abTest: testInfo.test });
            }
        }
        setActiveTests(active);

        const skipped: SkippedTest[] = info.avoidedTests.map((testId) => ({
            testId,
            abTest: Balancy.CMS.getModelByUnnyId<SmartObjectsAnalyticsABTest>(testId),
        }));
        setSkippedTests(skipped);
    }, []);

    useEffect(() => {
        refreshData();
        const intervalId = setInterval(refreshData, 1000);
        return () => clearInterval(intervalId);
    }, [refreshData]);

    const handleChangeVariant = (abTest: SmartObjectsAnalyticsABTest, variant: SmartObjectsAnalyticsABTestVariant) => {
        const result = Balancy.API.startAbTestManually(abTest, variant);
        if (result) {
            refreshData();
        }
    };

    const handleStartTest = (abTest: SmartObjectsAnalyticsABTest, variant: SmartObjectsAnalyticsABTestVariant) => {
        const result = Balancy.API.startAbTestManually(abTest, variant);
        if (result) {
            refreshData();
        }
    };

    const handleFinishTest = (abTest: SmartObjectsAnalyticsABTest) => {
        const result = Balancy.API.startAbTestManually(abTest, null);
        if (result) {
            refreshData();
        }
    };

    const toggleExpanded = (testId: string) => {
        setExpandedTest((prev) => (prev === testId ? null : testId));
    };

    const renderVariantSelector = (
        abTest: SmartObjectsAnalyticsABTest,
        currentVariantName: string | undefined
    ) => {
        const variants = abTest.variants || [];

        return (
            <div style={styles.variantSelector}>
                {variants.map((variant, idx) => {
                    if (!variant) return null;
                    const isActive = variant.name === currentVariantName;
                    return (
                        <button
                            key={idx}
                            style={{
                                ...styles.variantButton,
                                ...(isActive ? styles.variantButtonActive : {}),
                            }}
                            onClick={() => handleChangeVariant(abTest, variant)}
                            title={`Switch to variant "${variant.name}"`}
                        >
                            {variant.name}
                            {variant.weight > 0 && (
                                <span style={styles.variantWeight}>{variant.weight}%</span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.header}>
                <h2 style={styles.title}>A/B Tests</h2>
            </div>

            <div style={styles.scrollableContent}>
                {/* Active Tests */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>
                        Active Tests
                        <span style={styles.countBadge}>{activeTests.length}</span>
                    </h3>
                    {activeTests.length === 0 ? (
                        <div style={styles.emptyState}>No active A/B tests</div>
                    ) : (
                        activeTests.map(({ testInfo, abTest }) => {
                            const isExpanded = expandedTest === abTest.unnyId;
                            return (
                                <div
                                    key={abTest.unnyId}
                                    style={{
                                        ...styles.testCard,
                                        ...(testInfo.finished ? styles.testCardFinished : {}),
                                    }}
                                >
                                    <div
                                        style={styles.testCardHeader}
                                        onClick={() => toggleExpanded(abTest.unnyId)}
                                    >
                                        <div style={styles.testCardInfo}>
                                            <span style={styles.testName}>{abTest.name}</span>
                                            <span style={styles.testId}>{abTest.unnyId}</span>
                                        </div>
                                        <div style={styles.testCardRight}>
                                            <span
                                                style={{
                                                    ...styles.statusBadge,
                                                    ...(testInfo.finished
                                                        ? styles.statusFinished
                                                        : styles.statusActive),
                                                }}
                                            >
                                                {testInfo.finished ? "Finished" : "Running"}
                                            </span>
                                            <span style={styles.currentGroup}>
                                                Group: <strong>{testInfo.variant?.name || "—"}</strong>
                                            </span>
                                            <span style={styles.expandArrow}>
                                                {isExpanded ? "▲" : "▼"}
                                            </span>
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div style={styles.testCardBody}>
                                            <div style={styles.bodySection}>
                                                <span style={styles.bodyLabel}>Switch group:</span>
                                                {renderVariantSelector(abTest, testInfo.variant?.name)}
                                            </div>
                                            {!testInfo.finished && (
                                                <div style={styles.bodySection}>
                                                    <button
                                                        style={styles.finishButton}
                                                        onClick={() => handleFinishTest(abTest)}
                                                    >
                                                        Finish Test
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Skipped Tests */}
                {skippedTests.length > 0 && (
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            Skipped Tests
                            <span style={styles.countBadge}>{skippedTests.length}</span>
                        </h3>
                        {skippedTests.map(({ testId, abTest }) => {
                            const isExpanded = expandedTest === testId;
                            return (
                                <div key={testId} style={{ ...styles.testCard, ...styles.testCardSkipped }}>
                                    <div
                                        style={styles.testCardHeader}
                                        onClick={() => toggleExpanded(testId)}
                                    >
                                        <div style={styles.testCardInfo}>
                                            <span style={styles.testName}>
                                                {abTest?.name || "Unknown Test"}
                                            </span>
                                            <span style={styles.testId}>{testId}</span>
                                        </div>
                                        <div style={styles.testCardRight}>
                                            <span style={{ ...styles.statusBadge, ...styles.statusSkipped }}>
                                                Skipped
                                            </span>
                                            {abTest && (
                                                <span style={styles.expandArrow}>
                                                    {isExpanded ? "▲" : "▼"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {isExpanded && abTest && (
                                        <div style={styles.testCardBody}>
                                            <div style={styles.bodySection}>
                                                <span style={styles.bodyLabel}>
                                                    Force join with group:
                                                </span>
                                                <div style={styles.variantSelector}>
                                                    {(abTest.variants || []).map((variant, idx) => {
                                                        if (!variant) return null;
                                                        return (
                                                            <button
                                                                key={idx}
                                                                style={styles.variantButton}
                                                                onClick={() =>
                                                                    handleStartTest(abTest, variant)
                                                                }
                                                                title={`Start test with variant "${variant.name}"`}
                                                            >
                                                                {variant.name}
                                                                {variant.weight > 0 && (
                                                                    <span style={styles.variantWeight}>
                                                                        {variant.weight}%
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: {
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 200px)",
        boxSizing: "border-box",
    },
    header: {
        padding: "20px",
        flexShrink: 0,
        borderBottom: "1px solid #ddd",
        backgroundColor: "#fff",
        zIndex: 1,
        boxSizing: "border-box",
    },
    title: {
        margin: 0,
        fontSize: "24px",
        fontWeight: "bold",
        color: "#333",
    },
    scrollableContent: {
        flex: 1,
        overflow: "auto",
        padding: "20px",
        paddingBottom: "40px",
        boxSizing: "border-box",
    },
    section: {
        marginBottom: "30px",
    },
    sectionTitle: {
        margin: 0,
        marginBottom: "15px",
        fontSize: "20px",
        fontWeight: "bold",
        color: "#555",
        borderBottom: "2px solid #ddd",
        paddingBottom: "8px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    countBadge: {
        fontSize: "13px",
        fontWeight: "normal",
        backgroundColor: "#e0e0e0",
        color: "#555",
        borderRadius: "12px",
        padding: "2px 10px",
    },
    emptyState: {
        color: "#999",
        fontStyle: "italic",
        padding: "15px",
        textAlign: "center",
    },
    testCard: {
        border: "1px solid #ddd",
        borderRadius: "8px",
        marginBottom: "10px",
        overflow: "hidden",
        backgroundColor: "#fff",
    },
    testCardFinished: {
        borderColor: "#a5d6a7",
        backgroundColor: "#f1f8e9",
    },
    testCardSkipped: {
        borderColor: "#ffe0b2",
        backgroundColor: "#fff8e1",
    },
    testCardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        cursor: "pointer",
        userSelect: "none" as const,
    },
    testCardInfo: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "2px",
    },
    testName: {
        fontWeight: "bold",
        fontSize: "15px",
        color: "#333",
    },
    testId: {
        fontSize: "11px",
        color: "#999",
        fontFamily: "monospace",
    },
    testCardRight: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    statusBadge: {
        fontSize: "12px",
        fontWeight: "bold",
        borderRadius: "4px",
        padding: "3px 8px",
    },
    statusActive: {
        backgroundColor: "#e3f2fd",
        color: "#1565c0",
    },
    statusFinished: {
        backgroundColor: "#e8f5e9",
        color: "#2e7d32",
    },
    statusSkipped: {
        backgroundColor: "#fff3e0",
        color: "#e65100",
    },
    currentGroup: {
        fontSize: "13px",
        color: "#555",
    },
    expandArrow: {
        fontSize: "12px",
        color: "#999",
        transition: "transform 0.2s ease",
    },
    testCardBody: {
        borderTop: "1px solid #eee",
        padding: "12px 16px",
        backgroundColor: "#fafafa",
    },
    bodySection: {
        marginBottom: "10px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap" as const,
    },
    bodyLabel: {
        fontSize: "13px",
        color: "#666",
        fontWeight: "bold",
        whiteSpace: "nowrap" as const,
    },
    variantSelector: {
        display: "flex",
        gap: "6px",
        flexWrap: "wrap" as const,
    },
    variantButton: {
        padding: "5px 12px",
        border: "1px solid #bdbdbd",
        borderRadius: "4px",
        backgroundColor: "#fff",
        cursor: "pointer",
        fontSize: "13px",
        color: "#333",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.15s ease",
    },
    variantButtonActive: {
        backgroundColor: "#1565c0",
        color: "#fff",
        borderColor: "#1565c0",
    },
    variantWeight: {
        fontSize: "11px",
        opacity: 0.7,
    },
    finishButton: {
        padding: "6px 16px",
        backgroundColor: "#ef5350",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "bold",
        transition: "background-color 0.15s ease",
    },
};

export default ABTestsPage;
