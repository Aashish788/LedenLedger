import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeInput } from "@/lib/security";
import LendenLedgerIcon from "@/assets/LenDenledgericon1.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasToken, setHasToken] = useState(false);

  // Check for recovery token on mount
  useEffect(() => {
    const checkToken = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (type === 'recovery' && accessToken) {
        setHasToken(true);
      } else {
        // No valid token found
        toast.error("Invalid or expired link", {
          description: "Please request a new password reset link"
        });
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
      }
    };

    checkToken();
  }, [navigate]);

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 1) return { strength: 20, label: "Weak", color: "bg-destructive" };
    if (strength === 2) return { strength: 40, label: "Fair", color: "bg-orange-500" };
    if (strength === 3) return { strength: 60, label: "Good", color: "bg-yellow-500" };
    if (strength === 4) return { strength: 80, label: "Strong", color: "bg-blue-500" };
    return { strength: 100, label: "Very Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      newErrors.password = "Password must contain both uppercase and lowercase letters";
    } else if (!/\d/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!hasToken) {
      toast.error("Invalid session", {
        description: "Please request a new password reset link"
      });
      navigate('/forgot-password');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const sanitizedPassword = sanitizeInput(password);

      const { error } = await supabase.auth.updateUser({
        password: sanitizedPassword
      });

      if (error) {
        console.error("Password update error:", error);
        
        if (error.message.includes("same as the old password")) {
          setErrors({ password: "New password must be different from your old password" });
          toast.error("Password unchanged", {
            description: "Please choose a different password"
          });
        } else if (error.message.includes("expired")) {
          toast.error("Link expired", {
            description: "Please request a new password reset link"
          });
          setTimeout(() => {
            navigate('/forgot-password');
          }, 2000);
        } else {
          toast.error("Password reset failed", {
            description: error.message || "Please try again"
          });
        }
        return;
      }

      // Success!
      setIsSuccess(true);
      toast.success("Password updated successfully", {
        description: "You can now sign in with your new password"
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);

    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Something went wrong", {
        description: "Please try again later"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Reset Password Form */}
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
              {isSuccess ? "Password updated!" : "Set new password"}
            </h1>
            <p className="text-muted-foreground">
              {isSuccess 
                ? "Your password has been successfully updated."
                : "Please enter a strong password for your account."
              }
            </p>
          </div>

          {isSuccess ? (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-green-900 dark:text-green-100">
                      Password Changed
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      You can now sign in with your new password
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/login">
                <Button className="w-full h-11">
                  Continue to Login
                </Button>
              </Link>

              <p className="text-sm text-muted-foreground text-center">
                Redirecting to login page in 3 seconds...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({ ...errors, password: "" });
                    }}
                    required
                    className={`h-11 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className={`font-medium ${
                        passwordStrength.strength >= 80 ? 'text-green-600' :
                        passwordStrength.strength >= 60 ? 'text-blue-600' :
                        passwordStrength.strength >= 40 ? 'text-yellow-600' :
                        'text-orange-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors({ ...errors, confirmPassword: "" });
                    }}
                    required
                    className={`h-11 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Password requirements:</p>
                <ul className="space-y-1">
                  <li className={password.length >= 8 ? "text-green-600" : ""}>
                    • At least 8 characters long
                  </li>
                  <li className={/(?=.*[a-z])(?=.*[A-Z])/.test(password) ? "text-green-600" : ""}>
                    • Contains uppercase and lowercase letters
                  </li>
                  <li className={/\d/.test(password) ? "text-green-600" : ""}>
                    • Contains at least one number
                  </li>
                  <li className={/[^a-zA-Z\d]/.test(password) ? "text-green-600" : ""}>
                    • Contains a special character (recommended)
                  </li>
                </ul>
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
                    Updating password...
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Illustration/Info */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-8">
        <div className="max-w-md space-y-6 text-center">
          <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Secure Password Reset</h2>
          <p className="text-muted-foreground">
            Choose a strong password to keep your account secure. 
            We recommend using a mix of letters, numbers, and special characters.
          </p>
          <div className="space-y-3 text-sm text-muted-foreground text-left bg-background/50 rounded-lg p-6">
            <p className="font-medium text-foreground mb-2">Security Tips:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span>Use a unique password for this account</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span>Make it at least 12 characters long</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span>Include numbers and special characters</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span>Avoid common words and patterns</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
