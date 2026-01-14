import { useState } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, KeyRound, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/forgot-password", { email });
      const data = await response.json();
      
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
      
      setIsSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset link. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md">
            <Card>
              <CardHeader className="text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-accent/10 p-3 mx-auto">
                  <KeyRound className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="font-serif text-3xl">
                  {isSubmitted ? "Check Your Email" : "Forgot Password"}
                </CardTitle>
                <CardDescription>
                  {isSubmitted
                    ? "We've sent you instructions to reset your password"
                    : "Enter your email address and we'll send you a reset link"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                        <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <p className="text-center text-muted-foreground">
                      If an account exists for <strong>{email}</strong>, you will receive an email with instructions.
                    </p>
                    
                    {resetToken && (
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">For demo purposes, use this link:</p>
                        <Link 
                          href={`/reset-password?token=${resetToken}`}
                          className="text-accent hover:underline text-sm break-all"
                        >
                          Click here to reset your password
                        </Link>
                      </div>
                    )}
                    
                    <div className="text-center space-y-4">
                      <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
                        Try another email
                      </Button>
                      <Link href="/login" className="text-sm text-accent hover:underline block">
                        Back to Sign In
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          data-testid="input-email"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading} data-testid="button-submit">
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <div className="text-center">
                      <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sign In
                      </Link>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
