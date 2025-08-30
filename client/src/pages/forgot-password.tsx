import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Shield, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const { toast } = useToast();

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/forgot-password", data);
      const result = await response.json();
      
      if (response.ok) {
        setResetSent(true);
        setResetLink(result.resetLink);
        toast({
          title: "Reset Link Generated",
          description: "Your password reset link has been generated. Please use the link below.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to send reset link",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          <CardHeader className="text-center p-8">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white p-4 rounded-2xl w-fit mx-auto mb-6 shadow-xl">
              <Mail className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Reset Link Generated</CardTitle>
            <CardDescription className="text-gray-600">
              Use the link below to reset your password
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 pt-0">
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Click this link to reset your password:</p>
                <a 
                  href={resetLink}
                  className="text-blue-600 hover:text-blue-700 font-medium break-all"
                  onClick={(e) => {
                    e.preventDefault();
                    setLocation(resetLink.replace(window.location.origin, ''));
                  }}
                >
                  {resetLink}
                </a>
              </div>
              
              <Button 
                onClick={() => {
                  setLocation(resetLink.replace(window.location.origin, ''));
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Reset Password Now
              </Button>
              
              <div className="text-center">
                <Link href="/signin" className="text-gray-600 hover:text-gray-800 font-medium">
                  ← Back to Sign In
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
        <CardHeader className="text-center p-8">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-4 rounded-2xl w-fit mx-auto mb-6 shadow-xl">
            <Shield className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Forgot Password</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email address and we'll help you reset your password
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input 
                          type="email" 
                          placeholder="your.email@example.com" 
                          className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white/50"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 group" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Send Reset Link</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-8 text-center">
            <Link href="/signin" className="text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}