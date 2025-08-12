
const { TeamsActivityHandler, CloudAdapter, ConfigurationServiceClientCredentialFactory, TurnContext, MessageFactory } = require("botbuilder");
const { app } = require('@azure/functions');

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MicrosoftAppId,
  MicrosoftAppPassword: process.env.MicrosoftAppPassword,
  MicrosoftAppType: process.env.MicrosoftAppType || "MultiTenant",
  MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
});

// Correct CloudAdapter initialization for Azure Functions
const adapter = new CloudAdapter(credentialsFactory);

// Add error handler for better debugging
adapter.onTurnError = async (context, error) => {
  console.error("❌ Bot error:", error);
  try { 
    await context.sendActivity("The bot encountered an error."); 
  } catch {}
};

// Trust service URL for Teams
if (process.env.BOT_SERVICE_URL) {
  adapter.continueConversation = adapter.continueConversation || (() => {});
}

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

    // Handle messages
    this.onMessage(async (context, next) => {
      // Strip mentions so "@Bot hi" becomes "hi"
      let text = (context.activity.text || "").toLowerCase();
      try {
        const cleaned = TurnContext.removeRecipientMention(context.activity);
        if (cleaned && cleaned.trim()) text = cleaned.toLowerCase().trim();
      } catch {}

      if (text.includes("hi") || text.includes("hello")) {
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
        await context.sendActivity("Try **hi** or **help**.");
      }
      await next();
    });
  }
}

const bot = new TeamsBot();

module.exports = async function (context, req) {
  // Health check for GET requests
  if (req.method === "GET") {
    context.res = { status: 200, body: "bot-messages endpoint is alive" };
    return;
  }

  try {
    // Use proper Azure Functions adapter processing
    await adapter.process(req, {
      send: (status, body, headers) => {
        context.res = { 
          status: status || 200, 
          body, 
          headers: headers || { 'Content-Type': 'application/json' }
        };
      },
      end: () => {
        // Response handled by context.res
      }
    }, async (turnContext) => {
      await bot.run(turnContext);
    });
  } catch (error) {
    console.error("❌ Adapter process error:", error);
    context.res = { status: 500, body: { error: error.message } };
  }
};
