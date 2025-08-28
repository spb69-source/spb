import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, PieChart, Users, CheckCircle, MessageCircle, ArrowLeftRight, Shield, Settings, LogOut } from "lucide-react";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export default function AdminSidebar({ 
  activeSection, 
  onSectionChange, 
  isOpen, 
  onToggle, 
  onLogout 
}: AdminSidebarProps) {
  return (
    <>
      {/* Admin Sidebar */}
      <aside 
        className={`bg-gray-900 text-white w-64 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
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
            onClick={() => onSectionChange("dashboard")}
            data-testid="button-nav-dashboard"
          >
            <PieChart className="mr-3 h-4 w-4" />
            Dashboard
          </Button>
          
          <Button
            variant={activeSection === "users" ? "secondary" : "ghost"}
            className="w-full justify-start text-white hover:bg-gray-800 relative"
            onClick={() => onSectionChange("users")}
            data-testid="button-nav-users"
          >
            <Users className="mr-3 h-4 w-4" />
            User Management
            <Badge variant="destructive" className="ml-auto text-xs">
              New
            </Badge>
          </Button>
          
          <Button
            variant={activeSection === "approvals" ? "secondary" : "ghost"}
            className="w-full justify-start text-white hover:bg-gray-800 relative"
            onClick={() => onSectionChange("approvals")}
            data-testid="button-nav-approvals"
          >
            <CheckCircle className="mr-3 h-4 w-4" />
            Approvals
            <Badge variant="default" className="ml-auto text-xs bg-amber-500">
              3
            </Badge>
          </Button>
          
          <Button
            variant={activeSection === "messages" ? "secondary" : "ghost"}
            className="w-full justify-start text-white hover:bg-gray-800 relative"
            onClick={() => onSectionChange("messages")}
            data-testid="button-nav-messages"
          >
            <MessageCircle className="mr-3 h-4 w-4" />
            Messages
            <Badge variant="default" className="ml-auto text-xs bg-blue-500">
              7
            </Badge>
          </Button>
          
          <Button
            variant={activeSection === "transactions" ? "secondary" : "ghost"}
            className="w-full justify-start text-white hover:bg-gray-800"
            onClick={() => onSectionChange("transactions")}
            data-testid="button-nav-transactions"
          >
            <ArrowLeftRight className="mr-3 h-4 w-4" />
            Transactions
          </Button>
          
          <Button
            variant={activeSection === "security" ? "secondary" : "ghost"}
            className="w-full justify-start text-white hover:bg-gray-800"
            onClick={() => onSectionChange("security")}
            data-testid="button-nav-security"
          >
            <Shield className="mr-3 h-4 w-4" />
            Security
          </Button>
          
          <Button
            variant={activeSection === "settings" ? "secondary" : "ghost"}
            className="w-full justify-start text-white hover:bg-gray-800"
            onClick={() => onSectionChange("settings")}
            data-testid="button-nav-settings"
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Button>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full text-red-400 hover:bg-red-900 border-red-400"
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
