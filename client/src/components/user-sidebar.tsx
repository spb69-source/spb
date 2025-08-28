import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, Wallet, ArrowLeftRight, HandHeart, MessageCircle, Headphones, LogOut } from "lucide-react";

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
        className={`bg-white border-r border-border w-64 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-30 h-full`}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground p-2 rounded">
              <Shield />
            </div>
            <div>
              <h3 className="font-semibold" data-testid="text-bank-name">SPB Banking</h3>
              <p className="text-xs text-muted-foreground">Personal Dashboard</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <Button
            variant={activeSection === "overview" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSectionChange("overview")}
            data-testid="button-nav-overview"
          >
            <TrendingUp className="mr-3 h-4 w-4" />
            Overview
          </Button>
          
          <Button
            variant={activeSection === "accounts" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSectionChange("accounts")}
            data-testid="button-nav-accounts"
          >
            <Wallet className="mr-3 h-4 w-4" />
            Accounts
          </Button>
          
          <Button
            variant={activeSection === "transactions" ? "secondary" : "ghost"}
            className="w-full justify-start relative"
            onClick={() => onSectionChange("transactions")}
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
            onClick={() => onSectionChange("loans")}
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
            onClick={() => onSectionChange("messages")}
            data-testid="button-nav-messages"
          >
            <MessageCircle className="mr-3 h-4 w-4" />
            Messages
            <Badge variant="default" className="ml-auto text-xs">
              New
            </Badge>
          </Button>
          
          <Button
            variant={activeSection === "support" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSectionChange("support")}
            data-testid="button-nav-support"
          >
            <Headphones className="mr-3 h-4 w-4" />
            Support
          </Button>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full text-red-600 hover:bg-red-50 border-red-200"
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
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
