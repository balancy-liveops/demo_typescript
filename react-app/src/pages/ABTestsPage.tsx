import React, { useEffect, useState } from "react";
import { Balancy, SmartObjectsUnnyProfile, SmartObjectsAnalyticsABTest } from "@balancy/core";

const ABTestsPage: React.FC = () => {
    const [abTestsText, setAbTestsText] = useState<string>("");

    const prepareABTestsInfoText = (): string => {
        const profile = Balancy.Profiles.system as SmartObjectsUnnyProfile | null;

        if (!profile || !profile.testsInfo) {
            return "No A/B Test data available.";
        }

        const info = profile.testsInfo;
        let result = "";

        for (let i = 0;i<info.tests.count;i++) {
            const test = info.tests.get(i);
            result += `${test.test?.unnyId} - ${test.test?.name}, group = ${test.variant?.name} -- Finished = ${test.finished}\n`;
        }

        if (info.avoidedTests.length > 0) {
            result += "\nAvoided Tests (I'll never join them):\n";
            info.avoidedTests.forEach((testId) => {
                const test = Balancy.CMS.getModelByUnnyId<SmartObjectsAnalyticsABTest>(testId);
                if (test) {
                    result += `${test.unnyId} - ${test.name}\n`;
                } else {
                    result += `${testId}\n`;
                }
            });
        }

        return result;
    };

    const updateData = () => {
        const infoText = prepareABTestsInfoText();
        setAbTestsText(infoText);
    };

    useEffect(() => {
        // Update immediately when component mounts
        updateData();

        // Refresh data every second
        const intervalId = setInterval(updateData, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{ textAlign: "left", padding: "20px", fontFamily: "monospace" }}>
            <h2>A/B Tests</h2>
            <pre>{abTestsText}</pre>
        </div>
    );
};

export default ABTestsPage;
