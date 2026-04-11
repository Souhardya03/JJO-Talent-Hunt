"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Clock, Copy, Home, Mail, User, CreditCard, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const reg_id = searchParams.get("reg_id") || "N/A";
    const name = searchParams.get("name") || "N/A";
    const email = searchParams.get("email") || "N/A";
    const tx = searchParams.get("tx") || "N/A";
    const amount = searchParams.get("amount") || "0";
    const method = searchParams.get("method") || "N/A";

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] py-12 px-4 mt-14 sm:px-6 font-sans text-slate-900 flex items-center justify-center">
            <div className="max-w-xl w-full space-y-6">
                <Card className="rounded-2xl border-none shadow-xl overflow-hidden">
                    <div className={`p-8 text-center space-y-4 ${method === "Zelle" ? "bg-amber-500" : "bg-emerald-500"}`}>
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-inner">
                            {method === "Zelle" ? (
                                <Clock className="w-10 h-10 text-amber-500" />
                            ) : (
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            )}
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            {method === "Zelle" ? "Payment Pending!" : "Payment Successful!"}
                        </h1>
                        <p className={`font-medium text-sm ${method === "Zelle" ? "text-amber-50" : "text-emerald-100"}`}>
                            {method === "Zelle" 
                                ? "Your Zelle transaction is under review. You will be notified once approved by the admin."
                                : "Your registration has been confirmed and recorded."}
                        </p>
                    </div>

                    <CardContent className="p-8 space-y-8 bg-white">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Transaction Details</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><User className="w-3 h-3"/> Participant Name</p>
                                    <p className="text-sm font-bold text-slate-800">{name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Mail className="w-3 h-3"/> Official Email</p>
                                    <p className="text-sm font-bold text-slate-800 truncate">{email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><DollarSign className="w-3 h-3"/> Amount Paid</p>
                                    <p className="text-sm font-bold text-slate-800">${amount}.00</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><CreditCard className="w-3 h-3"/> Payment Method</p>
                                    <p className="text-sm font-bold text-slate-800">{method}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Registration ID</p>
                                    <p className="text-xs font-mono font-bold text-slate-700">{reg_id}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(reg_id)}>
                                    <Copy className="w-4 h-4 text-slate-400" />
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Transaction Reference</p>
                                    <p className="text-xs font-mono font-bold text-slate-700">{tx}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(tx)}>
                                    <Copy className="w-4 h-4 text-slate-400" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button className="flex-1 h-12 rounded-xl bg-slate-950 text-white font-bold tracking-wider text-xs uppercase" onClick={() => router.push('/')}>
                                <Home className="w-4 h-4 mr-2" /> Back to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-bold animate-pulse">Loading Details...</div>}>
            <SuccessContent />
        </Suspense>
    );
}