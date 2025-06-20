import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { PaymentGateway, PaymentDetails, PAYMENT_METHODS } from "@/lib/payment";
import { OrderManagement } from "@/lib/orderManagement";
import {
  CreditCard,
  Smartphone,
  Wallet,
  DollarSign,
  Lock,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface PaymentGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: {
    orderId: string;
    amount: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    shopName: string;
    tokenNumber: number;
  };
  customerDetails: {
    email: string;
    name: string;
  };
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentFailed: (error: string) => void;
}

export const PaymentGatewayComponent = ({
  isOpen,
  onClose,
  orderDetails,
  customerDetails,
  onPaymentSuccess,
  onPaymentFailed,
}: PaymentGatewayProps) => {
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "select" | "details" | "processing" | "success" | "failed"
  >("select");
  const [transactionId, setTransactionId] = useState("");
  const { toast } = useToast();

  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const [upiId, setUpiId] = useState("");

  const handlePaymentSubmit = async () => {
    if (!selectedMethod) return;

    // Validate payment details based on method
    if (selectedMethod === "card") {
      if (
        !cardDetails.number ||
        !cardDetails.expiry ||
        !cardDetails.cvv ||
        !cardDetails.name
      ) {
        toast({
          variant: "destructive",
          title: "Invalid card details",
          description: "Please fill in all card information",
        });
        return;
      }
    } else if (selectedMethod === "upi") {
      if (!upiId) {
        toast({
          variant: "destructive",
          title: "Invalid UPI ID",
          description: "Please enter a valid UPI ID",
        });
        return;
      }
    }

    setIsProcessing(true);
    setPaymentStep("processing");

    try {
      const paymentDetails: PaymentDetails = {
        amount: orderDetails.amount,
        currency: "INR",
        orderId: orderDetails.orderId,
        customerEmail: customerDetails.email,
        customerName: customerDetails.name,
      };

      const result = await PaymentGateway.processPayment(paymentDetails);

      if (result.success && result.transactionId) {
        setTransactionId(result.transactionId);
        setPaymentStep("success");

        // Update order status in backend
        await OrderManagement.updateOrderAfterPayment(
          orderDetails.orderId,
          "completed",
          result.transactionId,
        );

        toast({
          title: "Payment successful!",
          description: `Transaction ID: ${result.transactionId}`,
        });

        onPaymentSuccess(result.transactionId);
      } else {
        setPaymentStep("failed");
        await OrderManagement.updateOrderAfterPayment(
          orderDetails.orderId,
          "failed",
        );
        onPaymentFailed(result.error || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStep("failed");
      onPaymentFailed("Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPayment = () => {
    setPaymentStep("select");
    setTransactionId("");
    setCardDetails({ number: "", expiry: "", cvv: "", name: "" });
    setUpiId("");
  };

  const getPaymentIcon = (methodId: string) => {
    switch (methodId) {
      case "card":
        return <CreditCard className="h-5 w-5" />;
      case "upi":
        return <Smartphone className="h-5 w-5" />;
      case "wallet":
        return <Wallet className="h-5 w-5" />;
      case "cash":
        return <DollarSign className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2 text-green-600" />
            Secure Payment
          </DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {orderDetails.shopName}
                </span>
                <Badge>Token #{orderDetails.tokenNumber}</Badge>
              </div>
              <Separator />
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-green-600">
                  ${orderDetails.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        {paymentStep === "select" && (
          <div className="space-y-4">
            <h3 className="font-medium">Select Payment Method</h3>
            <RadioGroup
              value={selectedMethod}
              onValueChange={setSelectedMethod}
            >
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <Label
                        htmlFor={method.id}
                        className="font-medium cursor-pointer"
                      >
                        {method.name}
                      </Label>
                      <p className="text-xs text-gray-500">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>

            <Button
              onClick={() => setPaymentStep("details")}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Payment Details */}
        {paymentStep === "details" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Payment Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPaymentStep("select")}
              >
                Change Method
              </Button>
            </div>

            {selectedMethod === "card" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, number: e.target.value })
                    }
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          expiry: e.target.value,
                        })
                      }
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, cvv: e.target.value })
                      }
                      maxLength={4}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, name: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {selectedMethod === "upi" && (
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            )}

            {selectedMethod === "wallet" && (
              <div className="text-center py-4">
                <Wallet className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-gray-600">
                  You will be redirected to your wallet app
                </p>
              </div>
            )}

            {selectedMethod === "cash" && (
              <div className="text-center py-4 bg-yellow-50 rounded-lg">
                <DollarSign className="h-12 w-12 mx-auto mb-2 text-yellow-600" />
                <p className="text-sm text-gray-600">
                  Pay in cash when you collect your order
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Please bring exact change if possible
                </p>
              </div>
            )}

            <Button
              onClick={handlePaymentSubmit}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              disabled={isProcessing}
            >
              {selectedMethod === "cash"
                ? "Confirm Order"
                : `Pay $${orderDetails.amount.toFixed(2)}`}
            </Button>
          </div>
        )}

        {/* Processing */}
        {paymentStep === "processing" && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-green-600" />
            <h3 className="font-medium mb-2">Processing Payment...</h3>
            <p className="text-sm text-gray-600">
              Please wait while we process your payment
            </p>
          </div>
        )}

        {/* Success */}
        {paymentStep === "success" && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h3 className="font-medium mb-2 text-green-700">
              Payment Successful!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your order has been confirmed and is being prepared
            </p>
            {transactionId && (
              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <p className="text-xs text-green-700">Transaction ID:</p>
                <p className="font-mono text-sm text-green-800">
                  {transactionId}
                </p>
              </div>
            )}
            <Button onClick={onClose} className="w-full">
              Continue
            </Button>
          </div>
        )}

        {/* Failed */}
        {paymentStep === "failed" && (
          <div className="text-center py-8">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-600" />
            <h3 className="font-medium mb-2 text-red-700">Payment Failed</h3>
            <p className="text-sm text-gray-600 mb-4">
              We couldn't process your payment. Please try again.
            </p>
            <div className="space-y-2">
              <Button
                onClick={resetPayment}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
              <Button onClick={onClose} variant="ghost" className="w-full">
                Cancel Order
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
