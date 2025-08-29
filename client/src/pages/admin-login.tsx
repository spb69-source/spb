import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { ShieldCheck, ArrowLeft, Eye, EyeOff, Mail, User, Lock, Crown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { adminLogin, isAdminLoginPending } = useAuth();
  const { toast } = useToast();

  const form = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginForm) => {
    try {
      await adminLogin(data);
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin dashboard.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Admin Login Failed",
        description: "Invalid admin credentials. Please check your details.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="w-full max-w-md mx-auto relative z-10">
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden" data-testid="card-admin-login">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 pointer-events-none"></div>
          
          <CardHeader className="text-center p-8 relative">
            <div className="bg-gradient-to-br from-red-600 to-orange-600 text-white p-4 rounded-2xl w-fit mx-auto mb-6 shadow-xl">
              <Crown className="h-10 w-10" />
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2" data-testid="text-admin-login-title">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg" data-testid="text-admin-login-subtitle">
              Secure administrative access
            </CardDescription>
            
            {/* Security Badge */}
            <div className="inline-flex items-center space-x-2 bg-red-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-red-500/30 mt-4">
              <ShieldCheck className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-200">Restricted Access</span>
            </div>
          </CardHeader>
          
          <CardContent className="p-8 pt-0 relative">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200 font-semibold">Admin Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input 
                            placeholder="Admin Username" 
                            className="pl-12 h-12 border-white/20 focus:border-red-500 focus:ring-red-500 rounded-xl bg-white/10 text-white placeholder-gray-400"
                            data-testid="input-username"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200 font-semibold">Admin Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input 
                            type="email" 
                            placeholder="admin@spb.com" 
                            className="pl-12 h-12 border-white/20 focus:border-red-500 focus:ring-red-500 rounded-xl bg-white/10 text-white placeholder-gray-400"
                            data-testid="input-email"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200 font-semibold">Admin Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            className="pl-12 pr-12 h-12 border-white/20 focus:border-red-500 focus:ring-red-500 rounded-xl bg-white/10 text-white placeholder-gray-400"
                            data-testid="input-password"
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 group" 
                  disabled={isAdminLoginPending}
                  data-testid="button-admin-login"
                >
                  {isAdminLoginPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Crown className="h-5 w-5" />
                      <span>Admin Login</span>
                    </div>
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-8 space-y-4">
              <div className="text-center">
                <Link href="/signin" className="text-gray-300 hover:text-white transition-colors group flex items-center justify-center space-x-2" data-testid="link-back-to-signin">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Back to User Login</span>
                </Link>
              </div>
              
              {/* Security Notice */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-red-200 text-sm">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="font-medium">This area is restricted to authorized administrators only.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}