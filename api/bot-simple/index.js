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

    // Handle GET requests
    if (req.method === "GET") {
        context.res = {
            status: 200,
            body: "Simple bot endpoint is ready! Send POST with message text to test bot logic.",
            headers: { "Content-Type": "text/plain" }
        };
        return;
    }

    try {
        // Get message text from request
        const messageText = req.body?.text || "hi";
        
        console.log(`🧪 Simple bot received message: "${messageText}"`);
        
        // Simple bot logic (same as our test bot)
        let response = "";
        
        if (messageText.toLowerCase() === "hi" || messageText.toLowerCase() === "hello") {
            response = "Hello! Welcome to Teams2Desk-Link. I can help you create service desk cases and manage support requests. How can I assist you today?";
        } else if (messageText.toLowerCase() === "help") {
            response = "Here's what I can help you with:\n\n" +
                      "• Create service desk cases from Teams conversations\n" +
                      "• Export chat history for support tickets\n" +
                      "• Manage support requests directly in Teams\n\n" +
                      "Just say 'hi' to get started, or ask me about creating a case!";
        } else if (messageText.toLowerCase().includes("case") || messageText.toLowerCase().includes("ticket")) {
            response = "Great! To create a service desk case, you can:\n\n" +
                      "1. Use the 'Create case' command in Teams\n" +
                      "2. Or visit the Service Desk tab in this app\n\n" +
                      "Would you like me to help you with anything specific?";
        } else {
            response = `I received your message: "${messageText}". I'm a simple version of the Teams2Desk-Link bot. Try saying "hi", "help", or ask about creating cases!`;
        }
        
        console.log(`🤖 Bot response: "${response}"`);
        
        // Return Bot Framework Activity format (what Teams expects)
        const botResponse = {
            type: "message",
            text: response,
            from: {
                id: "teams2desk-bot",
                name: "Teams2Desk Bot"
            },
            recipient: {
                id: req.body?.from?.id || "user123",
                name: req.body?.from?.name || "User"
            },
            conversation: {
                id: req.body?.conversation?.id || "conv123"
            },
            replyToId: req.body?.id || null,
            channelId: req.body?.channelId || "msteams",
            timestamp: new Date().toISOString()
        };
        
        // Return the bot's response in Bot Framework format
        context.res = {
            status: 200,
            body: botResponse,
            headers: { "Content-Type": "application/json" }
        };
        
    } catch (error) {
        console.error('❌ Error in simple bot:', error);
        context.res = {
            status: 500,
            body: {
                type: "message",
                text: "Sorry, I encountered an error processing your request. Please try again.",
                from: {
                    id: "teams2desk-bot",
                    name: "Teams2Desk Bot"
                },
                recipient: {
                    id: req.body?.from?.id || "user123",
                    name: req.body?.from?.name || "User"
                },
                conversation: {
                    id: req.body?.conversation?.id || "conv123"
                },
                channelId: req.body?.channelId || "msteams",
                timestamp: new Date().toISOString()
            },
            headers: { "Content-Type": "application/json" }
        };
    }
};
