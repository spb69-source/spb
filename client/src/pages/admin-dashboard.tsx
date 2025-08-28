import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Users, CheckCircle, MessageCircle, DollarSign, BarChart3, Settings, LogOut, Menu, UserPlus, Check, X, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminSidebar from "@/components/admin-sidebar";

type AdminSection = "dashboard" | "users" | "approvals" | "messages" | "transactions" | "security" | "settings";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminOverview />;
      case "users":
        return <UsersManagement />;
      case "approvals":
        return <ApprovalsSection />;
      case "messages":
        return <AdminMessages />;
      case "transactions":
        return <TransactionsOverview />;
      case "security":
        return <SecuritySection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-testid="button-toggle-sidebar"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-admin-dashboard">Admin Dashboard</h1>
              <p className="text-muted-foreground">Secure Professional Bank Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-red-600 text-white p-2 rounded-full">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="font-medium" data-testid="text-admin-name">SPB Admin</span>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function AdminOverview() {
  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const { data: pendingUsers = [] } = useQuery({
    queryKey: ["/api/admin/pending-users"],
    retry: false,
  });

  const totalUsers = allUsers.length;
  const pendingCount = pendingUsers.length;
  const approvedUsers = allUsers.filter((u: any) => u.isApproved).length;

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-4 gap-6">
        <Card data-testid="card-total-users">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold" data-testid="text-total-users">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm text-green-600 mt-2">Active accounts</p>
          </CardContent>
        </Card>
        
        <Card data-testid="card-pending-approvals">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Pending Approvals</p>
                <p className="text-3xl font-bold text-amber-600" data-testid="text-pending-approvals">
                  {pendingCount}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-amber-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Requires attention</p>
          </CardContent>
        </Card>
        
        <Card data-testid="card-active-accounts">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Active Accounts</p>
                <p className="text-3xl font-bold text-green-600" data-testid="text-active-accounts">{approvedUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
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
                <p className="text-3xl font-bold" data-testid="text-total-transactions">$0</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">System ready</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <Card data-testid="card-recent-activity">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingUsers.slice(0, 3).map((user: any) => (
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
          </CardContent>
        </Card>
        
        <Card data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-review-approvals">
                <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
                <div className="text-center">
                  <p className="font-medium">Review Approvals</p>
                  <p className="text-sm text-muted-foreground">{pendingCount} pending</p>
                </div>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-view-messages">
                <MessageCircle className="h-6 w-6 text-blue-500 mb-2" />
                <div className="text-center">
                  <p className="font-medium">View Messages</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-manage-users">
                <Users className="h-6 w-6 text-purple-500 mb-2" />
                <div className="text-center">
                  <p className="font-medium">Manage Users</p>
                  <p className="text-sm text-muted-foreground">{totalUsers} total</p>
                </div>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col" data-testid="button-security">
                <ShieldCheck className="h-6 w-6 text-red-500 mb-2" />
                <div className="text-center">
                  <p className="font-medium">Security</p>
                  <p className="text-sm text-muted-foreground">All secure</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UsersManagement() {
  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  return (
    <Card data-testid="card-user-management">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <div className="flex space-x-2">
            <Input placeholder="Search users..." className="w-64" data-testid="input-search-users" />
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
              {users.map((user: any) => (
                <tr key={user.id} className="border-b border-border hover:bg-accent">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium" data-testid={`text-user-name-${user.id}`}>
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">ID: #{user.id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4" data-testid={`text-user-email-${user.id}`}>{user.email}</td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={user.isApproved ? "default" : "secondary"}
                      className={user.isApproved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
                      data-testid={`badge-user-status-${user.id}`}
                    >
                      {user.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {!user.isApproved && (
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600"
                          data-testid={`button-approve-${user.id}`}
                        >
                          Approve
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        data-testid={`button-view-${user.id}`}
                      >
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
  );
}

function ApprovalsSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pendingUsers = [] } = useQuery({
    queryKey: ["/api/admin/pending-users"],
    retry: false,
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/admin/approve-user/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Approved",
        description: "The user has been successfully approved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/admin/reject-user/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      toast({
        title: "User Rejected",
        description: "The user has been rejected.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject user. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card data-testid="card-pending-approvals">
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {pendingUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4" />
              <p>No pending approvals</p>
            </div>
          ) : (
            pendingUsers.map((user: any) => (
              <div key={user.id} className="border border-border rounded-lg p-6" data-testid={`card-approval-${user.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold" data-testid={`text-approval-user-name-${user.id}`}>
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-muted-foreground" data-testid={`text-approval-user-email-${user.id}`}>
                        {user.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Applied: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => approveMutation.mutate(user.id)}
                      disabled={approveMutation.isPending}
                      data-testid={`button-approve-user-${user.id}`}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(user.id)}
                      disabled={rejectMutation.isPending}
                      data-testid={`button-reject-user-${user.id}`}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button 
                      variant="outline"
                      data-testid={`button-details-user-${user.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 grid md:grid-cols-3 gap-4">
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm text-muted-foreground">SSN</p>
                    <p className="font-medium" data-testid={`text-user-ssn-${user.id}`}>{user.ssn}</p>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium" data-testid={`text-user-address-${user.id}`}>
                      {user.streetAddress}, {user.city}, {user.state}
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium" data-testid={`text-user-phone-${user.id}`}>{user.phone}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AdminMessages() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card data-testid="card-conversations">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4" />
            <p>No active conversations</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2" data-testid="card-message-center">
        <CardHeader>
          <CardTitle>Message Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Select a conversation to view messages</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TransactionsOverview() {
  return (
    <Card data-testid="card-transaction-overview">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction Overview</CardTitle>
          <div className="flex space-x-2">
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Last 7 days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
            <Button>Export</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-green-700 font-semibold">Total Volume</h4>
            <p className="text-2xl font-bold text-green-800" data-testid="text-total-volume">$0</p>
            <p className="text-sm text-green-600">System ready</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-700 font-semibold">Transactions</h4>
            <p className="text-2xl font-bold text-blue-800" data-testid="text-transaction-count">0</p>
            <p className="text-sm text-blue-600">No transactions yet</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-purple-700 font-semibold">Average Transaction</h4>
            <p className="text-2xl font-bold text-purple-800" data-testid="text-avg-transaction">$0</p>
            <p className="text-sm text-purple-600">No data</p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="text-amber-700 font-semibold">Flagged</h4>
            <p className="text-2xl font-bold text-amber-800" data-testid="text-flagged-transactions">0</p>
            <p className="text-sm text-amber-600">All secure</p>
          </div>
        </div>
        
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4" />
          <p>No transactions to display</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SecuritySection() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card data-testid="card-security-overview">
        <CardHeader>
          <CardTitle>Security Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">System Security</p>
                <p className="text-sm text-muted-foreground">All systems operational</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">Secure</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 text-green-500">🔒</div>
              <div>
                <p className="font-medium">SSL Certificate</p>
                <p className="text-sm text-muted-foreground">Valid until Mar 2025</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 text-green-500">🗄</div>
              <div>
                <p className="font-medium">Data Encryption</p>
                <p className="text-sm text-muted-foreground">AES-256 encryption active</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">Protected</Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card data-testid="card-security-events">
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 border-l-4 border-green-500 bg-green-50">
            <p className="font-medium">System Started</p>
            <p className="text-sm text-muted-foreground">Banking system initialized</p>
            <p className="text-xs text-muted-foreground">System startup</p>
          </div>
          
          <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
            <p className="font-medium">Security Scan Complete</p>
            <p className="text-sm text-muted-foreground">No vulnerabilities detected</p>
            <p className="text-xs text-muted-foreground">Automated scan</p>
          </div>
          
          <div className="p-3 border-l-4 border-green-500 bg-green-50">
            <p className="font-medium">Database Secure</p>
            <p className="text-sm text-muted-foreground">All connections encrypted</p>
            <p className="text-xs text-muted-foreground">Connection check</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card data-testid="card-system-settings">
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-approval</p>
              <p className="text-sm text-muted-foreground">Automatically approve verified accounts</p>
            </div>
            <Button variant="outline" size="sm">Toggle</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Send notifications for new registrations</p>
            </div>
            <Button variant="outline" size="sm">Toggle</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">Disable new registrations temporarily</p>
            </div>
            <Button variant="outline" size="sm">Toggle</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card data-testid="card-admin-profile">
        <CardHeader>
          <CardTitle>Admin Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <Input value="SPB Admin" readOnly data-testid="input-admin-username" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input value="spb@admin.io" readOnly data-testid="input-admin-email" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Change Password</label>
            <Input type="password" placeholder="Enter new password" data-testid="input-new-password" />
          </div>
          
          <Button className="w-full bg-red-600 hover:bg-red-700" data-testid="button-update-profile">
            Update Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
