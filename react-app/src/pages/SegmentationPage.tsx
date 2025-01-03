import React, { useEffect, useState } from "react";
import { Balancy, SmartObjectsUnnyProfile } from "@balancy/core";

const SegmentationPage: React.FC = () => {
    const [segmentsText, setSegmentsText] = useState<string>("");

    const prepareSegmentsInfoText = (): string => {
        const profile = Balancy.Profiles.system as SmartObjectsUnnyProfile | null;

        if (!profile || !profile.segmentsInfo) {
            return "No segmentation data available.";
        }

        const info = profile.segmentsInfo;
        let result = "";

        for (let i = 0;i<info.segments.count;i++) {
            const segment = info.segments.get(i);
            if (segment.isIn) {
                result += `${segment.segment?.unnyId} - ${segment.segment?.name}, joined at ${segment.lastIn}\n`;
            }
        }

        return result;
    };

    const updateData = () => {
        const infoText = prepareSegmentsInfoText();
        setSegmentsText(infoText);
    };

    useEffect(() => {
        updateData();

        // Refresh data every second
        const intervalId = setInterval(updateData, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{ textAlign: "left", padding: "20px", fontFamily: "monospace" }}>
            <h2>Segmentation</h2>
            <pre>{segmentsText}</pre>
        </div>
    );
};

export default SegmentationPage;
