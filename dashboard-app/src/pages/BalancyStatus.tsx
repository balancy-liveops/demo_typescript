import { useEffect, useState } from "react";
import { Balancy } from "@balancy/core";

export const BalancyStatusMaxHeight = 56;

const BalancyStatus: React.FC = () => {
    // Store each value separately
    const initStatus = Balancy.API.getStatus();
    const [branchName, setBranchName] = useState(initStatus.branchName);
    const [deploy, setDeploy] = useState(initStatus.deploy);
    const [serverTime, setServerTime] = useState(initStatus.serverTime);
    const [gameTime, setGameTime] = useState(initStatus.gameTime);

    useEffect(() => {
        // Update status every second
        const interval = setInterval(() => {
            const status = Balancy.API.getStatus();

            // Update only if the values have changed
            setBranchName(prev => prev !== status.branchName ? status.branchName : prev);
            setDeploy(prev => prev !== status.deploy ? status.deploy : prev);
            setServerTime(prev => prev !== status.serverTime ? status.serverTime : prev);
            setGameTime(prev => prev !== status.gameTime ? status.gameTime : prev);
        }, 1000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    let serverDate = new Date(serverTime * 1000).toLocaleString("en-GB", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });

    let gameDate = new Date(gameTime * 1000).toLocaleString("en-GB", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    })

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#333",
            color: "white",
            padding: "10px",
            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
            fontSize: "16px",
            gap: "20px",
            overflow: "hidden",
            boxSizing: "border-box",
            maxHeight: `${BalancyStatusMaxHeight}px`,
            fontFamily: "Times, 'Times New Roman', serif",
        }}>
            <span><strong>Branch:</strong> {branchName}</span>
            <span><strong>Deploy:</strong> {deploy}</span>
            <span><strong>Server Time:</strong> {serverDate}</span>
            <span><strong>Game Time:</strong> {gameDate}</span>
        </div>
    );
};

export default BalancyStatus;
