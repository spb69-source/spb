import { useState } from "react";
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
  ShieldCheck,
  PieChart,
  Users,
  CheckCircle,
  MessageCircle,
  ArrowLeftRight,
  Shield,
  Settings,
  LogOut,
  Menu,
  UserPlus,
  Check,
  X,
  Eye,
  Send,
  Clock,
  TrendingUp,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import type { User } from "@shared/schema";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { socket, sendMessage: sendWebSocketMessage } = useWebSocket();

  // Queries
  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: user?.role === "admin",
  });

  const { data: pendingUsers = [] } = useQuery({
    queryKey: ["/api/admin/pending-users"],
    enabled: user?.role === "admin",
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/admin/conversations"],
    enabled: user?.role === "admin",
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages", selectedConversation],
    enabled: !!selectedConversation,
  });

  // Mutations
  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/admin/approve-user/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      toast({
        title: "User Approved",
        description: "User account has been successfully approved.",
      });
    }
  });

  const rejectUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/admin/reject-user/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      toast({
        title: "User Rejected",
        description: "User account has been rejected.",
      });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      if (socket) {
        sendWebSocketMessage({
          type: 'send_message',
          senderId: 'admin',
          receiverId,
          content,
          isFromAdmin: true
        });
      }
      return content;
    },
    onSuccess: () => {
      setMessageInput("");
      if (selectedConversation) {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation] });
      }
    }
  });

  const handleApproveUser = (userId: string) => {
    approveUserMutation.mutate(userId);
  };

  const handleRejectUser = (userId: string) => {
    if (confirm("Are you sure you want to reject this user?")) {
      rejectUserMutation.mutate(userId);
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedConversation) {
      sendMessageMutation.mutate({
        receiverId: selectedConversation,
        content: messageInput.trim()
      });
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  if (user?.role !== "admin") {
    return <div>Access denied</div>;
  }

  const totalUsers = allUsers.length;
  const pendingCount = pendingUsers.length;
  const approvedUsers = allUsers.filter((u: User) => u.status === "approved").length;

  return (
    <div className="flex h-screen bg-background">
      {/* Admin Sidebar */}
      <aside 
        className={`bg-gray-900 text-white w-64 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-30 h-full`}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="bg-red-600 p-2 rounded">
              <ShieldCheck />
            </div>
            <div>
              <h3 className="font-semibold" data-testid="text-admin-panel">SPB Admin Panel</h3>
              <p className="text-xs text-gray-400">Administrative Control</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <Button
            variant={activeSection === "dashboard" ? "secondary" : "ghost"}
            className="w-full justify-start text-white hover:bg-gray-800"
            onClick={() => setActiveSection("dashboard")}
            data-testid="button-nav-dashboard"
          >
            <PieChart className="mr-3 h-4 w-4" />
            Dashboard
          </Button>
          
          <Button
            variant={activeSection === "users" ? "secondary" : "ghost"}
            className="w-full justify-start text-white hover:bg-gray-800 relative"
            onClick={() => setActiveSection("users")}
            data-testid="button-nav-users"
          >
            <Users className="mr-3 h-4 w-4" />
            User Management
            {totalUsers > 0 && (
              <Badge variant="destructive" className="ml-auto text-xs">
                {totalUsers}
              </Badge>
            )}
          </Button>
          
          <Button
            variant={activeSection === "approvals" ? "secondary" : "ghost"}
            className="w-full justify-start text-white hover:bg-gray-800 relative"
            onClick={() => setActiveSection("approvals")}
            data-testid="button-nav-approvals"
          >
            <CheckCircle className="mr-3 h-4 w-4" />
            Approvals
            {pendingCount > 0 && (
              <Badge variant="default" className="ml-auto text-xs bg-amber-500">
                {pendingCount}
              </Badge>
            )}
          </Button>
          
          <Button
            variant={activeSection === "messages" ? "secondary" : "ghost"}
            className="w-full justify-start text-white hover:bg-gray-800 relative"
            onClick={() => setActiveSection("messages")}
            data-testid="button-nav-messages"
          >
            <MessageCircle className="mr-3 h-4 w-4" />
            Messages
            <Badge variant="default" className="ml-auto text-xs bg-blue-500">
              {conversations.length}
            </Badge>
          </Button>
          
          <Button
            variant={activeSection === "transactions" ? "secondary" : "ghost"}
            className="w-full justify-start text-white hover:bg-gray-800"
            onClick={() => setActiveSection("transactions")}
            data-testid="button-nav-transactions"
          >
            <ArrowLeftRight className="mr-3 h-4 w-4" />
            Transactions
          </Button>
          
          <Button
            variant={activeSection === "security" ? "secondary" : "ghost"}
            className="w-full justify-start text-white hover:bg-gray-800"
            onClick={() => setActiveSection("security")}
            data-testid="button-nav-security"
          >
            <Shield className="mr-3 h-4 w-4" />
            Security
          </Button>
          
          <Button
            variant={activeSection === "settings" ? "secondary" : "ghost"}
            className="w-full justify-start text-white hover:bg-gray-800"
            onClick={() => setActiveSection("settings")}
            data-testid="button-nav-settings"
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Button>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-red-400 hover:bg-red-900 border-red-400"
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      
      {/* Admin Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Top Bar */}
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
              <h1 className="text-2xl font-semibold" data-testid="text-admin-dashboard-title">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">Secure Professional Bank Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-red-600 text-white p-2 rounded-full">
                <ShieldCheck />
              </div>
              <span className="font-medium" data-testid="text-admin-name">SPB Admin</span>
            </div>
          </div>
        </header>
        
        {/* Admin Dashboard Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-4 gap-6">
                <Card data-testid="card-total-users">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground">Total Users</p>
                        <p className="text-3xl font-bold">{totalUsers}</p>
                      </div>
                      <Users className="text-blue-500 text-2xl" />
                    </div>
                    <p className="text-sm text-green-600 mt-2">↑ Active accounts</p>
                  </CardContent>
                </Card>
                
                <Card data-testid="card-pending-approvals">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground">Pending Approvals</p>
                        <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
                      </div>
                      <Clock className="text-amber-500 text-2xl" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Requires attention</p>
                  </CardContent>
                </Card>
                
                <Card data-testid="card-active-accounts">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground">Active Accounts</p>
                        <p className="text-3xl font-bold text-green-600">{approvedUsers}</p>
                      </div>
                      <CheckCircle className="text-green-500 text-2xl" />
                    </div>
                    <p className="text-sm text-green-600 mt-2">
                      {totalUsers > 0 ? ((approvedUsers / totalUsers) * 100).toFixed(1) : 0}% approval rate
                    </p>
                  </CardContent>
                </Card>
                
                <Card data-testid="card-total-transactions">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground">Total Transactions</p>
                        <p className="text-3xl font-bold">$0</p>
                      </div>
                      <DollarSign className="text-green-500 text-2xl" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">System ready</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <Card data-testid="card-recent-activity">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {pendingUsers.slice(0, 3).map((user: User) => (
                        <div key={user.id} className="flex items-center space-x-3 p-3 border-l-4 border-blue-500 bg-blue-50">
                          <UserPlus className="text-blue-500" />
                          <div className="flex-1">
                            <p className="font-medium">New user registration</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {pendingUsers.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card data-testid="card-quick-actions">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={() => setActiveSection("approvals")}
                        className="p-4 h-auto flex flex-col items-center"
                        variant="outline"
                        data-testid="button-review-approvals"
                      >
                        <CheckCircle className="text-green-500 text-2xl mb-2" />
                        <p className="font-medium">Review Approvals</p>
                        <p className="text-sm text-muted-foreground">{pendingCount} pending</p>
                      </Button>
                      
                      <Button
                        onClick={() => setActiveSection("messages")}
                        className="p-4 h-auto flex flex-col items-center"
                        variant="outline"
                        data-testid="button-view-messages"
                      >
                        <MessageCircle className="text-blue-500 text-2xl mb-2" />
                        <p className="font-medium">View Messages</p>
                        <p className="text-sm text-muted-foreground">{conversations.length} conversations</p>
                      </Button>
                      
                      <Button
                        onClick={() => setActiveSection("users")}
                        className="p-4 h-auto flex flex-col items-center"
                        variant="outline"
                        data-testid="button-manage-users"
                      >
                        <Users className="text-purple-500 text-2xl mb-2" />
                        <p className="font-medium">Manage Users</p>
                        <p className="text-sm text-muted-foreground">{totalUsers} total</p>
                      </Button>
                      
                      <Button
                        onClick={() => setActiveSection("security")}
                        className="p-4 h-auto flex flex-col items-center"
                        variant="outline"
                        data-testid="button-security"
                      >
                        <Shield className="text-red-500 text-2xl mb-2" />
                        <p className="font-medium">Security</p>
                        <p className="text-sm text-muted-foreground">All secure</p>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === "users" && (
            <Card data-testid="card-user-management">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <div className="flex space-x-2">
                    <Input placeholder="Search users..." className="w-64" />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Registration Date</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((user: User) => (
                        <tr key={user.id} className="border-b border-border hover:bg-accent">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face`}
                                alt="User avatar"
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-muted-foreground">ID: #{user.id.slice(-8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={
                                user.status === "approved" ? "default" : 
                                user.status === "pending" ? "secondary" :
                                "destructive"
                              }
                            >
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              {user.status === "pending" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveUser(user.id)}
                                  disabled={approveUserMutation.isPending}
                                  data-testid={`button-approve-${user.id}`}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`button-view-${user.id}`}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "approvals" && (
            <Card data-testid="card-pending-approvals-detail">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6">Pending Approvals</h3>
                
                <div className="space-y-6">
                  {pendingUsers.map((user: User) => (
                    <div key={user.id} className="border border-border rounded-lg p-6">
                      <div className="# thoughts

Looking at this request, I need to create a comprehensive online banking platform called "Secure Professional Bank" with both user and admin dashboards. The key requirements are:

1. User registration with SSN and address fields
2. Admin approval workflow for new accounts
3. Real-time messaging between admin and users
4. Role-based access control
5. PostgreSQL database storage
6. Professional banking UI design
7. Responsive layout

The design reference shows a multi-page banking application with landing page, sign-up/sign-in forms, user dashboard with pending approval states, and admin dashboard with user management capabilities.

I'll implement this using React with TypeScript, Express.js backend, PostgreSQL with Drizzle ORM, and WebSocket for real-time messaging. The application will have proper authentication, session management, and secure admin access.

# useful_guidelines_from_blueprints

From the database blueprint:
- Add Drizzle models and relations to `shared/schema.ts`
- Update `server/storage.ts` to replace MemStorage with DatabaseStorage
- Use `npm run db:push` for schema changes

From the WebSocket blueprint:
- Add WebSocket server to existing HTTP server on distinct path `/ws`
- Check `.readyState` against `WebSocket.OPEN`
- Connect from client using correct protocol and path

# directory_structure

```json
[
    {"path": "shared/schema.ts", "status": "overwritten"},
    {"path": "server/db.ts", "status": "new", "blueprint_source": "javascript_database"},
    {"path": "server/storage.ts", "status": "overwritten"},
    {"path": "server/routes.ts", "status": "overwritten"},
    {"path": "client/src/App.tsx", "status": "overwritten"},
    {"path": "client/src/pages/landing.tsx", "status": "new"},
    {"path": "client/src/pages/signup.tsx", "status": "new"},
    {"path": "client/src/pages/signin.tsx", "status": "new"},
    {"path": "client/src/pages/admin-login.tsx", "status": "new"},
    {"path": "client/src/pages/user-dashboard.tsx", "status": "new"},
    {"path": "client/src/pages/admin-dashboard.tsx", "status": "new"},
    {"path": "client/src/components/user-sidebar.tsx", "status": "new"},
    {"path": "client/src/components/admin-sidebar.tsx", "status": "new"},
    {"path": "client/src/components/message-chat.tsx", "status": "new"},
    {"path": "client/src/hooks/useAuth.ts", "status": "new"},
    {"path": "client/src/hooks/useWebSocket.ts", "status": "new"},
    {"path": "client/src/lib/authUtils.ts", "status": "new"},
    {"path": "client/src/index.css", "status": "overwritten"},
    {"path": "tailwind.config.ts", "status": "overwritten"}
]
