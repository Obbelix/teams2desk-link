module.exports = async function (context, req) {
    // Handle preflight requests
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

    // Handle GET requests - show configuration info
    if (req.method === "GET") {
        const config = {
            MicrosoftAppId: process.env.MicrosoftAppId ? `${process.env.MicrosoftAppId.substring(0, 8)}...` : "NOT SET",
            MicrosoftAppPassword: process.env.MicrosoftAppPassword ? `***${process.env.MicrosoftAppPassword.substring(process.env.MicrosoftAppPassword.length - 4)}` : "NOT SET",
            MicrosoftAppType: process.env.MicrosoftAppType || "NOT SET",
            MicrosoftAppTenantId: process.env.MicrosoftAppTenantId ? `${process.env.MicrosoftAppTenantId.substring(0, 8)}...` : "NOT SET",
            timestamp: new Date().toISOString()
        };

        context.res = {
            status: 200,
            body: {
                message: "JWT Test Endpoint - Configuration Check",
                config: config,
                instructions: "Send POST with 'test' to simulate bot message processing"
            },
            headers: { "Content-Type": "application/json" }
        };
        return;
    }

    try {
        // Simulate what Azure Bot Service would send
        const testMessage = {
            type: "message",
            text: req.body?.text || "test",
            from: { id: "test-bot" },
            conversation: { id: "test-conv" },
            channelId: "test",
            timestamp: new Date().toISOString()
        };

        console.log("🧪 JWT Test - Simulating bot message:", testMessage);

        // Check if we have the required environment variables
        const missingVars = [];
        if (!process.env.MicrosoftAppId) missingVars.push("MicrosoftAppId");
        if (!process.env.MicrosoftAppPassword) missingVars.push("MicrosoftAppPassword");
        if (!process.env.MicrosoftAppType) missingVars.push("MicrosoftAppType");
        if (!process.env.MicrosoftAppTenantId) missingVars.push("MicrosoftAppTenantId");

        if (missingVars.length > 0) {
            context.res = {
                status: 400,
                body: {
                    error: "Missing required environment variables",
                    missing: missingVars,
                    message: "These variables are required for JWT authentication to work"
                },
                headers: { "Content-Type": "application/json" }
            };
            return;
        }

        // All good - configuration looks correct
        context.res = {
            status: 200,
            body: {
                success: true,
                message: "JWT configuration appears correct",
                received: testMessage,
                environment: {
                    hasAppId: !!process.env.MicrosoftAppId,
                    hasAppPassword: !!process.env.MicrosoftAppPassword,
                    appType: process.env.MicrosoftAppType,
                    hasTenantId: !!process.env.MicrosoftAppTenantId
                },
                note: "This endpoint only checks configuration. Real JWT validation happens in /api/bot/messages"
            },
            headers: { "Content-Type": "application/json" }
        };

    } catch (error) {
        console.error('❌ Error in JWT test:', error);
        context.res = {
            status: 500,
            body: {
                error: "JWT test failed",
                details: error.message
            },
            headers: { "Content-Type": "application/json" }
        };
    }
};
