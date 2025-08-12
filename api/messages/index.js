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
    context.res = { status: 200, body: "messages endpoint is alive" };
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

    // Let CloudAdapter process the activity with timing
    await adapter.process(req, context.res, async (turnContext) => {
      console.log("🤖 Processing turn context for activity type:", turnContext.activity.type);
      await bot.run(turnContext);
    });

    console.log(`[messages] OK in ${Date.now()-start}ms`);
  } catch (error) {
    console.error(`[messages] FAILED after ${Date.now()-start}ms:`, error?.message);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    });
    
    // Log token validation errors specifically
    if (error.message?.includes('401') || error.message?.includes('Unauthorized') || 
        error.message?.includes('Invalid AppId') || error.message?.includes('Token validation')) {
      console.error("🔑 Authentication/Token validation failed - check MicrosoftAppId/Password/Type/TenantId");
    }
    
    console.error("❌ Error stack:", error.stack);
    context.res = { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message, stack: error.stack }) 
    };
  }
};