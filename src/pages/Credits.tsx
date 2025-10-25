import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CreditCard, Search, Plus, Users, AlertCircle, Phone, Mail, MapPin, DollarSign, History, MessageCircle, RefreshCw, Check, ChevronsUpDown, Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { customersApi } from "@/services/api";
import { useCustomerBalance } from "@/hooks/useCustomerBalance";
import { format } from "date-fns";
import { GeminiService } from "@/services/geminiApi";

const Credits = () => {
  const { toast } = useToast();
  const { getCustomerBalance, recordManualPayment, getTransactionHistory, syncAllCustomerBalances } = useCustomerBalance();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all");
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customersWithCredits, setCustomersWithCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceivableModalOpen, setIsReceivableModalOpen] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isAddCreditToExistingOpen, setIsAddCreditToExistingOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [voiceEditedMessage, setVoiceEditedMessage] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const fetchAllCustomers = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch ALL customers (increased limit to get all customers)
      const response = await customersApi.getAll({
        limit: 10000,
        page: 1,
        status: 'active'
      });
      
      if (response.success) {
        const allCustomers = response.data?.customers || [];
        setCustomers(allCustomers);
        
        // Include any non-zero balances (negative = due, positive = advance)
        const withCredits = allCustomers.filter((c: any) => (c.currentBalance ?? 0) !== 0);
        setCustomersWithCredits(withCredits);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllCustomers();
  }, [fetchAllCustomers]);

  const handleAddCustomer = async (formData: any) => {
    try {
      const response = await customersApi.create(formData);
      
      if (response.success) {
        // If there's an initial credit, add it
        if (formData.initialCredit && formData.initialCredit > 0) {
          await recordManualPayment(
            response.data.id,
            -formData.initialCredit, // Negative to increase balance
            'credit',
            undefined,
            'Initial credit balance'
          );
        }
        
        setIsAddCustomerOpen(false);
        fetchAllCustomers();
        toast({
          title: "Customer Added",
          description: `${formData.name} has been added successfully${formData.initialCredit ? ' with initial credit' : ''}.`,
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add customer",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to add customer:', error);
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive"
      });
    }
  };

  const handleAddCreditToExisting = async (customerId: number, amount: number) => {
    try {
      await recordManualPayment(customerId, -amount, 'credit', undefined, 'Manual credit added');
      fetchAllCustomers();
      setIsAddCreditToExistingOpen(false);
    } catch (error) {
      console.error('Failed to add credit:', error);
    }
  };

  const handleRecordPayment = async (customerId: number, amount: number, method: string, reference?: string) => {
    try {
      await recordManualPayment(customerId, amount, method, reference);
      fetchAllCustomers();
      setIsPaymentModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Failed to record payment:', error);
    }
  };

  const handleRecordReceivable = async (customerId: number, amount: number, reason: string, reference?: string) => {
    try {
      // Record as negative payment to increase balance
      await recordManualPayment(customerId, -amount, 'credit', reference, reason);
      fetchAllCustomers();
      setIsReceivableModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Failed to record receivable:', error);
    }
  };

  const handleViewHistory = async (customer: any) => {
    try {
      setSelectedCustomer(customer);
      const history = await getTransactionHistory(customer.id, 50, 0);
      setTransactions(history);
      setIsTransactionHistoryOpen(true);
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
    }
  };

  const handleSyncBalances = async () => {
    try {
      setIsSyncing(true);
      await syncAllCustomerBalances();
      await fetchAllCustomers();
    } catch (error) {
      console.error('Failed to sync balances:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSendMessage = async (customer: any) => {
    setSelectedCustomer(customer);
    setIsTranslating(true);
    setIsMessageModalOpen(true);
    setShowPreview(false);
    setVoiceEditedMessage("");
    
    try {
      // Only translate customer name to Urdu
      const urduName = await GeminiService.translateToUrdu(customer.name);
      // Pre-written Urdu message template
      const defaultMessage = `محترم ${urduName}،\n\nآپ کا بقایا PKR ${Math.abs(customer.currentBalance || 0).toLocaleString()} ہے۔ براہ کرم جلد از جلد ادائیگی کر دیں۔\n\nآپ کا شکریہ،\n${await GeminiService.translateToUrdu("Management")}`;
      setMessageText(defaultMessage);
    } catch (error) {
      console.error('Translation error:', error);
      const defaultMessage = `محترم ${customer.name}،\n\nآپ کا بقایا PKR ${Math.abs(customer.currentBalance || 0).toLocaleString()} ہے۔ براہ کرم جلد از جلد ادائیگی کر دیں۔\n\nآپ کا شکریہ`;
      setMessageText(defaultMessage);
      toast({
        title: "Translation Failed",
        description: "Using default message template",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!selectedCustomer?.phone) {
      toast({
        title: "No Phone Number",
        description: "Customer doesn't have a phone number registered.",
        variant: "destructive"
      });
      return;
    }

    const phone = selectedCustomer.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(messageText);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    setIsMessageModalOpen(false);
    setSelectedCustomer(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsTranslating(true);
    try {
      // Use Web Speech API for transcription
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'ur-PK';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        
        // Send current message + voice input to Gemini for editing
        const editPrompt = `Current message in Urdu:\n${messageText}\n\nUser wants to edit it with this voice instruction: "${transcript}"\n\nPlease provide the edited Urdu message based on the user's instruction. Only return the final message in proper Urdu, nothing else.`;
        
        const editedMessage = await GeminiService.convertToProperUrdu(editPrompt);
        setVoiceEditedMessage(editedMessage);
        setShowPreview(true);
        
        toast({
          title: "Voice Edit Ready",
          description: "Please review the edited message",
        });
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Recognition Error",
          description: "Could not understand speech. Please try again",
          variant: "destructive"
        });
      };

      recognition.start();
    } catch (error) {
      console.error('Audio processing error:', error);
      toast({
        title: "Processing Error",
        description: "Could not process audio",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleApproveEdit = () => {
    setMessageText(voiceEditedMessage);
    setShowPreview(false);
    setVoiceEditedMessage("");
    toast({
      title: "Message Updated",
      description: "Voice edit has been applied successfully",
    });
  };

  const handleRejectEdit = () => {
    setShowPreview(false);
    setVoiceEditedMessage("");
  };

  // Filter logic
  const filteredCustomers = customersWithCredits.filter(customer => {
    const matchesSearch = !searchTerm || 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCustomer = selectedCustomerId === "all" || customer.id.toString() === selectedCustomerId;
    
    return matchesSearch && matchesCustomer;
  });

  const totalCredits = customersWithCredits
    .filter(c => (c.currentBalance || 0) < 0)
    .reduce((sum, c) => sum + Math.abs(c.currentBalance || 0), 0);

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6 min-h-screen bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading credits...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-4 min-h-[calc(100vh-65px)] bg-background">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Credits</h1>
          <p className="text-muted-foreground">Manage and track customer outstanding balances</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddCreditToExistingOpen} onOpenChange={setIsAddCreditToExistingOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Credit to Existing
              </Button>
            </DialogTrigger>
            <AddCreditToExistingDialog 
              customers={customers}
              onSubmit={handleAddCreditToExisting}
              onClose={() => setIsAddCreditToExistingOpen(false)}
            />
          </Dialog>
          <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add New Customer
              </Button>
            </DialogTrigger>
            <CustomerDialog onSubmit={handleAddCustomer} onClose={() => setIsAddCustomerOpen(false)} />
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold text-red-600">PKR {totalCredits.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Customers with Credits</p>
                <p className="text-2xl font-bold text-orange-600">{customersWithCredits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Average Credit</p>
                <p className="text-2xl font-bold text-blue-600">
                  PKR {customersWithCredits.length > 0 ? Math.round(totalCredits / customersWithCredits.length).toLocaleString() : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customersWithCredits.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No customers with credits found</p>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">{customer.name}</h3>
                        <Badge variant={customer.type === "Permanent" ? "default" : "secondary"} className="shrink-0">
                          {customer.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm text-muted-foreground">Outstanding</p>
                      <p className={`text-lg font-bold ${ (customer.currentBalance || 0) < 0 ? 'text-red-600' : 'text-green-600' }`}>
                        PKR {Math.abs(customer.currentBalance || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                      onClick={() => handleSendMessage(customer)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsPaymentModalOpen(true);
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Payment
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsReceivableModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Credit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewHistory(customer)}
                    >
                      <History className="h-4 w-4 mr-1" />
                      History
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedCustomer && (
        <>
          <PaymentModal
            customer={selectedCustomer}
            open={isPaymentModalOpen}
            onOpenChange={setIsPaymentModalOpen}
            onSubmit={handleRecordPayment}
          />
          <ReceivableModal
            customer={selectedCustomer}
            open={isReceivableModalOpen}
            onOpenChange={setIsReceivableModalOpen}
            onSubmit={handleRecordReceivable}
          />
          <TransactionHistoryModal
            customer={selectedCustomer}
            transactions={transactions}
            open={isTransactionHistoryOpen}
            onOpenChange={setIsTransactionHistoryOpen}
          />
        </>
      )}

      {/* WhatsApp Message Modal */}
      <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <span>Send WhatsApp Message</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-2">
            {/* Customer Info Card */}
            {selectedCustomer && (
              <div className="p-5 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-xl border-2 border-primary/20 space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-primary/20">
                  <span className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">Customer Details</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground font-medium">Name</span>
                    <p className="font-bold text-base text-foreground">{selectedCustomer.name}</p>
                  </div>
                  {selectedCustomer.phone && (
                    <div className="space-y-1.5">
                      <span className="text-xs text-muted-foreground font-medium">Phone</span>
                      <p className="font-bold text-base text-foreground">{selectedCustomer.phone}</p>
                    </div>
                  )}
                </div>
                <div className="pt-3 border-t border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">Outstanding Balance</span>
                    <span className="text-2xl font-bold text-red-600">PKR {Math.abs(selectedCustomer.currentBalance || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Message Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="message" className="text-base font-semibold">Message (Urdu)</Label>
                <Button
                  type="button"
                  size="default"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranslating}
                  className={cn(
                    "h-10 px-4 gap-2 transition-all font-medium",
                    isRecording && "animate-pulse"
                  )}
                >
                  {isRecording ? (
                    <>
                      <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                      Stop Recording
                    </>
                  ) : isTranslating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      Voice Edit
                    </>
                  )}
                </Button>
              </div>
              
              <Textarea
                id="message"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={8}
                className="resize-none font-urdu text-lg leading-relaxed border-2 focus:border-primary/50 shadow-sm"
                placeholder="Your message will appear here in Urdu..."
                disabled={isTranslating}
                dir="rtl"
              />
              
              <div className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-muted/40 rounded-lg border">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  {isTranslating 
                    ? "Translating customer name to Urdu..." 
                    : "Click 'Voice Edit' to record instructions for modifying the message. Speak your changes and approve them."}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button 
                variant="outline"
                size="lg"
                onClick={() => {
                  setIsMessageModalOpen(false);
                  setMessageText("");
                  setShowPreview(false);
                  setVoiceEditedMessage("");
                }}
                disabled={isTranslating}
              >
                Cancel
              </Button>
              <Button 
                size="lg"
                className="bg-green-600 hover:bg-green-700 gap-2 font-semibold"
                onClick={handleSendWhatsApp}
                disabled={isTranslating || !messageText.trim()}
              >
                <MessageCircle className="h-5 w-5" />
                Send on WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Voice Edit Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                <Mic className="h-6 w-6 text-blue-600" />
              </div>
              <span>Review Voice Edited Message</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 mt-2">
            {/* Original Message */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">Original Message</Label>
              <div className="p-4 bg-muted/40 rounded-xl border-2 font-urdu text-base leading-relaxed shadow-sm" dir="rtl">
                {messageText}
              </div>
            </div>

            {/* Edited Message */}
            <div className="space-y-2">
              <Label className="text-sm text-green-600 font-semibold uppercase tracking-wide flex items-center gap-2">
                <Check className="h-4 w-4" />
                Edited Message (Preview)
              </Label>
              <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-950/20 rounded-xl border-2 border-green-300 dark:border-green-800 font-urdu text-base leading-relaxed shadow-md" dir="rtl">
                {voiceEditedMessage}
              </div>
            </div>

            {/* Preview Actions */}
            <div className="flex items-center justify-end pt-4 gap-3 border-t">
              <Button 
                variant="outline"
                size="lg"
                onClick={handleRejectEdit}
              >
                Reject Changes
              </Button>
              <Button 
                onClick={handleApproveEdit}
                size="lg"
                className="bg-green-600 hover:bg-green-700 gap-2 font-semibold"
              >
                <Check className="h-5 w-5" />
                Approve & Use This Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Customer Dialog Component - Simplified to 3 fields only
const CustomerDialog = ({ onSubmit, onClose }: { onSubmit: (data: any) => void; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: "", 
    phone: "+92", 
    initialCredit: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }
    
    if (!formData.phone.trim() || formData.phone.trim() === "+92") {
      return;
    }
    
    onSubmit({
      name: formData.name,
      phone: formData.phone,
      type: "Temporary",
      creditLimit: 0,
      initialCredit: parseFloat(formData.initialCredit) || 0
    });
    setFormData({ name: "", phone: "+92", initialCredit: "" });
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add New Customer</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Customer Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Enter customer name"
            required
            autoFocus
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value;
              if (!value.startsWith("+92")) {
                setFormData({...formData, phone: "+92"});
              } else {
                setFormData({...formData, phone: value});
              }
            }}
            placeholder="+92XXXXXXXXXX"
            required
          />
        </div>

        <div>
          <Label htmlFor="initialCredit">Initial Credit Amount</Label>
          <Input
            id="initialCredit"
            type="number"
            step="0.01"
            min="0"
            value={formData.initialCredit}
            onChange={(e) => setFormData({...formData, initialCredit: e.target.value})}
            placeholder="Enter initial credit (optional)"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!formData.name.trim() || !formData.phone.trim() || formData.phone.trim() === "+92"}
          >
            Add Customer
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Add Credit to Existing Customer Dialog - Simplified with Combobox
const AddCreditToExistingDialog = ({ 
  customers = [], 
  onSubmit, 
  onClose 
}: { 
  customers: any[]; 
  onSubmit: (customerId: number, amount: number) => void;
  onClose: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");

  // Ensure customers is always an array
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const selectedCustomer = safeCustomers.find((c: any) => c.id === selectedCustomerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !amount) return;
    onSubmit(selectedCustomerId, parseFloat(amount));
    // Reset form
    setSelectedCustomerId(null);
    setAmount("");
    setSearchQuery("");
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card/60 backdrop-blur-md">
      <DialogHeader>
        <DialogTitle className="text-2xl">Add Credit to Existing Customer</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Select Customer *</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-auto min-h-[3rem] py-3"
              >
                {selectedCustomer ? (
                  <div className="flex flex-col items-start gap-1 text-left">
                    <span className="font-semibold">{selectedCustomer.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedCustomer.phone} • Balance: PKR {(selectedCustomer.currentBalance || 0).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Search and select customer...</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput 
                  placeholder="Type customer name or phone number..." 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="h-12"
                />
                <CommandList className="max-h-[400px]">
                  <CommandEmpty>No customer found.</CommandEmpty>
                  <CommandGroup>
                    {safeCustomers
                      .filter((customer: any) => {
                        if (!searchQuery) return true;
                        const query = searchQuery.toLowerCase();
                        return (
                          customer.name?.toLowerCase().includes(query) ||
                          customer.phone?.toLowerCase().includes(query) ||
                          customer.email?.toLowerCase().includes(query)
                        );
                      })
                      .slice(0, 100) // Show top 100 results
                      .map((customer: any) => (
                        <CommandItem
                          key={customer.id}
                          value={customer.id.toString()}
                          onSelect={() => {
                            setSelectedCustomerId(customer.id);
                            setOpen(false);
                            setSearchQuery("");
                          }}
                          className="py-3 cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              selectedCustomerId === customer.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col gap-1 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{customer.name}</span>
                              <Badge variant={customer.currentBalance > 0 ? "destructive" : "secondary"}>
                                PKR {(customer.currentBalance || 0).toLocaleString()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {customer.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone}
                                </span>
                              )}
                              {customer.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {customer.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {safeCustomers.length > 100 && (
            <p className="text-xs text-muted-foreground">
              Showing top 100 results. Keep typing to refine your search.
            </p>
          )}
        </div>

        {/* Selected Customer Info */}
        {selectedCustomer && (
          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Outstanding Balance</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-500 mt-1">
                  PKR {(selectedCustomer.currentBalance || 0).toLocaleString()}
                </p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
          </div>
        )}

        {/* Credit Amount */}
        <div className="space-y-2">
          <Label htmlFor="credit-amount" className="text-base font-semibold">Credit Amount *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">PKR</span>
            <Input
              id="credit-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="pl-14 h-12 text-lg"
              required
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} size="lg">
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-orange-600 hover:bg-orange-700 min-w-[140px]" 
            size="lg"
            disabled={!selectedCustomerId || !amount}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Credit
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Payment Modal Component
const PaymentModal = ({ 
  customer, 
  open, 
  onOpenChange, 
  onSubmit 
}: { 
  customer: any; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSubmit: (customerId: number, amount: number, method: string, reference?: string) => void;
}) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(customer.id, parseFloat(amount), method, reference);
    setAmount("");
    setReference("");
    setMethod("cash");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment - {customer.name}</DialogTitle>
        </DialogHeader>
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Current Outstanding</p>
          <p className="text-2xl font-bold text-red-600">PKR {(customer.currentBalance || 0).toLocaleString()}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="Enter amount"
            />
          </div>
          <div>
            <Label htmlFor="method">Payment Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="online">Online Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Transaction reference or note"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Receivable Modal Component
const ReceivableModal = ({ 
  customer, 
  open, 
  onOpenChange, 
  onSubmit 
}: { 
  customer: any; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSubmit: (customerId: number, amount: number, reason: string, reference?: string) => void;
}) => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(customer.id, parseFloat(amount), reason, reference);
    setAmount("");
    setReason("");
    setReference("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Credit/Receivable - {customer.name}</DialogTitle>
        </DialogHeader>
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Current Outstanding</p>
          <p className="text-2xl font-bold text-red-600">PKR {(customer.currentBalance || 0).toLocaleString()}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="credit-amount">Credit Amount</Label>
            <Input
              id="credit-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="Enter amount to add"
            />
          </div>
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="Reason for credit (e.g., Purchase, Service charge)"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="credit-reference">Reference (Optional)</Label>
            <Input
              id="credit-reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Invoice number or reference"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              Add Credit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Transaction History Modal
const TransactionHistoryModal = ({ 
  customer, 
  transactions,
  open, 
  onOpenChange 
}: { 
  customer: any; 
  transactions: any[];
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Transaction History - {customer.name}</DialogTitle>
        </DialogHeader>
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Current Outstanding</p>
          <p className="text-2xl font-bold text-red-600">PKR {(customer.currentBalance || 0).toLocaleString()}</p>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-96">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions found</p>
          ) : (
            transactions.map((txn, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={txn.type === 'payment' ? 'default' : 'secondary'}>
                          {txn.type || 'Transaction'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {txn.createdAt ? format(new Date(txn.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </span>
                      </div>
                      {txn.notes && (
                        <p className="text-sm mt-2">{txn.notes}</p>
                      )}
                      {txn.reference && (
                        <p className="text-xs text-muted-foreground mt-1">Ref: {txn.reference}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.amount > 0 ? '+' : ''}PKR {Math.abs(txn.amount || 0).toLocaleString()}
                      </p>
                      {txn.balanceAfter !== undefined && (
                        <p className="text-xs text-muted-foreground">Balance: PKR {txn.balanceAfter.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Credits;
