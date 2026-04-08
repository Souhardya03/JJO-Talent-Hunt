"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  CreditCard, Wallet, Loader2, MapPin, CheckCircle2, FileText, Lock,  Landmark, HelpCircle
} from "lucide-react"

// --- STRIPE & PAYPAL SDKS ---
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Image from "next/image"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CATEGORIES = [
  { id: "Singing", name: "Singing", price: 10 },
  { id: "Dance", name: "Dance", price: 10 },
  { id: "Musical Instrument", name: "Musical Instrument", price: 10 },
  { id: "Recitation", name: "Recitation", price: 10 },
  { id: "Drawing", name: "Drawing", price: 10 },
  { id: "Monologue", name: "Monologue", price: 10 },
  { id: "Script Writing", name: "Script Writing", price: 10 },
]

const US_STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]

const schema = z.object({
  name: z.string().min(2, "Full legal name required"),
  parent_name: z.string().min(2, "Guardian name required"),
  email: z.string().email("Valid email required"),
  age_group: z.string().min(1, "Required"),
  grade: z.string().min(1, "Required"),
  address: z.string().min(5, "Address required"),
  city: z.string().min(2, "City required"),
  state: z.string().min(1, "Required"),
  zip: z.string().min(5, "Invalid Zip"),
  payment_method: z.enum(["Stripe", "PayPal", "Zelle"]),
  transaction_id: z.string().optional(),
  selected_categories: z.array(z.string()).min(1, "Select at least one discipline"),
})

const saveToDatabase = async (payload: any) => {
    return await fetch('https://m9bnvd4c8j.execute-api.us-east-1.amazonaws.com/dev/v1/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
};

function StripeSubmitSection({ total, isProcessing, onConfirm }: { total: number, isProcessing: boolean, onConfirm: (s: any, e: any) => void }) {
  const stripe = useStripe();
  const elements = useElements();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-inner">
        <PaymentElement options={{ layout: "accordion" }} />
      </div>
      <Button
        type="button"
        disabled={isProcessing || !stripe}
        onClick={() => onConfirm(stripe, elements)}
        className="w-full h-12 bg-[#0f172a] hover:bg-slate-800 text-white rounded-md font-semibold transition-all shadow-sm"
      >
        {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : `Authorize Payment of $${total}.00`}
      </Button>
    </div>
  );
}

