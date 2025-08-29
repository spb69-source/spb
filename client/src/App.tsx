import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

import Landing from "@/pages/landing";
import SignUp from "@/pages/signup";
import SignIn from "@/pages/signin";
import AdminLogin from "@/pages/admin-login";
import UserDashboard from "@/pages/user-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/signup" component={SignUp} />
          <Route path="/signin" component={SignIn} />
          <Route path="/admin-login" component={AdminLogin} />
          <Route path="/admin" component={AdminLogin} />
        </>
      ) : isAdmin ? (
        <>
          <Route path="/" component={AdminDashboard} />
          <Route path="/admin/*" component={AdminDashboard} />
        </>
      ) : (
        <>
          <Route path="/" component={UserDashboard} />
          <Route path="/dashboard/*" component={UserDashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
