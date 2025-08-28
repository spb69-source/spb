import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { University } from "lucide-react";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
      ssn: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      dateOfBirth: new Date()
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      toast({
        title: "Account Created Successfully!",
        description: "Please wait for admin approval to access all features.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertUser) => {
    registerMutation.mutate(data);
  };

  const states = [
    { value: "AL", label: "Alabama" },
    { value: "CA", label: "California" },
    { value: "FL", label: "Florida" },
    { value: "NY", label: "New York" },
    { value: "TX", label: "Texas" },
    // Add more states as needed
  ];

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl" data-testid="card-sign-up">
        <CardHeader className="text-center">
          <div className="bg-primary text-primary-foreground p-3 rounded-full w-fit mx-auto mb-4">
            <University className="text-2xl" />
          </div>
          <CardTitle className="text-3xl text-primary" data-testid="text-sign-up-title">
            Create Your Account
          </CardTitle>
          <p className="text-muted-foreground" data-testid="text-sign-up-subtitle">
            Join Secure Professional Bank today
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...form.register("firstName")}
                  placeholder="John"
                  data-testid="input-first-name"
                />
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...form.register("lastName")}
                  placeholder="Doe"
                  data-testid="input-last-name"
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="john.doe@example.com"
                data-testid="input-email"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password">Password *</Label>
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
            
            <div>
              <Label htmlFor="ssn">Social Security Number (SSN) *</Label>
              <Input
                id="ssn"
                {...form.register("ssn")}
                placeholder="123-45-6789"
                pattern="[0-9]{3}-[0-9]{2}-[0-9]{4}"
                data-testid="input-ssn"
              />
              <p className="text-xs text-muted-foreground mt-1">Format: XXX-XX-XXXX</p>
              {form.formState.errors.ssn && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.ssn.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                {...form.register("phoneNumber")}
                placeholder="+1 (555) 123-4567"
                data-testid="input-phone"
              />
              {form.formState.errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="streetAddress">Street Address *</Label>
              <Input
                id="streetAddress"
                {...form.register("streetAddress")}
                placeholder="123 Main Street"
                data-testid="input-address"
              />
              {form.formState.errors.streetAddress && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.streetAddress.message}</p>
              )}
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...form.register("city")}
                  placeholder="New York"
                  data-testid="input-city"
                />
                {form.formState.errors.city && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.city.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Select onValueChange={(value) => form.setValue("state", value)}>
                  <SelectTrigger data-testid="select-state">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.state && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.state.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  {...form.register("zipCode")}
                  placeholder="10001"
                  pattern="[0-9]{5}"
                  data-testid="input-zip"
                />
                {form.formState.errors.zipCode && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.zipCode.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...form.register("dateOfBirth", { 
                  setValueAs: (value) => new Date(value) 
                })}
                data-testid="input-date-of-birth"
              />
              {form.formState.errors.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.dateOfBirth.message}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" required data-testid="checkbox-terms" />
              <Label htmlFor="terms" className="text-sm">
                I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </Label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={registerMutation.isPending}
              data-testid="button-create-account"
            >
              {registerMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                onClick={() => setLocation("/sign-in")}
                className="p-0"
                data-testid="button-go-sign-in"
              >
                Sign In
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
