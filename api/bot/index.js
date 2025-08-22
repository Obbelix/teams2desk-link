const { 
  TeamsActivityHandler, 
  CloudAdapter, 
  ConfigurationServiceClientCredentialFactory,
  createBotFrameworkAuthenticationFromConfiguration,
  TurnContext, 
  MessageFactory 
} = require("botbuilder");

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MicrosoftAppId,
  MicrosoftAppPassword: process.env.MicrosoftAppPassword,
  MicrosoftAppType: process.env.MicrosoftAppType || "MultiTenant",
  MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
});

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Add error handler for better debugging
adapter.onTurnError = async (context, error) => {
  console.error("❌ Bot error:", error);
  console.error("❌ Bot error stack:", error.stack);
  try { 
    await context.sendActivity("The bot encountered an error."); 
  } catch {}
};

// Teams-specific bot logic
class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    // Personal welcome message
    this.onMembersAdded(async (context, next) => {
      const added = context.activity.membersAdded || [];
      const convType = context.activity.conversation?.conversationType;
      const botId = context.activity.recipient?.id;

      for (const m of added) {
        // Personal scope: welcome the user
        if (convType === "personal" && m.id !== botId) {
          await context.sendActivity("👋 Welcome to 2Go Service Desk! Type **hi** or **help** to begin.");
        }
        // Team/channel scope: when the bot itself is added, send team welcome
        if (convType === "channel" && m.id === botId) {
          await context.sendActivity("👋 Hello team! I'm 2Go Service Desk bot. Mention me with **help** to get started.");
        }
      }
      await next();
    });

    // Team installation welcome
    this.onInstallationUpdateAdd(async (context, next) => {
      if (context.activity.conversation?.conversationType === "channel") {
        await context.sendActivity("👋 Hello team! I'm 2Go Service Desk bot. Mention me or type **help** to get started.");
      }
      await next();
    });

    // Fallback: some tenants fire conversationUpdate when adding to a team
    this.onConversationUpdate(async (context, next) => {
      const convType = context.activity.conversation?.conversationType;
      if (convType === "channel") {
        const added = context.activity.membersAdded || [];
        // When the bot is added to a team, send a welcome
        if (added.some(m => m.id === context.activity.recipient?.id)) {
          await context.sendActivity("👋 Thanks for adding me to the team! Type **@2Go Service Desk help** to see what I can do.");
        }
      }
      await next();
    });

    // Handle messages - ensure immediate response
    this.onMessage(async (context, next) => {
      // Strip mentions so "@Bot hi" becomes "hi"
      let text = (context.activity.text || "").toLowerCase();
      try {
        const cleaned = TurnContext.removeRecipientMention(context.activity);
        if (cleaned && cleaned.trim()) text = cleaned.toLowerCase().trim();
      } catch {}

      console.log("📨 Received message:", text);

      // Send immediate reply to avoid timeouts
      if (text.includes("hi") || text.includes("hello") || text.includes("hej")) {
        await context.sendActivity("Hi there! 👋 How can I help?");
      } else if (text.includes("help")) {
        await context.sendActivity(
          MessageFactory.text(
            "I can create support cases from Teams messages.\n\n" +
            "• In a **chat**, type **hi** or **help**.\n" +
            "• In a **team**, mention me: **@2Go Service Desk help**."
          )
        );
      } else {
        await context.sendActivity(`Echo: ${context.activity.text || "(empty)"}`);
      }
      await next();
    });
  }
}

const bot = new TeamsBot();

