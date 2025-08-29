import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Shield, 
  Menu, 
  Clock, 
  CheckCircle, 
  Lock, 
  Wallet, 
  CreditCard, 
  MessageCircle, 
  Headphones, 
  LogOut, 
  RefreshCw,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Award,
  Calendar,
  PieChart,
  BarChart3,
  Globe,
  Send,
  Eye,
  Settings,
  Bell,
  Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import UserSidebar from "@/components/user-sidebar";
import MessageChat from "@/components/message-chat";

type Section = "overview" | "accounts" | "transactions" | "loans" | "messages" | "support";

export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isApproved } = useAuth();
  const { toast } = useToast();

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

  const refreshStatus = () => {
    toast({
      title: "Status Refreshed",
      description: isApproved ? "Your account is approved!" : "Still pending approval.",
    });
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection user={user} isApproved={isApproved} onRefresh={refreshStatus} onShowMessages={() => setActiveSection("messages")} />;
      case "accounts":
        return <AccountsSection isApproved={isApproved} onShowMessages={() => setActiveSection("messages")} />;
      case "transactions":
        return <TransactionsSection isApproved={isApproved} />;
      case "loans":
        return <LoansSection isApproved={isApproved} />;
      case "messages":
        return <MessageChat />;
      case "support":
        return <SupportSection />;
      default:
        return <OverviewSection user={user} isApproved={isApproved} onRefresh={refreshStatus} onShowMessages={() => setActiveSection("messages")} />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <UserSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
        isApproved={isApproved}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                data-testid="button-toggle-sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900" data-testid="text-dashboard-title">
                  Welcome back, <span data-testid="text-user-firstName">{user?.firstName}</span>!
                </h1>
                <p className="text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-xl">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold" data-testid="text-user-initials">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium" data-testid="text-user-fullName">{user?.firstName} {user?.lastName}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function OverviewSection({ user, isApproved, onRefresh, onShowMessages }: any) {
  return (
    <div className="space-y-6">
      {/* Status Cards Row */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
        {/* Account Status */}
        <Card className="bg-white/60 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300" data-testid="card-account-status">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Account Status</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className={`p-1 rounded-full ${isApproved ? 'bg-green-100' : 'bg-amber-100'}`}>
                    {isApproved ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                  <span className={`font-semibold ${isApproved ? 'text-green-600' : 'text-amber-600'}`} data-testid="text-approval-status">
                    {isApproved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>
              <Button size="sm" onClick={onRefresh} variant="ghost" className="hover:bg-white/50" data-testid="button-refresh-status">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Balance</p>
                <p className="text-3xl font-bold mt-1">
                  {isApproved ? "$0.00" : "---"}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Card */}
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold mt-1">
                  {isApproved ? "0" : "---"}
                </p>
                <p className="text-green-100 text-xs">Transactions</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages Card */}
        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Messages</p>
                <p className="text-3xl font-bold mt-1">0</p>
                <p className="text-purple-100 text-xs">Unread</p>
              </div>
              <Button size="sm" onClick={onShowMessages} className="bg-white/20 hover:bg-white/30 border-0" data-testid="button-check-messages">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Account Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Banner */}
          <Card className={`border-0 shadow-xl ${isApproved ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-amber-50 to-orange-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl ${isApproved ? 'bg-green-100' : 'bg-amber-100'}`}>
                    {isApproved ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <Clock className="h-8 w-8 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isApproved ? 'text-green-900' : 'text-amber-900'}`}>
                      {isApproved ? "Account Fully Activated!" : "Account Under Review"}
                    </h3>
                    <p className={`${isApproved ? 'text-green-700' : 'text-amber-700'}`}>
                      {isApproved 
                        ? "You now have access to all banking features" 
                        : "We're verifying your information. This usually takes 1-2 business days."
                      }
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={onShowMessages}
                  className={`${isApproved ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'} text-white`}
                  data-testid="button-contact-admin"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
              
              {!isApproved && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-amber-900">Verification Progress</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-amber-800">Application submitted</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-amber-500 rounded-full animate-pulse"></div>
                      <span className="text-amber-800">Document verification in progress</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                      <span className="text-gray-600">Final approval pending</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/60 backdrop-blur-lg border-0 shadow-xl" data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  className="h-20 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg group"
                  disabled={!isApproved}
                  data-testid="button-send-money"
                >
                  <div className="flex items-center space-x-3">
                    <Send className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="font-semibold">Send Money</div>
                      <div className="text-xs opacity-90">Transfer funds</div>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  className="h-20 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg group"
                  disabled={!isApproved}
                  data-testid="button-pay-bills"
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="font-semibold">Pay Bills</div>
                      <div className="text-xs opacity-90">Manage payments</div>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  className="h-20 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-lg group"
                  disabled={!isApproved}
                  data-testid="button-view-reports"
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="font-semibold">View Reports</div>
                      <div className="text-xs opacity-90">Financial insights</div>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  className="h-20 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg group"
                  disabled={!isApproved}
                  data-testid="button-apply-loan"
                >
                  <div className="flex items-center space-x-3">
                    <Award className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="font-semibold">Apply for Loan</div>
                      <div className="text-xs opacity-90">Get financing</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* User Profile Card */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{user?.firstName} {user?.lastName}</h3>
                <p className="text-gray-300 text-sm">{user?.email}</p>
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <Badge variant={isApproved ? "default" : "secondary"} className="bg-white/20">
                    {isApproved ? "Verified" : "Pending"}
                  </Badge>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/60 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isApproved ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
                      <Clock className="h-5 w-5 text-amber-600" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-900">Account verification in progress</p>
                        <p className="text-amber-700">Expected completion: 1-2 business days</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="bg-white/20 p-3 rounded-full w-fit mx-auto mb-4">
                  <Headphones className="h-6 w-6" />
                </div>
                <h3 className="font-bold mb-2">Need Help?</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Our support team is available 24/7 to assist you.
                </p>
                <Button 
                  onClick={onShowMessages}
                  className="bg-white text-blue-600 hover:bg-gray-100 w-full"
                  data-testid="button-get-support"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AccountsSection({ isApproved, onShowMessages }: any) {
  if (!isApproved) {
    return (
      <Card className="bg-white/60 backdrop-blur-lg border-0 shadow-xl" data-testid="card-accounts-locked">
        <CardContent className="p-12">
          <div className="text-center">
            <div className="bg-amber-100 p-6 rounded-full w-fit mx-auto mb-6">
              <Lock className="h-12 w-12 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4" data-testid="text-access-pending">Accounts Locked</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your account features will be unlocked once your application is approved by our team.
            </p>
            <Button onClick={onShowMessages} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white" data-testid="button-contact-support">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="card-accounts-approved">
      <Card className="bg-white/60 backdrop-blur-lg border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Your Accounts</CardTitle>
          <CardDescription>Manage your banking accounts and view balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-4 rounded-2xl">
                  <Wallet className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">Primary Checking</h4>
                  <p className="text-gray-600">Account #: ****1234</p>
                  <Badge className="mt-1 bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">$0.00</p>
                <p className="text-gray-600">Available Balance</p>
                <Button size="sm" className="mt-2" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TransactionsSection({ isApproved }: any) {
  if (!isApproved) {
    return (
      <Card className="bg-white/60 backdrop-blur-lg border-0 shadow-xl" data-testid="card-transactions-locked">
        <CardContent className="p-12">
          <div className="text-center">
            <div className="bg-amber-100 p-6 rounded-full w-fit mx-auto mb-6">
              <Lock className="h-12 w-12 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4" data-testid="text-transactions-locked">Transactions Locked</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Transaction features will be enabled once your account is approved.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 max-w-md mx-auto mb-6">
              <h4 className="font-semibold text-amber-900 mb-3">Coming Soon:</h4>
              <ul className="text-amber-800 text-sm space-y-2 text-left">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Send and receive money</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>View transaction history</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Set up recurring payments</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Transfer between accounts</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/60 backdrop-blur-lg border-0 shadow-xl" data-testid="card-transactions-approved">
      <CardHeader>
        <CardTitle className="text-2xl">Transaction History</CardTitle>
        <CardDescription>Track all your financial activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-16 text-gray-500">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-full w-fit mx-auto mb-4">
            <CreditCard className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
          <p className="text-gray-600">Your transaction history will appear here once you start banking with us.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LoansSection({ isApproved }: any) {
  if (!isApproved) {
    return (
      <Card className="bg-white/60 backdrop-blur-lg border-0 shadow-xl" data-testid="card-loans-locked">
        <CardContent className="p-12">
          <div className="text-center">
            <div className="bg-amber-100 p-6 rounded-full w-fit mx-auto mb-6">
              <Lock className="h-12 w-12 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4" data-testid="text-loan-services-locked">Loan Services Locked</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Loan application features will be available once your account is approved.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 max-w-md mx-auto mb-6">
              <h4 className="font-semibold text-amber-900 mb-3">Available After Approval:</h4>
              <ul className="text-amber-800 text-sm space-y-2 text-left">
                <li className="flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>Personal loans</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>Auto loans</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>Home mortgages</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>Business loans</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/60 backdrop-blur-lg border-0 shadow-xl" data-testid="card-loans-approved">
      <CardHeader>
        <CardTitle className="text-2xl">Loan Services</CardTitle>
        <CardDescription>Apply for loans and manage your applications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-16 text-gray-500">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-full w-fit mx-auto mb-4">
            <Award className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Apply?</h3>
          <p className="text-gray-600 mb-6">Explore our loan options and find the perfect fit for your needs.</p>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <Award className="h-4 w-4 mr-2" />
            View Loan Options
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SupportSection() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-xl" data-testid="card-contact-support">
        <CardHeader>
          <CardTitle className="text-2xl">24/7 Support Center</CardTitle>
          <CardDescription className="text-blue-100">
            We're here to help you with all your banking needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-6 w-6" />
                <span className="font-semibold">Live Chat Support</span>
              </div>
              <p className="text-blue-100 text-sm">
                Get instant help from our support team available 24/7.
              </p>
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                Start Chat
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Headphones className="h-6 w-6" />
                <span className="font-semibold">Phone Support</span>
              </div>
              <p className="text-blue-100 text-sm">
                Call us anytime for personalized assistance.
              </p>
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                Call Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/60 backdrop-blur-lg border-0 shadow-xl" data-testid="card-faq">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">How long does account approval take?</h4>
              <p className="text-gray-600 text-sm">
                Most accounts are approved within 1-2 business days after document verification.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">What documents do I need?</h4>
              <p className="text-gray-600 text-sm">
                You'll need a government-issued ID, proof of address, and social security number.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Is my money insured?</h4>
              <p className="text-gray-600 text-sm">
                Yes, all deposits are FDIC insured up to $250,000 per account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}