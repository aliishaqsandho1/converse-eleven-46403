import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Lock, Unlock, Shield, AlertTriangle, Clock, Zap, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { verifyPin } from "@/utils/pin";

interface PincodeProtectionProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  onAccessGranted?: () => void;
}

// Default PIN handled via utils/pin.ts
const STORAGE_KEY = "pincode_access";
const TEMP_UNLOCK_KEY = "temp_unlock_until";
const UNLOCK_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export const PincodeProtection: React.FC<PincodeProtectionProps> = ({
  children,
  title,
  description,
  onAccessGranted
}) => {
  const { toast } = useToast();
  const [pin, setPin] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTempUnlocked, setIsTempUnlocked] = useState(false);
  const [tempUnlockTimeLeft, setTempUnlockTimeLeft] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [temporalRequested, setTemporalRequested] = useState(false);
  const [authorizedPath, setAuthorizedPath] = useState<string | null>(null);
  const location = useLocation();

  // Check for existing access on component mount
  useEffect(() => {
    // Check for temporary unlock
    const tempUnlockUntil = localStorage.getItem(TEMP_UNLOCK_KEY);
    if (tempUnlockUntil) {
      const unlockTime = parseInt(tempUnlockUntil);
      const now = Date.now();
      if (now < unlockTime) {
        setIsTempUnlocked(true);
        setTempUnlockTimeLeft(Math.ceil((unlockTime - now) / 1000));
      } else {
        localStorage.removeItem(TEMP_UNLOCK_KEY);
      }
    }
    
    // Start animation
    setShowAnimation(true);
  }, []);

  // Handle lockout timer
  useEffect(() => {
    if (isLocked && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLocked && timeLeft === 0) {
      setIsLocked(false);
      setAttempts(0);
    }
  }, [isLocked, timeLeft]);

  // Handle temporary unlock timer
  useEffect(() => {
    if (isTempUnlocked && tempUnlockTimeLeft > 0) {
      const timer = setTimeout(() => {
        setTempUnlockTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setIsTempUnlocked(false);
            localStorage.removeItem(TEMP_UNLOCK_KEY);
            toast({
              title: "Temporary Access Expired",
              description: "1-hour access period has ended",
              variant: "destructive"
            });
          }
          return newTime;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTempUnlocked, tempUnlockTimeLeft, toast]);

  // Revoke session-only access on route change
  useEffect(() => {
    if (isAuthorized && authorizedPath && location.pathname !== authorizedPath) {
      setIsAuthorized(false);
      setAuthorizedPath(null);
      toast({
        title: "Session Access Ended",
        description: "Page changed, access revoked.",
      });
    }
  }, [location.pathname, isAuthorized, authorizedPath, toast]);

  const handlePinSubmit = async () => {
    if (isLocked) return;

    const valid = await verifyPin(pin);
    if (valid) {
      setAttempts(0);
      setPin("");

      if (temporalRequested) {
        const unlockUntil = Date.now() + UNLOCK_DURATION;
        localStorage.setItem(TEMP_UNLOCK_KEY, unlockUntil.toString());
        setIsTempUnlocked(true);
        setTempUnlockTimeLeft(Math.ceil(UNLOCK_DURATION / 1000));
        setTemporalRequested(false);
        toast({
          title: "Temporary Access Activated",
          description: "All pages unlocked for 1 hour",
        });
      } else {
        setIsAuthorized(true);
        setAuthorizedPath(location.pathname);
        toast({
          title: "Access Granted",
          description: "Valid until you change the page",
        });
      }

      if (onAccessGranted) {
        onAccessGranted();
      }
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin("");

      if (newAttempts >= 3) {
        setIsLocked(true);
        setTimeLeft(300); // 5 minutes lockout
        toast({
          title: "Access Denied",
          description: "Too many failed attempts. Locked for 5 minutes.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Incorrect PIN",
          description: `${3 - newAttempts} attempts remaining`,
          variant: "destructive"
        });
      }
    }
  };

  const handleTempUnlock = () => {
    if (isLocked) return;
    setTemporalRequested(true);
    toast({
      title: "Temporal Access Requested",
      description: "Enter PIN to activate 1-hour access",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePinSubmit();
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setIsTempUnlocked(false);
    setTemporalRequested(false);
    setAuthorizedPath(null);
    setPin("");
    localStorage.removeItem(TEMP_UNLOCK_KEY);
    toast({
      title: "Access Revoked",
      description: "All pages have been locked",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHourTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  if (isAuthorized || isTempUnlocked) {
    return (
      <div className="relative">
        {/* Protected Content */}
        {children}
        
        {/* Floating Lock Button */}
        <Button
          onClick={handleLogout}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 p-0"
          title={isTempUnlocked ? `Lock (${formatHourTime(tempUnlockTimeLeft)} remaining)` : "Lock Access"}
        >
          <Lock className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20 dark:opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }}></div>
      </div>

      {/* Rotating Circular Bars */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute w-[600px] h-[600px] border-4 border-primary/40 rounded-full animate-spin" style={{ animationDuration: '20s' }}>
          <div className="absolute top-0 left-1/2 w-3 h-12 bg-primary rounded-full transform -translate-x-1/2 -translate-y-4"></div>
          <div className="absolute bottom-0 left-1/2 w-3 h-12 bg-primary rounded-full transform -translate-x-1/2 translate-y-4"></div>
          <div className="absolute left-0 top-1/2 w-12 h-3 bg-primary rounded-full transform -translate-y-1/2 -translate-x-4"></div>
          <div className="absolute right-0 top-1/2 w-12 h-3 bg-primary rounded-full transform -translate-y-1/2 translate-x-4"></div>
        </div>

        {/* Middle Ring */}
        <div className="absolute w-[500px] h-[500px] border-2 border-primary/50 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
          <div className="absolute top-4 left-1/2 w-2 h-8 bg-primary rounded-full transform -translate-x-1/2"></div>
          <div className="absolute bottom-4 left-1/2 w-2 h-8 bg-primary rounded-full transform -translate-x-1/2"></div>
          <div className="absolute left-4 top-1/2 w-8 h-2 bg-primary rounded-full transform -translate-y-1/2"></div>
          <div className="absolute right-4 top-1/2 w-8 h-2 bg-primary rounded-full transform -translate-y-1/2"></div>
        </div>

        {/* Inner Ring */}
        <div className="absolute w-[400px] h-[400px] border border-primary/60 rounded-full animate-spin" style={{ animationDuration: '10s' }}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-6 bg-primary rounded-full"
              style={{
                top: '15px',
                left: '50%',
                transformOrigin: '50% 185px',
                transform: `translateX(-50%) rotate(${i * 45}deg)`
              }}
            />
          ))}
        </div>

        {/* Pulse Rings */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 border border-primary/20 rounded-full animate-ping"
            style={{
              animationDelay: `${i * 0.5}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>

      {/* Scanning Lines */}
      <div className="absolute inset-0">
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse opacity-60" style={{
          top: '20%',
          animation: 'scan-vertical 4s ease-in-out infinite'
        }}></div>
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse opacity-40" style={{
          top: '60%',
          animation: 'scan-vertical 4s ease-in-out infinite',
          animationDelay: '2s'
        }}></div>
        <div className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse opacity-30" style={{
          left: '30%',
          animation: 'scan-horizontal 6s ease-in-out infinite'
        }}></div>
      </div>

      {/* Central Interface */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className={`transition-all duration-1500 ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          
          {/* Central Security Interface */}
          <div className="relative">
            {/* Holographic Frame */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary/10 to-primary/10 rounded-2xl blur-xl animate-pulse"></div>
            
            <Card className="relative backdrop-blur-xl bg-card/80 border border-primary/30 shadow-2xl shadow-primary/20 rounded-2xl overflow-hidden max-w-md mx-auto">
              {/* Tech Frame */}
              <div className="absolute inset-0 border border-primary/20 rounded-2xl"></div>
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-2xl"></div>

              <CardContent className="p-8 space-y-8">
                {/* Central Security Logo */}
                <div className="text-center space-y-3">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-50 animate-pulse"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg shadow-primary/50">
                      <Shield className="w-10 h-10 text-primary-foreground animate-pulse" />
                      <div className="absolute inset-0 border-2 border-primary-foreground/30 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground tracking-wider">
                    USMAN HARDWARES
                  </h2>
                </div>

                {/* Matrix-style PIN Input */}
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={7}
                      value={pin}
                      onChange={(value) => setPin(value)}
                      onComplete={handlePinSubmit}
                      disabled={isLocked}
                    >
                      <InputOTPGroup className="gap-2 sm:gap-3">
                        {[...Array(7)].map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className="w-10 h-12 sm:w-12 sm:h-12 text-lg sm:text-xl font-mono font-bold border-2 border-primary/40 bg-background/60 text-primary focus:border-primary focus:ring-2 focus:ring-primary/30 focus:bg-background/80 transition-all duration-300 rounded-lg backdrop-blur-sm shadow-lg shadow-primary/20"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {/* Biometric Scanner Effect */}
                  <div className="flex justify-center">
                    <div className="relative w-32 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-primary to-primary/80 rounded-full animate-pulse" style={{
                        animation: 'scanner 2s ease-in-out infinite'
                      }}></div>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {isLocked && (
                    <div className="text-center p-4 bg-red-900/30 border border-red-500/50 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center justify-center gap-2 text-red-400">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                        <span className="font-mono text-lg">
                          SYSTEM LOCKED: {formatTime(timeLeft)}
                        </span>
                      </div>
                    </div>
                  )}

                  {attempts > 0 && !isLocked && (
                    <div className="text-center p-4 bg-orange-900/30 border border-orange-500/50 rounded-lg backdrop-blur-sm">
                      <span className="text-orange-400 font-mono text-lg">
                        ATTEMPTS REMAINING: {3 - attempts}
                      </span>
                    </div>
                  )}

                  {/* Futuristic Action Buttons */}
                  <div className="space-y-4">
                    {/* Temporal Access Button */}
                    {!isTempUnlocked && (
                      <Button
                        onClick={handleTempUnlock}
                        title="Press before entering PIN for 1-hour access"
                        className="w-full h-14 bg-gradient-to-r from-primary/50 to-primary/70 hover:from-primary/70 hover:to-primary/90 text-primary-foreground font-mono font-bold text-lg border-2 border-primary/40 hover:border-primary/60 transition-all duration-300 rounded-lg backdrop-blur-sm relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent -skew-x-12 translate-x-full transition-transform duration-700 group-hover:translate-x-0"></div>
                        <div className="flex items-center gap-3 relative z-10">
                          <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                          <Zap className="w-5 h-5 animate-pulse" />
                          <span>TEMPORAL ACCESS [1H]</span>
                        </div>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PincodeProtection;