export default function OfficialRegistrationForm() {
  const [total, setTotal] = useState(0)
  const [activeMethod, setActiveMethod] = useState<"Stripe" | "PayPal" | "Zelle">("Stripe")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loadingSecret, setLoadingSecret] = useState(false)
  const [isStripeLoading, setIsStripeLoading] = useState(false)

  const { register, handleSubmit, setValue, watch, trigger, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { 
      name: "", parent_name: "", email: "", address: "", city: "", state: "", zip: "",
      selected_categories: [], payment_method: "Stripe", age_group: "", grade: ""
    }
  })

  const selectedCats = watch("selected_categories") || []
  const watchEmail = watch("email")

  useEffect(() => {
    const newTotal = CATEGORIES.filter(c => selectedCats.includes(c.id)).reduce((sum, c) => sum + c.price, 0)
    setTotal(newTotal)
  }, [selectedCats])

  useEffect(() => {
    const fetchSecret = async () => {
      if (total <= 0 || !watchEmail || activeMethod !== "Stripe") return;
      setLoadingSecret(true);
      try {
        const res = await fetch('https://clkovxgt00.execute-api.us-east-1.amazonaws.com/jjo-api/stripe', {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total, email: watchEmail }),
        });
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (err) { console.error(err) } finally { setLoadingSecret(false) }
    };
    const timer = setTimeout(fetchSecret, 800);
    return () => clearTimeout(timer);
  }, [total, watchEmail, activeMethod]);

  const handleStripeConfirm = async (stripe: any, elements: any) => {
    const isValid = await trigger();
    if (!isValid) return;
    setIsStripeLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements, confirmParams: { receipt_email: watchEmail }, redirect: "if_required",
      });
      if (!error && paymentIntent?.status === "succeeded") {
        await saveToDatabase({ ...watch(), transaction_id: paymentIntent.id, total_amount: total });
        toast.success("Official Enrolment Confirmed.");
        reset();
        setActiveMethod("Stripe");
        setClientSecret(null);
      }
    } catch (e) {
      toast.error("An error occurred.");
    } finally { setIsStripeLoading(false) }
  }

  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test" }}>
      <div className="min-h-screen bg-[#f8fafc] py-12 px-4 mt-14 sm:px-6 font-sans text-slate-900 overflow-x-hidden">
        <div className="max-w-4xl flex items-center justify-center w-full flex-col mx-auto space-y-6">
          
          {/* Official Header */}
          <div className="bg-white border w-full border-slate-200 p-8 rounded-t-xl border-b-4 border-b-[#0f172a] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Registration Form</h1>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">JJO Talent Hunt — 2026</p>
            </div>
            <div>
                <Image src={"/JJOLogo.png"} alt="" width={92} height={92}/>
            </div>
            
          </div>

          <form onSubmit={handleSubmit(async (d) => {
            if (activeMethod === "Zelle") {
              await saveToDatabase({...d, total_amount: total});
              toast.success("Official Enrolment Confirmed.");
              reset();
              setActiveMethod("Stripe");
              setClientSecret(null);
            }
          })} className="space-y-6 w-full">
            
            {/* 1. APPLICANT DATA */}
            <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Section 01: Applicant Identity
                    </span>
                    <span className="text-[10px] text-slate-400 italic">All fields required</span>
                </div>
                <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700">Full Name</Label>
                            <Input {...register("name")} className="rounded-md h-10 border-slate-300 focus:ring-slate-950 focus:border-slate-950" placeholder="Full Name" />
                            {errors.name && <p className="text-red-600 text-[10px] font-medium">{errors.name.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700">Name of Parent/Guardian</Label>
                            <Input {...register("parent_name")} className="rounded-md h-10 border-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700">Email Address</Label>
                            <Input {...register("email")} type="email" className="rounded-md h-10 border-slate-300" placeholder="admin@example.com" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700">Age Group</Label>
                                <select {...register("age_group")} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-950">
                                    <option value="">Select...</option>
                                    <option value="6-10">6-10 Years</option>
                                    <option value="11-16">11-16 Years</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700">Current Grade</Label>
                                <select {...register("grade")} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-950">
                                    <option value="">Select...</option>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(n => <option key={n} value={n.toString()}>Grade {n}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. GEOGRAPHIC INFO */}
            <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Section 02: Mailing & Geography
                    </span>
                </div>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700">Street Address with apartment number</Label>
                        <Input {...register("address")} className="rounded-md h-10 border-slate-300" placeholder="Street number and name" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700">City</Label>
                            <Input {...register("city")} className="rounded-md h-10 border-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700">State / Province</Label>
                            <select {...register("state")} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                                <option value="">Select State</option>
                                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700">Postal / Zip Code</Label>
                            <Input {...register("zip")} className="rounded-md h-10 border-slate-300" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 3. DISCIPLINES */}
            <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" /> Section 03: Categories
                    </span>
                </div>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12">
                        {CATEGORIES.map((cat) => (
                            <div key={cat.id} className="flex items-center space-x-3">
                                <Checkbox 
                                    id={cat.id}
                                    checked={selectedCats.includes(cat.id)} 
                                    onCheckedChange={(c) => setValue("selected_categories", c ? [...selectedCats, cat.id] : selectedCats.filter(i => i !== cat.id), { shouldValidate: true })} 
                                    className="border-slate-300 rounded text-slate-900 focus:ring-slate-900" 
                                />
                                <Label htmlFor={cat.id} className="text-sm font-semibold text-slate-700 cursor-pointer flex-1 flex justify-between pr-4">
                                    <span>{cat.name}</span>
                                    <span className="text-slate-400 font-normal">${cat.price}</span>
                                </Label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 4. PAYMENT & SUBMISSION */}
            <Card className="rounded-xl border-slate-200 shadow-md overflow-hidden border-t-4 border-t-slate-900">
                <CardContent className="p-0 flex flex-col md:flex-row">
                    {/* Final Totals Sidebar */}
                    <div className="md:w-1/3 bg-slate-50 p-8 border-b md:border-b-0 md:border-r border-slate-200 space-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrolment Fee Summary</p>
                            <h3 className="text-4xl font-bold text-slate-900">${total}.00</h3>
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Method</p>
                            <div className="space-y-2">
                                {[
                                    { id: "Stripe", label: "Credit / Debit", icon: CreditCard },
                                    { id: "PayPal", label: "PayPal Express", icon: Wallet },
                                    { id: "Zelle", label: "Zelle Transfer", icon: Landmark },
                                ].map((m) => (
                                    <button 
                                        key={m.id} 
                                        type="button" 
                                        onClick={() => { setActiveMethod(m.id as any); setValue("payment_method", m.id as any); }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-md border text-left transition-all",
                                            activeMethod === m.id ? "bg-white border-slate-900 shadow-sm text-slate-900" : "bg-transparent border-slate-200 text-slate-400 grayscale hover:grayscale-0"
                                        )}
                                    >
                                        <m.icon className="w-4 h-4" />
                                        <span className="text-xs font-bold">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Gateway Area */}
                    <div className="flex-1 p-8 bg-white min-h-[350px] flex flex-col justify-center">
                        {activeMethod === "Stripe" && (
                            clientSecret ? (
                                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                    <StripeSubmitSection total={total} isProcessing={isStripeLoading} onConfirm={handleStripeConfirm} />
                                </Elements>
                            ) : (
                                <div className="text-center space-y-3">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-200" />
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Awaiting Gateway initialization...</p>
                                </div>
                            )
                        )}

                        {activeMethod === "PayPal" && (
                            <div className="space-y-6 animate-in fade-in">
                                <div className="p-4 rounded-md bg-blue-50 border border-blue-100 flex items-start gap-3">
                                    <HelpCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                                    <p className="text-[11px] text-blue-700 leading-relaxed font-medium">You will be redirected to PayPal's secure portal to complete this transaction. Do not close this window during the process.</p>
                                </div>
                                <PayPalButtons style={{ layout: "vertical", shape: "rect", color: "blue", height: 48 }} createOrder={(d, a) => a.order.create({ intent: "CAPTURE", purchase_units: [{ amount: { currency_code: "USD", value: total.toString() } }] })} onApprove={async (d, a) => {
                                    const details = await a.order?.capture();
                                    await saveToDatabase({ ...watch(), transaction_id: details?.id, total_amount: total, payment_method: "PayPal" });
                                    toast.success("Submission Complete.");
                                    reset();
                                    setActiveMethod("Stripe");
                                    setClientSecret(null);
                                }} />
                            </div>
                        )}

                        {activeMethod === "Zelle" && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-2">
                                <div className="bg-slate-50 border border-slate-200 p-6 rounded-md space-y-4">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payable To</Label>
                                        <p className="text-sm font-bold text-slate-800">JHALE JHOLE OMBOLENJ</p>
                                        <p className="text-xs font-semibold text-slate-600 break-all">jhalejholeombolenj@gmail.com</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Memo</Label>
                                        <p className="text-xs font-semibold text-slate-600 break-words">JJO 2026 - {watch("name") || "[STUDENT NAME]"}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-700">Reference / Confirmation ID</Label>
                                        <Input {...register("transaction_id")} placeholder="Enter bank reference ID" className="rounded-md border-slate-300" />
                                        {errors.transaction_id && <p className="text-red-600 text-[10px] font-medium">{errors.transaction_id.message as string}</p>}
                                    </div>
                                    <Button type="submit" className="w-full h-12 bg-slate-900 text-white rounded-md font-bold uppercase tracking-widest text-xs shadow-lg">Submit Official Enrolment</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Footer Trust Signal */}
            <div className="text-center space-y-2 py-6 opacity-40">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">Authorized by JJO Talent Committee © 2026</p>
                <div className="flex justify-center items-center gap-4">
                    <Separator className="w-8" />
                    <Lock className="w-3 h-3" />
                    <Separator className="w-8" />
                </div>
            </div>
          </form>
        </div>
      </div>
    </PayPalScriptProvider>
  )
}