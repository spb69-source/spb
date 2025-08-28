import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { adminLoginSchema, type AdminLogin } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<AdminLogin>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      email: "",
      password: ""
    }
  });

  const adminLoginMutation = useMutation({
    mutationFn: async (adminData: AdminLogin) => {
      const response = await apiRequest("POST", "/api/auth/admin-login", adminData);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin dashboard.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Admin Login Failed",
        description: error.message || "Invalid admin credentials.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdminLogin) => {
    adminLoginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md" data-testid="card-admin-login">
        <CardHeader className="text-center">
          <div className="bg-red-600 text-white p-3 rounded-full w-fit mx-auto mb-4">
            <ShieldCheck className="text-2xl" />
          </div>
          <CardTitle className="text-3xl text-gray-900" data-testid="text-admin-login-title">
            Admin Access
          </CardTitle>
          <p className="text-muted-foreground" data-testid="text-admin-login-subtitle">
            Secure administrative login
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...form.register("username")}
                placeholder="Admin Username"
                data-testid="input-username"
              />
              {form.formState.errors.username && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.username.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="admin@domain.com"
                data-testid="input-email"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                placeholder="••••••••"
                data-testid="input-password"
              />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={adminLoginMutation.isPending}
              data-testid="button-admin-login"
            >
              {adminLoginMutation.isPending ? "Logging In..." : "Admin Login"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => setLocation("/sign-in")}
              className="text-sm text-muted-foreground hover:text-primary"
              data-testid="button-back-to-login"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to User Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
