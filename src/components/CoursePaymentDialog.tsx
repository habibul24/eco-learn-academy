
import React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paying: boolean;
  paymentMethod: "paypal" | "stripe";
  setPaymentMethod: (val: "paypal" | "stripe") => void;
  pay: () => void;
  courseTitle: string;
  priceFormatted: string;
};

export default function CoursePaymentDialog({
  open, onOpenChange, paying, paymentMethod, setPaymentMethod, pay, courseTitle, priceFormatted,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Complete Your Purchase</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-base font-semibold">
            <span>{courseTitle}</span>
            <span>{priceFormatted}</span>
          </div>
          <div>
            <span className="block mb-1 font-medium text-gray-700">Select Payment Method</span>
            <RadioGroup
              value={paymentMethod}
              onValueChange={val => setPaymentMethod(val as "paypal" | "stripe")}
              className="flex flex-col gap-2"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="paypal" id="pay-pal" />
                <span>PayPal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="stripe" id="stripe-card" />
                <span>Credit Card (Stripe)</span>
              </label>
            </RadioGroup>
          </div>
          {/* Payment Buttons */}
          <div className="flex flex-col gap-3 mt-3">
            <Button
              disabled={paying || paymentMethod !== "paypal"}
              className="bg-[#FFC439] hover:bg-yellow-400 text-black font-bold w-full py-2 rounded transition-colors text-lg"
              onClick={pay}
            >
              <span className="w-full flex justify-center">PayPal</span>
            </Button>
            <Button
              disabled={paying || paymentMethod !== "stripe"}
              className="bg-black hover:bg-gray-900 text-white w-full rounded py-2 text-lg font-bold flex items-center justify-center gap-2"
              onClick={pay}
            >
              <span>Debit or Credit Card</span>
            </Button>
            <div className="text-center text-xs mt-1 text-muted-foreground">
              Powered by <span className="font-semibold text-blue-700">PayPal</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
