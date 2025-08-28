import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/lib/websocket";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  University,
  TrendingUp,
  Wallet,
  ArrowLeftRight,
  HandHeart,
  MessageCircle,
  Headphones,
  LogOut,
  Menu,
  Clock,
  Mail,
  Phone,
  RefreshCw,
  Lock,
  CheckCircle,
  Send
} from "lucide-react";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { socket, sendMessage: sendWebSocketMessage } = useWebSocket();

  // Get messages with admin
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages", "admin"],
    enabled: !!user,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (socket) {
        sendWebSocketMessage({
          type: 'send_message',
          senderId: user?.id,
          receiverId: 'admin',
          content,
          isFromAdmin: false
        });
      }
      return content;
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", "admin"] });
    }
  });

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const refreshStatus = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    toast({
      title: "Status Refreshed",
      description: user?.status === "pending" ? "Still pending approval." : "Account status updated.",
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const isApproved = user.status === "approved";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside 
        className={`bg-white border-r border-border w-64 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-30 h-full`}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground p-2 rounded">
              <University />
            </div>
            <div>
              <h3 className="font-semibold" data-testid="text-bank-name">SPB Banking</h3>
              <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                {user.email}
              </p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <Button
            variant={activeSection === "overview" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveSection("overview")}
            data-testid="button-nav-overview"
          >
            <TrendingUp className="mr-3 h-4 w-4" />
            Overview
          </Button>
          
          <Button
            variant={activeSection === "accounts" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveSection("accounts")}
            data-testid="button-nav-accounts"
          >
            <Wallet className="mr-3 h-4 w-4" />
            Accounts
          </Button>
          
          <Button
            variant={activeSection === "transactions" ? "secondary" : "ghost"}
            className="w-full justify-start relative"
            onClick={() => setActiveSection("transactions")}
            data-testid="button-nav-transactions"
          >
            <ArrowLeftRight className="mr-3 h-4 w-4" />
            Transactions
            {!isApproved && (
              <Badge variant="outline" className="ml-auto text-xs">
                Pending
              </Badge>
            )}
          </Button>
          
          <Button
            variant={activeSection === "loans" ? "secondary" : "ghost"}
            className="w-full justify-start relative"
            onClick={() => setActiveSection("loans")}
            data-testid="button-nav-loans"
          >
            <HandHeart className="mr-3 h-4 w-4" />
            Loans
            {!isApproved && (
              <Badge variant="outline" className="ml-auto text-xs">
                Pending
              </Badge>
            )}
          </Button>
          
          <Button
            variant={activeSection === "messages" ? "secondary" : "ghost"}
            className="w-full justify-start relative"
            onClick={() => setActiveSection("messages")}
            data-testid="button-nav-messages"
          >
            <MessageCircle className="mr-3 h-4 w-4" />
            Messages
            <Badge variant="default" className="ml-auto text-xs">
              {messages.length}
            </Badge>
          </Button>
          
          <Button
            variant={activeSection === "support" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveSection("support")}
            data-testid="button-nav-support"
          >
            <Headphones className="mr-3 h-4 w-4" />
            Support
          </Button>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-red-600 hover:bg-red-50 border-red-200"
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-dashboard-title">
                Dashboard
              </h1>
              <p className="text-muted-foreground" data-testid="text-welcome">
                Welcome back, {user.firstName}!
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge 
              variant={user.status === "approved" ? "default" : "secondary"}
              data-testid="badge-account-status"
            >
              <Clock className="mr-1 h-3 w-3" />
              {user.status === "pending" ? "Pending Approval" : user.status}
            </Badge>
            
            <div className="flex items-center space-x-2">
              <img
                src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face`}
                alt="Profile"
                className="w-8 h-8 rounded-full"
                data-testid="img-profile-avatar"
              />
              <span className="font-medium" data-testid="text-user-name">
                {user.firstName} {user.lastName}
              </span>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeSection === "overview" && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2" data-testid="card-account-status">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Account Status</h3>
                    <div className="space-y-4">
                      {user.status === "pending" ? (
                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-center space-x-3">
                            <div className="bg-amber-100 p-2 rounded-full">
                              <Clock className="text-amber-600 h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">Approval Pending</h4>
                              <p className="text-sm text-muted-foreground">Your account is under review</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => setActiveSection("messages")}
                            data-testid="button-contact-admin"
                          >
                            Contact Admin
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <CheckCircle className="text-green-600 h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">Account Approved</h4>
                              <p className="text-sm text-muted-foreground">All features are now available</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <h5 className="font-medium">Progress Status</h5>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                            Application submitted
                          </div>
                          <div className="flex items-center">
                            <Clock className="text-amber-500 mr-2 h-4 w-4" />
                            Document verification {user.status === "approved" ? "completed" : "in progress"}
                          </div>
                          <div className="flex items-center">
                            {user.status === "approved" ? (
                              <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                            ) : (
                              <div className="text-gray-300 mr-2 h-4 w-4 rounded-full border-2" />
                            )}
                            Account approval {user.status === "approved" ? "completed" : "pending"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card data-testid="card-quick-actions">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-3"
                        onClick={() => setActiveSection("messages")}
                        data-testid="button-check-messages"
                      >
                        <Mail className="mr-3 text-primary" />
                        <div className="text-left">
                          <div className="font-medium">Check Messages</div>
                          <div className="text-sm text-muted-foreground">{messages.length} messages</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-3"
                        onClick={() => setActiveSection("support")}
                        data-testid="button-get-support"
                      >
                        <Headphones className="mr-3 text-green-500" />
                        <div className="text-left">
                          <div className="font-medium">Get Support</div>
                          <div className="text-sm text-muted-foreground">24/7 available</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-3"
                        onClick={refreshStatus}
                        data-testid="button-refresh-status"
                      >
                        <RefreshCw className="mr-3 text-blue-500" />
                        <div className="text-left">
                          <div className="font-medium">Refresh Status</div>
                          <div className="text-sm text-muted-foreground">Check approval status</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === "accounts" && (
            <Card data-testid="card-accounts">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Your Accounts</h3>
                {!isApproved ? (
                  <div className="text-center py-12">
                    <div className="bg-amber-100 p-4 rounded-full w-fit mx-auto mb-4">
                      <Lock className="text-amber-600 text-2xl h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-medium mb-2">Account Access Pending</h4>
                    <p className="text-muted-foreground mb-4">
                      Your account information will be available once approved by our admin team.
                    </p>
                    <Button onClick={() => setActiveSection("messages")}>
                      Contact Support
                    </Button>
                  </div>
                ) : (
                  <div>Account details would be shown here for approved users.</div>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "transactions" && (
            <Card data-testid="card-transactions">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
                {!isApproved ? (
                  <div className="text-center py-12">
                    <div className="bg-amber-100 p-4 rounded-full w-fit mx-auto mb-4">
                      <Lock className="text-amber-600 text-2xl h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-medium mb-2">Transactions Locked</h4>
                    <p className="text-muted-foreground mb-4">
                      Transaction features will be enabled once your account is approved.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-amber-800 text-sm">Once approved, you'll be able to:</p>
                      <ul className="text-amber-700 text-sm mt-2 space-y-1">
                        <li>• Send and receive money</li>
                        <li>• View transaction history</li>
                        <li>• Set up recurring payments</li>
                        <li>• Transfer between accounts</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div>Transaction history would be shown here for approved users.</div>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "loans" && (
            <Card data-testid="card-loans">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Loan Services</h3>
                {!isApproved ? (
                  <div className="text-center py-12">
                    <div className="bg-amber-100 p-4 rounded-full w-fit mx-auto mb-4">
                      <Lock className="text-amber-600 text-2xl h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-medium mb-2">Loan Services Locked</h4>
                    <p className="text-muted-foreground mb-4">
                      Loan application features will be available once your account is approved.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-amber-800 text-sm">Available loan types after approval:</p>
                      <ul className="text-amber-700 text-sm mt-2 space-y-1">
                        <li>• Personal loans</li>
                        <li>• Auto loans</li>
                        <li>• Home mortgages</li>
                        <li>• Business loans</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div>Loan services would be shown here for approved users.</div>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "messages" && (
            <Card className="h-96 flex flex-col" data-testid="card-messages">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Messages</h3>
                  <span className="text-sm text-muted-foreground">Admin Support</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message: any, index: number) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 ${
                        message.isFromAdmin ? "" : "justify-end"
                      }`}
                    >
                      {message.isFromAdmin && (
                        <div className="bg-red-600 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center text-xs">
                          <University className="h-3 w-3" />
                        </div>
                      )}
                      <div className={`max-w-sm p-3 rounded-lg ${
                        message.isFromAdmin 
                          ? "bg-muted" 
                          : "bg-primary text-primary-foreground ml-auto"
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      {!message.isFromAdmin && (
                        <img
                          src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`}
                          alt="User"
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending || !messageInput.trim()}
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "support" && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card data-testid="card-contact-support">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Contact Support</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <Mail className="text-primary" />
                      <div>
                        <div className="font-medium">Email Support</div>
                        <div className="text-sm text-muted-foreground">support@spbank.com</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <Phone className="text-green-500" />
                      <div>
                        <div className="font-medium">Phone Support</div>
                        <div className="text-sm text-muted-foreground">+1 (800) SPB-HELP</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <Clock className="text-blue-500" />
                      <div>
                        <div className="font-medium">Business Hours</div>
                        <div className="text-sm text-muted-foreground">24/7 Available</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card data-testid="card-faq">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">FAQ</h3>
                  <div className="space-y-3">
                    <details className="border border-border rounded p-3">
                      <summary className="font-medium cursor-pointer">How long does account approval take?</summary>
                      <p className="text-muted-foreground text-sm mt-2">
                        Account approval typically takes 24-48 hours after document verification.
                      </p>
                    </details>
                    <details className="border border-border rounded p-3">
                      <summary className="font-medium cursor-pointer">What documents are required?</summary>
                      <p className="text-muted-foreground text-sm mt-2">
                        Valid ID, SSN verification, and proof of address are required for account opening.
                      </p>
                    </details>
                    <details className="border border-border rounded p-3">
                      <summary className="font-medium cursor-pointer">Can I access my account while pending?</summary>
                      <p className="text-muted-foreground text-sm mt-2">
                        Yes, you can access basic features like messaging and account status. Full banking features are enabled after approval.
                      </p>
                    </details>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
