import { useState, useEffect } from "react";
import { Balancy } from "@balancy/core"; // Assuming Balancy API is part of your library

const LanguagesPanel: React.FC = () => {
    const [localizations, setLocalizations] = useState<string[]>([]);
    const [currentLocalization, setCurrentLocalization] = useState<string | null>(null);

    useEffect(() => {
        if (Balancy.Main.isReadyToUse) {
            refresh();
        }
    }, []);

    const refresh = () => {
        if (!Balancy.Main.isReadyToUse) {
            return;
        }

        const allLocalizations = Balancy.API.Localization.getAllLocalizationCodes();
        const current = Balancy.API.Localization.getCurrentLocalizationCode();

        setLocalizations(allLocalizations);
        setCurrentLocalization(current);
    };

    const changeLocalization = (code: string) => {
        Balancy.API.Localization.changeLocalization(code);
        refresh();
    };

    return (
        <div className="languages-panel">
            {localizations.map((code) => (
                <button
                    key={code}
                    onClick={() => changeLocalization(code)}
                    style={{
                        color: code === currentLocalization ? "green" : "black",
                        padding: "10px",
                        margin: "5px",
                        cursor: "pointer",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        backgroundColor: "#fff",
                    }}
                >
                    {code}
                </button>
            ))}
        </div>
    );
};

export default LanguagesPanel;
