
const { TeamsActivityHandler, CloudAdapter, ConfigurationServiceClientCredentialFactory, TurnContext, MessageFactory } = require("botbuilder");
const { app } = require('@azure/functions');

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MicrosoftAppId,
  MicrosoftAppPassword: process.env.MicrosoftAppPassword,
  MicrosoftAppType: process.env.MicrosoftAppType || "MultiTenant",
  MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
});

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
      const membersAdded = context.activity.membersAdded || [];
      for (let member of membersAdded) {
        if (member.id !== context.activity.recipient.id &&
            context.activity.conversation?.conversationType === "personal") {
          await context.sendActivity("👋 Välkommen till 2Go Service Desk! Skriv 'help' för att börja.");
        }
      }
      await next();
    });

    // Team installation welcome
    this.onInstallationUpdateAdd(async (context, next) => {
      const convType = context.activity.conversation?.conversationType;
      if (convType === "channel") {
        await context.sendActivity("👋 Hej team! Jag är 2Go Service Desk bot. Skriv '@bot help' för att komma igång.");
      }
      await next();
    });

    // Fallback: some tenants fire conversationUpdate when adding to a team
    this.onConversationUpdate(async (context, next) => {
      const convType = context.activity.conversation?.conversationType;
      const eventType = context.activity.channelData?.eventType;
      if (convType === "channel" && eventType === "teamMemberAdded") {
        const added = context.activity.membersAdded || [];
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
    // Use proper response handling for Azure Functions
    await adapter.process(req, {
      send: (status, body, headers) => {
        context.res = { 
          status: status || 200, 
          body, 
          headers: headers || { 'Content-Type': 'application/json' }
        };
      },
      end: () => {
        // Response is handled by context.res
      }
    }, async (turnContext) => {
      await bot.run(turnContext);
    });
  } catch (error) {
    console.error("❌ Adapter process error:", error);
    context.res = { status: 500, body: { error: error.message } };
  }
};
