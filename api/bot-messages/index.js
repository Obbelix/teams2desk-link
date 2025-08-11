
const { TeamsActivityHandler, CloudAdapter, ConfigurationServiceClientCredentialFactory } = require("botbuilder");
const { app } = require('@azure/functions');

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MicrosoftAppId,
  MicrosoftAppPassword: process.env.MicrosoftAppPassword,
  MicrosoftAppType: process.env.MicrosoftAppType || "SingleTenant",
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

    // Handle messages
    this.onMessage(async (context, next) => {
      const text = context.activity.text?.toLowerCase();
      if (text.includes("hi")) {
        await context.sendActivity("Hej där! 👋");
      } else if (text.includes("help")) {
        await context.sendActivity("Här är vad jag kan hjälpa dig med...");
      } else {
        await context.sendActivity("Jag förstod inte riktigt. Skriv 'help' för hjälp.");
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
