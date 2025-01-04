import React, { useEffect, useState } from "react";
import { Balancy } from "@balancy/core";

const UserPropertiesPage: React.FC = () => {
    const [level, setLevel] = useState<number>(0);

    // Fetch the current level on component mount
    useEffect(() => {
        if (Balancy.Main.isReadyToUse) {
            const profile = Balancy.Profiles.system;
            setLevel(profile?.generalInfo?.level || 0);
        }
    }, []);

    const handleLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let newLevel = parseInt(event.target.value, 10);
        setLevel(newLevel);
        handleLevelUpdate(newLevel);
    };

    const handleLevelUpdate = (newLevel: number) => {
        if (isNaN(newLevel)) {
            console.warn("Invalid level input. Please enter a valid integer.");
            return;
        }

        // Update the profile level
        const profile = Balancy.Profiles.system;
        if (profile && profile.generalInfo)
            profile.generalInfo.level = newLevel;

        // Optional: Log the change
        console.log(`Level updated to: ${newLevel}`);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>User Properties</h2>
            <div style={{ marginBottom: "10px" }}>
                <label htmlFor="level" style={{ marginRight: "10px" }}>
                    Player Level:
                </label>
                <input
                    id="level"
                    type="number"
                    value={level}
                    onChange={handleLevelChange}
                    style={{
                        padding: "5px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        width: "60px",
                    }}
                />
            </div>
        </div>
    );
};

export default UserPropertiesPage;
