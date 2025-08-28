import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Menu, Clock, CheckCircle, Lock, Wallet, CreditCard, MessageCircle, Headphones, LogOut, Mail, Phone, RefreshCw } from "lucide-react";

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
    <div className="flex h-screen bg-background">
      <UserSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
        isApproved={isApproved}
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
              <h1 className="text-2xl font-semibold" data-testid="text-dashboard-title">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, <span data-testid="text-user-firstName">{user?.firstName}</span>!
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Account Status Badge */}
            <Badge 
              variant={isApproved ? "default" : "secondary"}
              className={isApproved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
              data-testid="badge-account-status"
            >
              {isApproved ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Approval
                </>
              )}
            </Badge>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <span className="font-medium" data-testid="text-user-fullName">
                {user?.firstName} {user?.lastName}
              </span>
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

function OverviewSection({ user, isApproved, onRefresh, onShowMessages }: any) {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Account Status Card */}
        <Card className="lg:col-span-2" data-testid="card-account-status">
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-lg border ${isApproved ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${isApproved ? 'bg-green-100' : 'bg-amber-100'}`}>
                  {isApproved ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium" data-testid="text-approval-status">
                    {isApproved ? "Account Approved" : "Approval Pending"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {isApproved ? "Your account is fully activated" : "Your account is under review"}
                  </p>
                </div>
              </div>
              <Button onClick={onShowMessages} data-testid="button-contact-admin">
                Contact Admin
              </Button>
            </div>
            
            {!isApproved && (
              <div className="space-y-2">
                <h5 className="font-medium">What's Next?</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Application submitted
                  </li>
                  <li className="flex items-center">
                    <Clock className="h-4 w-4 text-amber-500 mr-2" />
                    Document verification in progress
                  </li>
                  <li className="flex items-center">
                    <div className="h-4 w-4 border-2 border-gray-300 rounded-full mr-2" />
                    Account approval pending
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={onShowMessages}
              data-testid="button-check-messages"
            >
              <MessageCircle className="h-4 w-4 mr-3 text-primary" />
              <div className="text-left">
                <div className="font-medium">Check Messages</div>
                <div className="text-sm text-muted-foreground">New updates available</div>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {}}
              data-testid="button-get-support"
            >
              <Headphones className="h-4 w-4 mr-3 text-green-500" />
              <div className="text-left">
                <div className="font-medium">Get Support</div>
                <div className="text-sm text-muted-foreground">24/7 available</div>
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={onRefresh}
              data-testid="button-refresh-status"
            >
              <RefreshCw className="h-4 w-4 mr-3 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">Refresh Status</div>
                <div className="text-sm text-muted-foreground">Check approval status</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AccountsSection({ isApproved, onShowMessages }: any) {
  if (!isApproved) {
    return (
      <Card data-testid="card-accounts-locked">
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="bg-amber-100 p-4 rounded-full w-fit mx-auto mb-4">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>
            <h4 className="text-xl font-medium mb-2" data-testid="text-access-pending">Account Access Pending</h4>
            <p className="text-muted-foreground mb-4">
              Your account information will be available once approved by our admin team.
            </p>
            <Button onClick={onShowMessages} data-testid="button-contact-support">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show actual accounts for approved users
  return (
    <div className="space-y-6">
      <Card data-testid="card-accounts-approved">
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-primary text-primary-foreground p-3 rounded-full">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold">Primary Checking</h4>
                  <p className="text-sm text-muted-foreground">Account #: ****1234</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-sm text-muted-foreground">Available Balance</p>
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
      <Card data-testid="card-transactions-locked">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="bg-amber-100 p-4 rounded-full w-fit mx-auto mb-4">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>
            <h4 className="text-xl font-medium mb-2" data-testid="text-transactions-locked">Transactions Locked</h4>
            <p className="text-muted-foreground mb-4">
              Transaction features will be enabled once your account is approved.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-amber-800 text-sm">Once approved, you'll be able to:</p>
              <ul className="text-amber-700 text-sm mt-2 space-y-1 text-left">
                <li>• Send and receive money</li>
                <li>• View transaction history</li>
                <li>• Set up recurring payments</li>
                <li>• Transfer between accounts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-transactions-approved">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <CreditCard className="h-12 w-12 mx-auto mb-4" />
          <p>No transactions yet</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LoansSection({ isApproved }: any) {
  if (!isApproved) {
    return (
      <Card data-testid="card-loans-locked">
        <CardHeader>
          <CardTitle>Loan Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="bg-amber-100 p-4 rounded-full w-fit mx-auto mb-4">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>
            <h4 className="text-xl font-medium mb-2" data-testid="text-loan-services-locked">Loan Services Locked</h4>
            <p className="text-muted-foreground mb-4">
              Loan application features will be available once your account is approved.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-amber-800 text-sm">Available loan types after approval:</p>
              <ul className="text-amber-700 text-sm mt-2 space-y-1 text-left">
                <li>• Personal loans</li>
                <li>• Auto loans</li>
                <li>• Home mortgages</li>
                <li>• Business loans</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-loans-approved">
      <CardHeader>
        <CardTitle>Loan Services</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <p>No loan applications yet</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SupportSection() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card data-testid="card-contact-support">
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">Email Support</div>
              <div className="text-sm text-muted-foreground">support@spbank.com</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
            <Phone className="h-5 w-5 text-green-500" />
            <div>
              <div className="font-medium">Phone Support</div>
              <div className="text-sm text-muted-foreground">+1 (800) SPB-HELP</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <div className="font-medium">Business Hours</div>
              <div className="text-sm text-muted-foreground">24/7 Available</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card data-testid="card-faq">
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>
    </div>
  );
}