// Azure Functions entrypoint
module.exports = async function (context, req) {
  // Handle preflight CORS
  if (req.method === "OPTIONS") { 
    context.res = { status: 200, body: '' }; 
    return; 
  }

  // Health check for GET requests
  if (req.method === "GET") {
    context.res = { status: 200, body: "bot endpoint is alive" };
    return;
  }

  const start = Date.now();
  console.log(`[messages] start ${new Date(start).toISOString()}`);
  
  try {
    console.log("📨 Received bot request:", {
      method: req.method,
      url: req.url,
      bodyType: typeof req.body,
      hasAppId: !!process.env.MicrosoftAppId,
      hasAppPassword: !!process.env.MicrosoftAppPassword,
      appType: process.env.MicrosoftAppType,
      hasTenantId: !!process.env.MicrosoftAppTenantId
    });

    // JWT Debug: Log request headers and auth info
    console.log("🔑 JWT Debug - Request headers:", {
      authorization: req.headers.authorization ? req.headers.authorization.substring(0, 50) + "..." : "NOT SET",
      contentType: req.headers['content-type'],
      userAgent: req.headers['user-agent']
    });

    // JWT Debug: Analyze JWT token if present
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.substring(7);
      console.log("🔑 JWT Debug - Full token:", token);
      
      try {
        // Decode JWT header and payload (without verification)
        const parts = token.split('.');
        if (parts.length === 3) {
          const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          
          console.log("🔑 JWT Debug - Token header:", header);
          console.log("🔑 JWT Debug - Token payload:", {
            aud: payload.aud,
            iss: payload.iss,
            appid: payload.appid,
            exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'NO EXP',
            iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'NO IAT'
          });
        }
      } catch (jwtError) {
        console.log("🔑 JWT Debug - Could not decode JWT:", jwtError.message);
      }
    }

    // JWT Debug: Log environment variables (masked for security)
    console.log("🔑 JWT Debug - Environment variables:", {
      MicrosoftAppId: process.env.MicrosoftAppId ? `${process.env.MicrosoftAppId.substring(0, 8)}...` : "NOT SET",
      MicrosoftAppPassword: process.env.MicrosoftAppPassword ? `***${process.env.MicrosoftAppPassword.substring(process.env.MicrosoftAppPassword.length - 4)}` : "NOT SET",
      MicrosoftAppType: process.env.MicrosoftAppType || "NOT SET",
      MicrosoftAppTenantId: process.env.MicrosoftAppTenantId ? `${process.env.MicrosoftAppTenantId.substring(0, 8)}...` : "NOT SET"
    });

    // JWT Debug: Log request body structure
    if (req.body) {
      console.log("🔑 JWT Debug - Request body structure:", {
        type: req.body.type,
        from: req.body.from?.id,
        conversation: req.body.conversation?.id,
        channelId: req.body.channelId,
        text: req.body.text ? req.body.text.substring(0, 50) : "NO TEXT"
      });
    }

    // Let CloudAdapter process the activity with timing
    await adapter.process(req, context.res, async (turnContext) => {
      console.log("🤖 Processing turn context for activity type:", turnContext.activity.type);
      await bot.run(turnContext);
    });

    console.log(`[messages] OK in ${Date.now()-start}ms`);
  } catch (error) {
    console.error(`[messages] FAILED after ${Date.now()-start}ms:`, error?.message);
    console.error("❌ FULL ERROR OBJECT:", JSON.stringify(error, null, 2));
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      innerError: error.innerError
    });
    
    // Log token validation errors specifically
    if (error.message?.includes('401') || error.message?.includes('Unauthorized') || 
        error.message?.includes('Invalid AppId') || error.message?.includes('Token validation') ||
        error.message?.includes('signature') || error.message?.includes('claims') ||
        error.message?.includes('JWT') || error.message?.includes('authentication')) {
      console.error("🔑 JWT AUTH FAIL: Detailed analysis:");
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Error statusCode:", error.statusCode);
      
      // Check if it's a JWT validation issue
      if (error.message?.includes('JWT') || error.message?.includes('signature')) {
        console.error("🔑 JWT VALIDATION ISSUE DETECTED:");
        console.error("This appears to be a JWT signature or validation problem");
        console.error("Check if MicrosoftAppPassword matches what Azure Bot Service uses");
      }
      
      // Check if it's an App ID mismatch
      if (error.message?.includes('Invalid AppId') || error.message?.includes('AppId')) {
        console.error("🔑 APP ID MISMATCH DETECTED:");
        console.error("This appears to be an App ID mismatch issue");
        console.error("Check if MicrosoftAppId matches the bot's App ID");
      }
      
      console.error("🔑 Current environment configuration:");
      console.error("MicrosoftAppId:", process.env.MicrosoftAppId);
      console.error("MicrosoftAppType:", process.env.MicrosoftAppType);
      console.error("MicrosoftAppTenantId:", process.env.MicrosoftAppTenantId);
      console.error("MicrosoftAppPassword length:", process.env.MicrosoftAppPassword?.length || 0);
      console.error("MicrosoftAppPassword last 4 chars:", process.env.MicrosoftAppPassword?.substring(process.env.MicrosoftAppPassword.length - 4) || "N/A");
    }
    
    console.error("❌ Error stack:", error.stack);
    context.res = { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message, stack: error.stack }) 
    };
  }
};