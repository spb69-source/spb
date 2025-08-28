import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { loginSchema, type LoginUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { University, Settings } from "lucide-react";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<LoginUser>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (userData: LoginUser) => {
      const response = await apiRequest("POST", "/api/auth/login", userData);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      toast({
        title: "Welcome Back!",
        description: "Successfully signed in to your account.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Sign In Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginUser) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md" data-testid="card-sign-in">
        <CardHeader className="text-center">
          <div className="bg-primary text-primary-foreground p-3 rounded-full w-fit mx-auto mb-4">
            <University className="text-2xl" />
          </div>
          <CardTitle className="text-3xl text-primary" data-testid="text-sign-in-title">
            Welcome Back
          </CardTitle>
          <p className="text-muted-foreground" data-testid="text-sign-in-subtitle">
            Sign in to your account
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="your.email@example.com"
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
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" data-testid="checkbox-remember" />
                <Label htmlFor="remember" className="text-sm">Remember me</Label>
              </div>
              <Button variant="link" className="p-0" data-testid="button-forgot-password">
                Forgot password?
              </Button>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loginMutation.isPending}
              data-testid="button-sign-in"
            >
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Button
                variant="link"
                onClick={() => setLocation("/sign-up")}
                className="p-0"
                data-testid="button-create-account"
              >
                Create Account
              </Button>
            </p>
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="link"
                onClick={() => setLocation("/admin-login")}
                className="text-sm text-muted-foreground hover:text-primary"
                data-testid="button-admin-login"
              >
                <Settings className="mr-1 h-4 w-4" />
                Admin Login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
