import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Send, FileText, Clock, User, CheckCircle2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isUser?: boolean;
}

interface ExportPanelProps {
  selectedMessages: Message[];
}

export function ExportPanel({ selectedMessages }: ExportPanelProps) {
  console.log('🔧 ExportPanel rendering with messages:', selectedMessages.length);
  
  const [isExporting, setIsExporting] = useState(false);
  const [ticketTitle, setTicketTitle] = useState("");
  const [manager, setManager] = useState("");
  const [contact, setContact] = useState("");
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [caseUrl, setCaseUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Auto-populate fields from Teams message data
  useEffect(() => {
    if (selectedMessages.length > 0) {
      const message = selectedMessages[0];
      const contactName = (message as any).contactName;
      const contactEmail = (message as any).contactEmail;
      const managerName = (message as any).managerName;
      const managerEmail = (message as any).managerEmail;
      
      console.log('📋 Auto-populating fields:', {
        contactName,
        contactEmail,
        managerName,
        managerEmail
      });
      
      // Manager = Person who clicked "Create case"
      if (managerEmail) {
        setManager(managerEmail);
      } else if (managerName) {
        setManager(managerName);
      }
      
      // Contact = Original message sender
      if (contactEmail) {
        setContact(contactEmail);
      } else if (contactName && contactName !== 'Teams User') {
        setContact(contactName);
      }

      // Auto-generate title from message content
      if (!ticketTitle && message.content) {
        const autoTitle = generateTicketTitle(message.content);
        setTicketTitle(autoTitle);
      }
    }
  }, [selectedMessages, ticketTitle]);

  const generateTicketTitle = (content: string) => {
    // Clean up the content and create a meaningful title
    const cleanContent = content
      .replace(/\[\w+.*?\d{2}-\d{2}\s+\d{2}:\d{2}\]/g, '') // Remove timestamps
      .replace(/&nbsp;/g, ' ') // Remove HTML entities
      .trim();
    
    const preview = cleanContent.substring(0, 100);
    return preview.length < cleanContent.length ? preview + "..." : preview;
  };

  const formatConversation = () => {
    if (selectedMessages.length === 0) return '';
    
    return selectedMessages.map(msg => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      return `[${timestamp}] ${msg.sender}: ${msg.content}`;
    }).join('\n\n');
  };

  const exportToServiceDesk = async () => {
    if (selectedMessages.length === 0) {
      toast({
        title: "No Messages Selected",
        description: "Please select at least one message to export.",
        variant: "destructive"
      });
      return;
    }

    if (!manager || !contact) {
      toast({
        title: "Missing Information",
        description: "Please fill in both Manager (Handläggare) and Contact (Anmälare) fields.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    setCaseUrl(null);

    try {
      const payload = {
        title: ticketTitle || generateTicketTitle(selectedMessages[0].content),
        description: formatConversation(),
        manager: manager,
        contact: contact,
        messages: selectedMessages,
        teamsContext: (selectedMessages[0] as any).teamsContext
      };

      console.log('📤 Sending payload to service desk:', JSON.stringify(payload, null, 2));

      // This will need to be configured with your Azure Static Web App API endpoint
      const apiEndpoint = '/api/create-case'; // Will be proxied by Azure Static Web Apps
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API response data:', data);
      
      setLastResponse(data);
      
      // Extract case URL from response
      let extractedUrl = null;
      
      if (data.importItemResult?.[0]?.returnValues?.returnValue) {
        const returnValues = data.importItemResult[0].returnValues.returnValue;
        const urlObject = returnValues.find((item: any) => item.name === "URL_Selfservice");
        if (urlObject?.content) {
          extractedUrl = urlObject.content;
        }
      } else if (data.URL_Selfservice) {
        extractedUrl = data.URL_Selfservice;
      } else if (data.caseUrl) {
        extractedUrl = data.caseUrl;
      }
      
      setCaseUrl(extractedUrl);
      
      toast({
        title: "🎉 Case Created Successfully!",
        description: extractedUrl ? 
          "Your service desk case has been created. You can view it using the link below." :
          "Your service desk case has been created in the system.",
        variant: "default"
      });

      // Reset form
      setTicketTitle("");
      
    } catch (error) {
      console.error('❌ Export error:', error);
      
      let errorMessage = "Failed to create case. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Export Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const canExport = selectedMessages.length > 0 && !isExporting && manager && contact;

  return (
    <Card className="shadow-lg border-accent">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-success/10 rounded-lg">
            <Send className="w-5 h-5 text-success" />
          </div>
          <div>
            <CardTitle className="text-lg">Export to Service Desk</CardTitle>
            <CardDescription>
              Create a service desk case from the selected Teams conversation
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2 p-4 bg-teams-purple-light rounded-lg border border-teams-purple/20">
            <FileText className="w-4 h-4 text-teams-purple" />
            <div className="text-sm">
              <div className="font-semibold text-teams-purple">{selectedMessages.length}</div>
              <div className="text-muted-foreground">Message{selectedMessages.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-4 bg-teams-blue-light rounded-lg border border-teams-blue/20">
            <User className="w-4 h-4 text-teams-blue" />
            <div className="text-sm">
              <div className="font-semibold text-teams-blue">{new Set(selectedMessages.map(m => m.sender)).size}</div>
              <div className="text-muted-foreground">Participant{new Set(selectedMessages.map(m => m.sender)).size !== 1 ? 's' : ''}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-4 bg-success/10 rounded-lg border border-success/20">
            <Clock className="w-4 h-4 text-success" />
            <div className="text-sm">
              <div className="font-semibold text-success">easitGO</div>
              <div className="text-muted-foreground">Target System</div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticket-title">Case Title</Label>
            <Textarea
              id="ticket-title"
              placeholder="Enter a descriptive title for this case..."
              value={ticketTitle}
              onChange={(e) => setTicketTitle(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manager">Manager (Handläggare) *</Label>
              <Input
                id="manager"
                placeholder="Enter manager email..."
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact">Contact (Anmälare) *</Label>
              <Input
                id="contact"
                placeholder="Enter contact email..."
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Message Preview */}
        {selectedMessages.length > 0 && (
          <div className="space-y-2">
            <Label>Conversation Preview</Label>
            <div className="max-h-40 overflow-y-auto p-4 bg-muted rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                {formatConversation()}
              </pre>
            </div>
          </div>
        )}

        {/* Success State - Show case URL if available */}
        {caseUrl && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="font-medium text-success">Case Created Successfully!</span>
            </div>
            <a 
              href={caseUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-teams-blue hover:text-teams-purple transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              View Your Case
            </a>
          </div>
        )}

        {/* Export Button */}
        <Button
          onClick={exportToServiceDesk}
          disabled={!canExport}
          className="w-full gap-2 h-12 text-base font-medium"
          size="lg"
        >
          <Send className="w-5 h-5" />
          {isExporting ? "Creating Case..." : "Create Service Desk Case"}
        </Button>

        {!canExport && !isExporting && (
          <p className="text-sm text-muted-foreground text-center">
            {selectedMessages.length === 0 ? "No messages selected" : 
             !manager || !contact ? "Please fill in required fields (Manager and Contact)" : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}