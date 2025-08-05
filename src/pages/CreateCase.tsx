import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { app } from "@microsoft/teams-js";
import { ExportPanel } from "@/components/ExportPanel";
import { MessageSquare, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  sender: string;
  avatar?: string;
  content: string;
  timestamp: string;
  isUser?: boolean;
}

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error("❌ ErrorBoundary caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("❌ ErrorBoundary details:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">Application Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Something went wrong with the Teams integration.</p>
              <p className="text-sm text-destructive">{this.state.error?.message}</p>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

const CreateCaseInner = () => {
  console.log("🚀 CreateCase.tsx loaded - Teams integration starting");
  
  const [searchParams] = useSearchParams();
  const [selectedMessages, setSelectedMessages] = useState<Message[]>([]);
  const [teamsContext, setTeamsContext] = useState<any>(null);
  const [isTeamsInitialized, setIsTeamsInitialized] = useState(false);

  console.log('✅ CreateCase component rendering');
  console.log('✅ Current URL:', window.location.href);
  console.log('✅ Search params:', Object.fromEntries(searchParams.entries()));

  // Initialize Teams SDK
  useEffect(() => {
    console.log("🔧 Initializing Teams SDK...");
    
    const initializeTeams = async () => {
      try {
        await app.initialize();
        console.log("✅ Teams SDK initialized successfully");
        
        const context = await app.getContext();
        console.log("✅ Teams context:", context);
        setTeamsContext(context);
        setIsTeamsInitialized(true);
      } catch (error) {
        console.error("❌ Teams SDK initialization failed:", error);
        // Continue without Teams context for development
        setIsTeamsInitialized(true);
      }
    };

    initializeTeams();
  }, []);

  // Extract message data from URL parameters or Teams context
  useEffect(() => {
    if (!isTeamsInitialized) return;

    console.log("🔧 Extracting message data...");

    // Extract message data from Teams context
    const messageText = searchParams.get('text') || searchParams.get('messageText') || '';
    const messageId = searchParams.get('messageId') || 'msg-' + Date.now();
    const contactName = searchParams.get('contactName') || searchParams.get('senderName') || 'Teams User';
    const contactEmail = searchParams.get('contactEmail') || searchParams.get('senderEmail') || '';
    const managerName = searchParams.get('managerName') || '';
    const managerEmail = searchParams.get('managerEmail') || '';
    const conversationId = searchParams.get('conversationId') || '';
    const timestamp = searchParams.get('timestamp') || new Date().toISOString();

    console.log('📋 Extracted message data:', {
      messageText,
      messageId,
      contactName,
      contactEmail,
      managerName,
      managerEmail,
      conversationId
    });

    // Create message object with the extracted data
    const message: Message = {
      id: messageId,
      sender: contactName,
      content: messageText || 'Select this message to create a service desk case from your Teams conversation.',
      timestamp: timestamp,
      isUser: false
    };
    
    setSelectedMessages([message]);
    
    // Store additional context data for ExportPanel
    (message as any).contactName = contactName;
    (message as any).contactEmail = contactEmail;
    (message as any).managerName = managerName;
    (message as any).managerEmail = managerEmail;
    (message as any).conversationId = conversationId;
    (message as any).teamsContext = teamsContext;
  }, [searchParams, isTeamsInitialized, teamsContext]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teams-purple-light via-background to-teams-blue-light">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-teams-purple to-teams-blue rounded-xl text-white shadow-teams">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Teams2Go Service Desk</h1>
              <p className="text-muted-foreground">Create service desk cases from Teams conversations</p>
            </div>
            <div className="ml-auto">
              <Badge variant="secondary" className="gap-2">
                <Users className="w-3 h-3" />
                {isTeamsInitialized ? 'Teams Connected' : 'Initializing...'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {selectedMessages.length > 0 ? (
            <div className="space-y-6">
              {/* Message Preview Card */}
              <Card className="border-accent shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-teams-purple" />
                    Selected Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teams-purple to-teams-blue flex items-center justify-center text-white font-medium shadow-md">
                      {selectedMessages[0].sender.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-foreground">{selectedMessages[0].sender}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(selectedMessages[0].timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-foreground leading-relaxed">{selectedMessages[0].content}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Panel */}
              <ExportPanel selectedMessages={selectedMessages} />
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="p-6 bg-teams-purple-light rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <MessageSquare className="w-12 h-12 text-teams-purple" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Waiting for Teams Context</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  This page should be accessed from Microsoft Teams using the "Create case" action from the message menu.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateCase = () => {
  return (
    <ErrorBoundary>
      <CreateCaseInner />
    </ErrorBoundary>
  );
};

export default CreateCase;