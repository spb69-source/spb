import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  TrendingUp, 
  Wallet, 
  ArrowLeftRight, 
  HandHeart, 
  MessageCircle, 
  Headphones, 
  LogOut,
  Home,
  Sparkles,
  Crown
} from "lucide-react";

interface UserSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  isApproved: boolean;
}

export default function UserSidebar({ 
  activeSection, 
  onSectionChange, 
  isOpen, 
  onToggle, 
  onLogout,
  isApproved 
}: UserSidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl w-64 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-30 h-full`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white p-3 rounded-xl shadow-xl">
                <Shield className="h-6 w-6" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900" data-testid="text-bank-name">SPB Banking</h3>
              <p className="text-xs text-gray-600">Personal Dashboard</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <Button
            variant={activeSection === "overview" ? "default" : "ghost"}
            className={`w-full justify-start transition-all duration-200 ${
              activeSection === "overview" 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                : "hover:bg-blue-50 text-gray-700"
            }`}
            onClick={() => onSectionChange("overview")}
            data-testid="button-nav-overview"
          >
            <TrendingUp className="mr-3 h-5 w-5" />
            Overview
          </Button>
          
          <Button
            variant={activeSection === "accounts" ? "default" : "ghost"}
            className={`w-full justify-start transition-all duration-200 ${
              activeSection === "accounts" 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                : "hover:bg-blue-50 text-gray-700"
            }`}
            onClick={() => onSectionChange("accounts")}
            data-testid="button-nav-accounts"
          >
            <Wallet className="mr-3 h-5 w-5" />
            Accounts
            {!isApproved && (
              <Badge variant="outline" className="ml-auto text-xs bg-amber-50 text-amber-700 border-amber-200">
                Locked
              </Badge>
            )}
          </Button>
          
          <Button
            variant={activeSection === "transactions" ? "default" : "ghost"}
            className={`w-full justify-start transition-all duration-200 ${
              activeSection === "transactions" 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                : "hover:bg-blue-50 text-gray-700"
            }`}
            onClick={() => onSectionChange("transactions")}
            data-testid="button-nav-transactions"
          >
            <ArrowLeftRight className="mr-3 h-5 w-5" />
            Transactions
            {!isApproved && (
              <Badge variant="outline" className="ml-auto text-xs bg-amber-50 text-amber-700 border-amber-200">
                Locked
              </Badge>
            )}
          </Button>
          
          <Button
            variant={activeSection === "loans" ? "default" : "ghost"}
            className={`w-full justify-start transition-all duration-200 ${
              activeSection === "loans" 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                : "hover:bg-blue-50 text-gray-700"
            }`}
            onClick={() => onSectionChange("loans")}
            data-testid="button-nav-loans"
          >
            <HandHeart className="mr-3 h-5 w-5" />
            Loans
            {!isApproved && (
              <Badge variant="outline" className="ml-auto text-xs bg-amber-50 text-amber-700 border-amber-200">
                Locked
              </Badge>
            )}
          </Button>
          
          <Button
            variant={activeSection === "messages" ? "default" : "ghost"}
            className={`w-full justify-start transition-all duration-200 relative ${
              activeSection === "messages" 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                : "hover:bg-blue-50 text-gray-700"
            }`}
            onClick={() => onSectionChange("messages")}
            data-testid="button-nav-messages"
          >
            <MessageCircle className="mr-3 h-5 w-5" />
            Messages
            <Badge className="ml-auto text-xs bg-green-500 text-white border-0">
              Live
            </Badge>
          </Button>
          
          <Button
            variant={activeSection === "support" ? "default" : "ghost"}
            className={`w-full justify-start transition-all duration-200 ${
              activeSection === "support" 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                : "hover:bg-blue-50 text-gray-700"
            }`}
            onClick={() => onSectionChange("support")}
            data-testid="button-nav-support"
          >
            <Headphones className="mr-3 h-5 w-5" />
            Support
            <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </Button>
        </nav>
        
        {/* Status Badge */}
        <div className="px-4 mb-4">
          <div className={`p-3 rounded-xl border-2 ${
            isApproved 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
              : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-full ${isApproved ? 'bg-green-100' : 'bg-amber-100'}`}>
                {isApproved ? (
                  <Crown className="h-4 w-4 text-green-600" />
                ) : (
                  <Sparkles className="h-4 w-4 text-amber-600" />
                )}
              </div>
              <div>
                <p className={`text-xs font-semibold ${isApproved ? 'text-green-800' : 'text-amber-800'}`}>
                  {isApproved ? "Premium Member" : "Account Pending"}
                </p>
                <p className={`text-xs ${isApproved ? 'text-green-600' : 'text-amber-600'}`}>
                  {isApproved ? "All features unlocked" : "Under review"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={onLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}