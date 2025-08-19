import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Zap, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teams-purple-light via-background to-teams-blue-light">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-teams-purple to-teams-blue rounded-xl text-white shadow-teams">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-teams bg-clip-text text-transparent">
                Teams2Go Service Desk
              </h1>
              <p className="text-muted-foreground">Bridge your Teams conversations to service management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-6 px-4 py-2 border-teams-purple text-teams-purple">
            Microsoft Teams Integration
          </Badge>
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Transform Teams Conversations into 
            <span className="bg-gradient-teams bg-clip-text text-transparent"> Service Desk Cases</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Seamlessly create service desk tickets from Microsoft Teams messages with automatic participant detection,
            conversation context, and direct integration with your service management system.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="gap-2 shadow-teams">
              <Link to="/create-case">
                <MessageSquare className="w-5 h-5" />
                Try Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-teams-blue text-teams-blue hover:bg-teams-blue-light" asChild>
              <Link to="/flow-chart">View Flow Chart</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center border-accent shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-teams-purple-light rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-teams-purple" />
              </div>
              <CardTitle>Smart Message Extraction</CardTitle>
              <CardDescription>
                Automatically extract conversation context, participants, and message content from Teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Message threading support</li>
                <li>• Participant auto-detection</li>
                <li>• Timestamp preservation</li>
                <li>• Content formatting</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center border-accent shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-teams-blue-light rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-teams-blue" />
              </div>
              <CardTitle>Role Assignment</CardTitle>
              <CardDescription>
                Automatically assign reporter and assignee roles based on Teams conversation context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Auto-populate manager field</li>
                <li>• Contact detection</li>
                <li>• Role-based permissions</li>
                <li>• Team integration</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center border-accent shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-success" />
              </div>
              <CardTitle>Service Desk Integration</CardTitle>
              <CardDescription>
                Direct integration with easitGO and other popular service management platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• easitGO native support</li>
                <li>• Real-time case creation</li>
                <li>• Status tracking</li>
                <li>• Return link generation</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="border-accent shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">How It Works</CardTitle>
            <CardDescription>Simple 3-step process to create service desk cases from Teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teams-purple to-teams-blue rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-teams">
                  1
                </div>
                <h3 className="font-semibold mb-2">Select Message</h3>
                <p className="text-sm text-muted-foreground">
                  Right-click on any Teams message and select "Create case" from the context menu
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teams-blue to-success rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-teams">
                  2
                </div>
                <h3 className="font-semibold mb-2">Review & Edit</h3>
                <p className="text-sm text-muted-foreground">
                  Review extracted conversation, adjust title, and confirm manager and contact information
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-success to-teams-purple rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-teams">
                  3
                </div>
                <h3 className="font-semibold mb-2">Create Case</h3>
                <p className="text-sm text-muted-foreground">
                  Case is automatically created in your service desk with direct link for tracking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t">
          <p className="text-muted-foreground">
            Built for Microsoft Teams • Powered by Azure • Integrated with easitGO
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
