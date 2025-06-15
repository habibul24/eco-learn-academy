
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { SupabaseClient } from "@supabase/supabase-js";

export function useCoursePayment(courseId: number, user: any, isEnrolled: boolean) {
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "stripe">("paypal");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();

  function checkSupabaseClient() {
    if (!supabase || typeof supabase.from !== "function" || !(supabase instanceof SupabaseClient)) {
      // eslint-disable-next-line no-console
      console.error("[FATAL] The imported `supabase` is NOT a valid Supabase client instance!", { supabase, type: typeof supabase, proto: Object.getPrototypeOf(supabase), keys: Object.keys(supabase) });
      throw new Error(
        "Invalid Supabase client! Check all imports for 'supabase' and ensure no code shadows, re-exports or assigns it from anywhere else except '@/integrations/supabase/client'."
      );
    }
  }

  function startPurchase() {
    if (!user) {
      toast({ title: "Please log in first." });
      navigate("/auth");
      return;
    }
    setShowPaymentModal(true);
  }

  function pay() {
    if (paymentMethod === "paypal") {
      handlePayPalPay();
    } else {
      handleStripePay();
    }
  }

  async function handleStripePay() {
    setPaying(true);
    checkSupabaseClient();
    try {
      const { data, error } = await supabase.functions.invoke("stripe-pay-course", {
        body: { course_id: courseId },
      });
      if (error || !data?.url) {
        toast({
          title: "Stripe payment failed",
          description: error?.message || "Unable to initiate payment.",
        });
      } else {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({ title: "Stripe payment error", description: err.message });
    } finally {
      setPaying(false);
    }
  }

  async function handlePayPalPay() {
    setPaying(true);
    checkSupabaseClient();
    try {
      const { data, error } = await supabase.functions.invoke("paypal-pay-course", {
        body: { action: "create", course_id: courseId },
      });
      if (error || !data?.url) {
        toast({
          title: "PayPal error",
          description: error?.message || "Unable to start payment.",
        });
      } else {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({ title: "PayPal payment error", description: err.message });
    } finally {
      setPaying(false);
    }
  }

  return {
    paying,
    setPaying,
    paymentMethod,
    setPaymentMethod,
    showPaymentModal,
    setShowPaymentModal,
    startPurchase,
    pay,
  };
}
