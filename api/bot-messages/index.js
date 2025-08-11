
const { TeamsActivityHandler, CloudAdapter, ConfigurationServiceClientCredentialFactory } = require("botbuilder");

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
    // IMPORTANT: Don't pre-set context.res - let the adapter handle it
    await adapter.process(req, context.res, async (turnContext) => {
      await bot.run(turnContext);
    });
  } catch (error) {
    console.error("❌ Adapter process error:", error);
    context.res = { status: 500, body: { error: error.message } };
  }
};
