import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeInput, checkRateLimit } from "@/lib/security";
import LendenLedgerIcon from "@/assets/LenDenledgericon1.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    // Rate limiting check
    if (!checkRateLimit('password-reset', 3, 300000)) { // 3 attempts per 5 minutes
      toast.error("Too many attempts", {
        description: "Please wait 5 minutes before trying again"
      });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
      
      // Get the current origin for redirect
      const origin = window.location.origin.replace(/\/$/, '');
      const redirectTo = `${origin}/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        sanitizedEmail,
        {
          redirectTo: redirectTo,
        }
      );

      if (resetError) {
        console.error("Password reset error:", resetError);
        
        // Don't reveal if email exists for security
        // Still show success to prevent email enumeration
        setIsSuccess(true);
        toast.success("Check your email", {
          description: "If an account exists, you'll receive reset instructions"
        });
      } else {
        setIsSuccess(true);
        toast.success("Check your email", {
          description: "We've sent you password reset instructions"
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error("Something went wrong", {
        description: "Please try again later"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    // Reset success state and trigger submit again
    setIsSuccess(false);
    const form = document.querySelector("form") as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
            
            <div className="flex items-center gap-2 mb-2">
              <img 
                src={LendenLedgerIcon} 
                alt="Lenden Ledger" 
                className="h-11 w-11 rounded-lg"
              />
              <span className="text-2xl font-bold">Lenden Ledger</span>
            </div>
            
            <h1 className="text-3xl font-bold mt-6 mb-2">
              {isSuccess ? "Check your email" : "Forgot password?"}
            </h1>
            <p className="text-muted-foreground">
              {isSuccess 
                ? "We've sent you an email with instructions to reset your password."
                : "No worries, we'll send you reset instructions."
              }
            </p>
          </div>

          {isSuccess ? (
            <div className="space-y-6">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Email sent</h3>
                    <p className="text-sm text-muted-foreground">
                      Check your inbox and spam folder
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Sent to: <strong className="text-foreground">{email}</strong></span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResend}
                  variant="outline"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  Resend email
                </Button>
                
                <Link to="/login" className="block">
                  <Button variant="ghost" className="w-full h-11">
                    Return to login
                  </Button>
                </Link>
              </div>

              <div className="text-sm text-muted-foreground text-center">
                <p>Didn't receive the email?</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Check your spam/junk folder</li>
                  <li>• Make sure the email address is correct</li>
                  <li>• Wait a few minutes and try again</li>
                </ul>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                  className={`h-11 ${error ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>

              <div className="text-center">
                <Link 
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Remember your password? <span className="text-primary font-medium">Sign in</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Illustration/Info */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-8">
        <div className="max-w-md space-y-6 text-center">
          <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Password Reset</h2>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password. 
            The link will be valid for 1 hour.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground text-left bg-background/50 rounded-lg p-6">
            <p className="font-medium text-foreground mb-2">What happens next?</p>
            <ol className="space-y-2 list-decimal list-inside">
              <li>You'll receive an email with a secure link</li>
              <li>Click the link to open the password reset page</li>
              <li>Enter and confirm your new password</li>
              <li>Sign in with your new credentials</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
