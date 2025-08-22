const fs = require('fs');
const path = require('path');

module.exports = async function (context, req) {
    if (req.method === "OPTIONS") {
        context.res = {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        };
        return;
    }

    try {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp: timestamp,
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body,
            environment: {
                MicrosoftAppId: process.env.MicrosoftAppId ? `${process.env.MicrosoftAppId.substring(0, 8)}...` : "NOT SET",
                MicrosoftAppPassword: process.env.MicrosoftAppPassword ? `***${process.env.MicrosoftAppPassword.substring(process.env.MicrosoftAppPassword.length - 4)}` : "NOT SET",
                MicrosoftAppType: process.env.MicrosoftAppType || "NOT SET",
                MicrosoftAppTenantId: process.env.MicrosoftAppTenantId ? `${process.env.MicrosoftAppTenantId.substring(0, 8)}...` : "NOT SET"
            }
        };

        // Write to log file
        const logPath = path.join(__dirname, 'debug.log');
        const logLine = `${timestamp} - ${JSON.stringify(logEntry, null, 2)}\n---\n`;
        
        try {
            fs.appendFileSync(logPath, logLine);
            console.log("✅ Debug log written to file");
        } catch (writeError) {
            console.error("❌ Could not write to file:", writeError.message);
        }

        // Also log to console
        console.log("🔍 Debug info:", JSON.stringify(logEntry, null, 2));

        context.res = {
            status: 200,
            body: {
                success: true,
                message: "Debug info logged",
                timestamp: timestamp,
                logPath: logPath,
                note: "Check console logs and debug.log file for details"
            },
            headers: { "Content-Type": "application/json" }
        };

    } catch (error) {
        console.error('❌ Error in debug logging:', error);
        context.res = {
            status: 500,
            body: {
                error: "Debug logging failed",
                details: error.message
            },
            headers: { "Content-Type": "application/json" }
        };
    }
};
