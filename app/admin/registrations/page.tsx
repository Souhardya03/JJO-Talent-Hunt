"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
	Search,
	Users,
	CheckCircle2,
	Clock,
	RefreshCcw,
	ShieldCheck,
	DollarSign,
	MoreHorizontal,
	Mail,
	MapPin,
	Tag,
	Edit3,
	Trash2,
	Loader2,
	FileText,
	AtSign,
	Home,
	LogOut,
	Download,
} from "lucide-react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { removeAuthCookie, getAuthToken } from "@/app/actions";

const AVAILABLE_CATEGORIES = [
	"Singing",
	"Dance",
	"Musical Instrument",
	"Recitation",
	"Drawing",
	"Monologue",
	"Script Writing",
];

const US_STATES = [
	"AL",
	"AK",
	"AZ",
	"AR",
	"CA",
	"CO",
	"CT",
	"DE",
	"FL",
	"GA",
	"HI",
	"ID",
	"IL",
	"IN",
	"IA",
	"KS",
	"KY",
	"LA",
	"ME",
	"MD",
	"MA",
	"MI",
	"MN",
	"MS",
	"MO",
	"MT",
	"NE",
	"NV",
	"NH",
	"NJ",
	"NM",
	"NY",
	"NC",
	"ND",
	"OH",
	"OK",
	"OR",
	"PA",
	"RI",
	"SC",
	"SD",
	"TN",
	"TX",
	"UT",
	"VT",
	"VA",
	"WA",
	"WV",
	"WI",
	"WY",
];

type Category = { name: string; amount: number };
type Registration = {
	reg_id: string;
	name: string;
	parent_name: string;
	email: string;
	age_group: string;
	grade: string;
	zip: string;
	state: string;
	city: string;
	street: string | null;
	payment_method: string;
	transaction_id: string;
	total_amount: number;
	categories: Category[];
	created_at: string;
	active_status?: string;
};

export default function AdminRegistrationsPage() {
	const [registrations, setRegistrations] = useState<Registration[]>([]);
	const [loading, setLoading] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [lastKey, setLastKey] = useState<{last_id: string; last_email: string; last_created_at:string} | null>(null);

	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isViewOpen, setIsViewOpen] = useState(false);
	const [currentReg, setCurrentReg] = useState<Registration | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const router = useRouter();

	const API_URL =
		"https://ewagy9qntg.execute-api.us-east-1.amazonaws.com/prod/v1/registrations";

	// const API_URL =
	// 	"https://m9bnvd4c8j.execute-api.us-east-1.amazonaws.com/dev/v1/registrations";

	const fetchRegistrations = async (query = searchQuery, loadMore = false) => {
		if (loadMore) {
			setFetchingMore(true);
		} else {
			setLoading(true);
		}
		
		const token = await getAuthToken();
		try {
			const url = new URL(API_URL);
			if (query) {
				url.searchParams.append("search", query);
			}
			if (loadMore && lastKey) {
				url.searchParams.append("last_id", lastKey.last_id);
				url.searchParams.append("last_email", lastKey.last_email);
				url.searchParams.append("last_created_atemail", lastKey.last_created_at);
			}
			const response = await fetch(url.toString(), {
				// headers: { Authorization: `Bearer ${token}` },
				method: "GET"
			});
			const data = await response.json();
			if (loadMore) {
				setRegistrations((prev) => [...prev, ...(data.items || [])]);
			} else {
				setRegistrations(data.items || []);
			}
			setLastKey(data.last_key || null);
		} catch (error) {
			toast.error("Database connection failed");
		} finally {
			if (loadMore) setFetchingMore(false);
			else setLoading(false);
		}
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			fetchRegistrations(searchQuery);
		}, 500);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	const deleteRegistration = async (reg_id: string, email: string) => {
		if (!confirm("Permanently remove this record from the manifest?")) return;
		try {
			const response = await fetch(
				`${API_URL}?reg_id=${reg_id}&email=${email}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${await getAuthToken()}` },
				},
			);
			if (response.ok) {
				setRegistrations((prev) => prev.filter((r) => r.reg_id !== reg_id));
				toast.success("Registration removed");
			}
		} catch (e) {
			toast.error("Deletion failed");
		}
	};

	const updateRegistration = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentReg) return;
		setIsUpdating(true);
		try {
			const response = await fetch(
				`${API_URL}?reg_id=${currentReg.reg_id}&email=${currentReg.email}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${await getAuthToken()}`,
					},
					body: JSON.stringify(currentReg),
				},
			);
			if (response.ok) {
				toast.success("Regsitration Updated Successfully");
				setIsEditDialogOpen(false);
				fetchRegistrations();
			}
		} catch (e) {
			toast.error("Update failed");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleCategoryToggle = (catName: string) => {
		if (!currentReg) return;
		const exists = currentReg.categories.find((c) => c.name === catName);
		const newCats = exists
			? currentReg.categories.filter((c) => c.name !== catName)
			: [...currentReg.categories, { name: catName, amount: 10 }];
		setCurrentReg({ ...currentReg, categories: newCats });
	};

	const handleLogout = async () => {
		await removeAuthCookie();
		router.push("/");
	};

	const handleDownloadXlsx = async () => {
		setIsDownloading(true);
		try {
			const response = await fetch(
				"https://ewagy9qntg.execute-api.us-east-1.amazonaws.com/prod/v1/registrations/get-all-data",
				{
					headers: { Authorization: `Bearer ${await getAuthToken()}` },
				}
			);
			const data = await response.json();
			if (data.success && data.items) {
				const formattedData = data.items.map((item: any) => ({
					"Registration ID": item.reg_id,
					"Name": item.name,
					"Parent Name": item.parent_name,
					"Email": item.email,
					"Age Group": item.age_group,
					"Grade": item.grade,
					"Street": item.street,
					"City": item.city,
					"State": item.state,
					"Zip": item.zip,
					"Payment Method": item.payment_method,
					"Transaction ID": item.transaction_id,
					"Total Amount": item.total_amount,
					"Categories": item.categories?.map((c: any) => c.name).join(", ") || "",
					"Status": item.active_status,
					"Date Created": new Date(item.created_at).toLocaleString()
				}));

				// Dynamically import xlsx to prevent SSR issues and build failures if uninstalled
				const XLSX = await import("xlsx");
				const ws = XLSX.utils.json_to_sheet(formattedData);
				const wb = XLSX.utils.book_new();
				XLSX.utils.book_append_sheet(wb, ws, "Registrations");
				XLSX.writeFile(wb, "Registrations_Export.xlsx");
				toast.success("Download started successfully");
			} else {
				toast.error("Failed to fetch data for export");
			}
		} catch (error) {
			console.error("Download error:", error);
			toast.error("Export failed. Make sure to run 'npm install xlsx'.");
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#F9FAFB] p-6 md:p-10 font-sans text-slate-900">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8 border-slate-200">
					<div className="space-y-1">
						<div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] tracking-[0.2em] uppercase">
							<ShieldCheck className="w-4 h-4" /> Registrar Authorized
						</div>
						<h1 className="text-4xl font-black text-slate-950 tracking-tight uppercase">
							Registrations
						</h1>
						<p className="text-slate-500 font-medium text-sm">
							Managing JJO Talent Hunt Series 2026
						</p>
					</div>
					<div className="flex gap-3">
						<Button
							variant="outline"
							onClick={handleDownloadXlsx}
							disabled={isDownloading}
							className="rounded-xl border-slate-200 bg-white h-11 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
							<Download className={cn("w-4 h-4 mr-2", isDownloading && "animate-bounce")} />
							{isDownloading ? "Exporting..." : "Export XLSX"}
						</Button>
						<Button
							variant="outline"
							onClick={() => fetchRegistrations(searchQuery)}
							disabled={loading}
							className="rounded-xl border-slate-200 bg-white h-11">
							<RefreshCcw
								className={cn("w-4 h-4 mr-2", loading && "animate-spin")}
							/>{" "}
							Refresh
						</Button>
						<Button
							variant="destructive"
							onClick={handleLogout}
							className="rounded-xl h-11 shadow-sm">
							<LogOut className="w-4 h-4 mr-2" /> Logout
						</Button>
					</div>
				</div>

				{/* Analytics */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{[
						{
							label: "Total Registrations",
							value: registrations.length,
							icon: Users,
							color: "text-blue-600",
							bg: "bg-blue-50",
						},
						{
							label: "Gross Revenue",
							value: `$${registrations.reduce((s, r) => s + Number(r.total_amount), 0)}`,
							icon: DollarSign,
							color: "text-emerald-600",
							bg: "bg-emerald-50",
						},
						// {
						// 	label: "Verified Slots",
						// 	value: registrations.length,
						// 	icon: CheckCircle2,
						// 	color: "text-indigo-600",
						// 	bg: "bg-indigo-50",
						// },
						{
							label: "Today's Enrol",
							value: registrations.filter((r) =>
								r.created_at.includes(new Date().toISOString().split("T")[0]),
							).length,
							icon: Clock,
							color: "text-amber-600",
							bg: "bg-amber-50",
						},
					].map((stat, i) => (
						<Card
							key={i}
							className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
							<CardContent className="p-6 flex items-center gap-4">
								<div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
									<stat.icon className="w-5 h-5" />
								</div>
								<div>
									<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
										{stat.label}
									</p>
									<h3 className="text-xl font-black text-slate-900">
										{stat.value}
									</h3>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Search */}
				<div className="relative">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
					<Input
						placeholder="Search manifest by name or email (Press Enter)..."
						className="pl-11 h-14 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-600 transition-all"
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							if (e.target.value === "") {
								fetchRegistrations("");
							}
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								fetchRegistrations(searchQuery);
							}
						}}
					/>
				</div>

				{/* Records Table */}
				<div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden overflow-x-auto">
					<Table>
						<TableHeader className="bg-slate-50/50">
							<TableRow className="border-slate-100">
								<TableHead className="font-black text-slate-400 text-[10px] uppercase tracking-widest px-8 py-5">
									Participant / ID
								</TableHead>
								<TableHead className="font-black text-slate-400 text-[10px] uppercase tracking-widest">
									Grade & Age
								</TableHead>
								<TableHead className="font-black text-slate-400 text-[10px] uppercase tracking-widest">
									Categories
								</TableHead>
								<TableHead className="font-black text-slate-400 text-[10px] uppercase tracking-widest">
									Amount
								</TableHead>
								<TableHead className="font-black text-slate-400 text-[10px] uppercase tracking-widest">
									Status
								</TableHead>
								<TableHead className="text-right px-8"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="h-96 text-center">
										<Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 opacity-20" />
									</TableCell>
								</TableRow>
							) : registrations.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="h-32 text-center text-slate-500 font-medium">
										No registrations found.
									</TableCell>
								</TableRow>
							) : (
								registrations.map((reg) => (
									<TableRow
										key={reg.reg_id}
										className="group hover:bg-slate-50/50 transition-colors border-slate-50">
										<TableCell className="px-8 py-5">
											<div className="flex items-center gap-4">
												<div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">
													{reg.name.charAt(0)}
												</div>
												<div>
													<p className="font-bold text-slate-900 text-sm leading-tight">
														{reg.name}
													</p>
													<p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
														ID: {reg.reg_id.slice(0, 8)}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<p className="text-xs font-bold text-slate-600 uppercase">
												Grade {reg.grade}
											</p>
											<p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
												{reg.age_group} Years
											</p>
										</TableCell>
										<TableCell>
											<div className="flex flex-wrap gap-1">
												{reg.categories.map((c, i) => (
													<Badge
														key={i}
														variant="secondary"
														className="text-[8px] font-black uppercase px-2 py-0.5 bg-blue-50 text-blue-700 border-none rounded-md">
														{c.name}
													</Badge>
												))}
											</div>
										</TableCell>
										<TableCell>
											<p className="font-black text-slate-950 text-sm">
												${reg.total_amount}.00
											</p>
											<p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest italic">
												{reg.payment_method}
											</p>
										</TableCell>
										<TableCell>
											<Badge
												variant="secondary"
												className={cn(
													"text-[8px] font-black uppercase px-2 py-0.5 border-none rounded-md",
													reg.active_status === "Active"
														? "bg-emerald-50 text-emerald-700"
														: reg.active_status === "Pending"
															? "bg-amber-50 text-amber-700"
															: reg.active_status === "Inactive"
																? "bg-red-50 text-red-700"
																: "bg-slate-50 text-slate-700",
												)}>
												{reg.active_status || "Pending"}
											</Badge>
										</TableCell>
										<TableCell className="text-right px-8">
											<DropdownMenu>
												<DropdownMenuTrigger>
													<Button
														variant="ghost"
														className="h-10 w-10 p-0 hover:bg-white hover:shadow-md rounded-xl transition-all">
														<MoreHorizontal className="h-5 w-5 text-slate-400" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													align="end"
													className="rounded-2xl border-slate-100 p-2 shadow-xl">
													<DropdownMenuItem
														onClick={() => {
															setCurrentReg(reg);
															setIsViewOpen(true);
														}}
														className="rounded-lg font-bold text-xs py-3 cursor-pointer">
														<FileText className="w-4 h-4 mr-2" /> Show Details
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => {
															setCurrentReg(reg);
															setIsEditDialogOpen(true);
														}}
														className="rounded-lg font-bold text-xs py-3 cursor-pointer">
														<Edit3 className="w-4 h-4 mr-2" /> Edit Details
													</DropdownMenuItem>
													<Separator className="my-2" />
													<DropdownMenuItem
														onClick={() =>
															deleteRegistration(reg.reg_id, reg.email)
														}
														className="rounded-lg font-bold text-xs py-3 text-red-600 cursor-pointer">
														Permanently Remove
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
					{lastKey && (
						<div className="flex justify-center p-6 bg-slate-50/50 border-t border-slate-100">
							<Button
								variant="outline"
								onClick={() => fetchRegistrations(searchQuery, true)}
								disabled={fetchingMore || loading}
								className="rounded-xl bg-white shadow-sm"
							>
								{fetchingMore && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
								{fetchingMore ? "Loading..." : "Load More Registrations"}
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* --- MODAL: FULL MANIFEST VIEW --- */}
			<Dialog
				open={isViewOpen}
				onOpenChange={setIsViewOpen}>
				<DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-8 border-none shadow-2xl">
					<DialogHeader>
						<DialogTitle className="text-2xl font-black uppercase ">
							Details of {currentReg?.name}
						</DialogTitle>
						<DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
							Full Registry Audit Log
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-8 pt-6 text-slate-800">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div className="space-y-4">
								<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1 flex items-center gap-2">
									<AtSign className="w-3 h-3" /> Technical ID's
								</p>
								<div className="space-y-3">
									<div>
										<p className="text-[10px] font-bold text-slate-300 uppercase">
											Reg ID
										</p>
										<p className="text-xs font-mono font-bold text-slate-600">
											{currentReg?.reg_id}
										</p>
									</div>
									<div>
										<p className="text-[10px] font-bold text-slate-300 uppercase">
											Status
										</p>
										<Badge
											variant="secondary"
											className={cn(
												"mt-1 text-[8px] font-black uppercase px-2 py-0.5 border-none rounded-md",
												currentReg?.active_status === "Active"
													? "bg-emerald-50 text-emerald-700"
													: currentReg?.active_status === "Pending"
														? "bg-amber-50 text-amber-700"
														: currentReg?.active_status === "Inactive"
															? "bg-red-50 text-red-700"
															: "bg-slate-50 text-slate-700",
											)}>
											{currentReg?.active_status || "Pending"}
										</Badge>
									</div>
									<div>
										<p className="text-[10px] font-bold text-slate-300 uppercase">
											Stripe TXN
										</p>
										<p className="text-xs font-mono font-bold text-slate-600">
											{currentReg?.transaction_id}
										</p>
									</div>
									<div>
										<p className="text-[10px] font-bold text-slate-300 uppercase">
											Official Email
										</p>
										<p className="text-xs font-bold text-slate-800">
											{currentReg?.email}
										</p>
									</div>
								</div>
							</div>
							<div className="space-y-4">
								<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1 flex items-center gap-2">
									<Home className="w-3 h-3" /> Address Manifest
								</p>
								<div className="space-y-3">
									<div>
										<p className="text-[10px] font-bold text-slate-300 uppercase">
											Street
										</p>
										<p className="text-xs font-bold text-slate-800">
											{currentReg?.street || "No street data recorded"}
										</p>
									</div>
									<div>
										<p className="text-[10px] font-bold text-slate-300 uppercase">
											City/State/Zip
										</p>
										<p className="text-xs font-bold text-slate-800">
											{currentReg?.city}, {currentReg?.state} {currentReg?.zip}
										</p>
									</div>
									<div>
										<p className="text-[10px] font-bold text-slate-300 uppercase">
											Timestamp
										</p>
										<p className="text-xs font-bold text-slate-800 italic">
											{currentReg?.created_at}
										</p>
									</div>
								</div>
							</div>
						</div>
						<Separator />
						<div className="space-y-4">
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
								<Tag className="w-3 h-3" /> Financial Distribution
							</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
								{currentReg?.categories.map((c, i) => (
									<div
										key={i}
										className="flex justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
										<span className="text-[10px] font-black text-slate-600 uppercase">
											{c.name}
										</span>
										<span className="text-[10px] font-black text-blue-600">
											${c.amount}.00
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* --- MODAL: EDIT & CATEGORY OVERRIDE --- */}
			<Dialog
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="sm:max-w-3xl  p-8 border-none shadow-2xl overflow-y-auto max-h-[90vh]">
					<DialogHeader>
						<DialogTitle className="text-xl font-black uppercase ">
							Edit Details
						</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={updateRegistration}
						className="space-y-8 pt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* PERSONAL & ACADEMIC */}
							<div className="space-y-5">
								<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
									<Users className="w-3 h-3" /> Personal Information
								</p>
								<div className="space-y-3">
									<div className="space-y-1">
										<Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
											Legal Name
										</Label>
										<Input
											value={currentReg?.name || ""}
											onChange={(e) =>
												setCurrentReg((prev) =>
													prev ? { ...prev, name: e.target.value } : null,
												)
											}
											className="h-12 rounded-xl bg-slate-50 border-none font-bold"
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
											Parent Name
										</Label>
										<Input
											value={currentReg?.parent_name || ""}
											onChange={(e) =>
												setCurrentReg((prev) =>
													prev
														? { ...prev, parent_name: e.target.value }
														: null,
												)
											}
											className="h-12 rounded-xl bg-slate-50 border-none font-bold"
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
											Official Email
										</Label>
										<Input
											value={currentReg?.email || ""}
											onChange={(e) =>
												setCurrentReg((prev) =>
													prev ? { ...prev, email: e.target.value } : null,
												)
											}
											className="h-12 rounded-xl bg-slate-50 border-none font-bold"
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
											Status
										</Label>
										<select
											value={currentReg?.active_status || "Pending"}
											onChange={(e) =>
												setCurrentReg((prev) =>
													prev ? { ...prev, active_status: e.target.value } : null,
												)
											}
											className="w-full h-12 rounded-xl bg-slate-50 border-none font-bold text-xs px-3 outline-none">
											<option value="Active">Active</option>
											<option value="Pending">Pending</option>
											<option value="Inactive">Inactive</option>
										</select>
									</div>
									<div className="grid grid-cols-2 gap-4 pt-1">
										<div className="space-y-1">
											<Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
												Grade
											</Label>
											<Input
												value={currentReg?.grade || ""}
												onChange={(e) =>
													setCurrentReg((prev) =>
														prev ? { ...prev, grade: e.target.value } : null,
													)
												}
												className="h-12 rounded-xl bg-slate-50 border-none font-bold"
											/>
										</div>
										<div className="space-y-1">
											<Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
												Age Group
											</Label>
											<Input
												value={currentReg?.age_group || ""}
												onChange={(e) =>
													setCurrentReg((prev) =>
														prev
															? { ...prev, age_group: e.target.value }
															: null,
													)
												}
												className="h-12 rounded-xl bg-slate-50 border-none font-bold"
											/>
										</div>
									</div>
								</div>
							</div>

							{/* ADDRESS INFORMATION */}
							<div className="space-y-5">
								<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
									<Home className="w-3 h-3" /> Address Manifest
								</p>
								<div className="space-y-3">
									<div className="space-y-1">
										<Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
											Street Address
										</Label>
										<Input
											value={currentReg?.street || ""}
											onChange={(e) =>
												setCurrentReg((prev) =>
													prev ? { ...prev, street: e.target.value } : null,
												)
											}
											className="h-12 rounded-xl bg-slate-50 border-none font-bold"
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
											City
										</Label>
										<Input
											value={currentReg?.city || ""}
											onChange={(e) =>
												setCurrentReg((prev) =>
													prev ? { ...prev, city: e.target.value } : null,
												)
											}
											className="h-12 rounded-xl bg-slate-50 border-none font-bold"
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-1">
											<Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
												State
											</Label>
											<select
												value={currentReg?.state || ""}
												onChange={(e) =>
													setCurrentReg((prev) =>
														prev ? { ...prev, state: e.target.value } : null,
													)
												}
												className="w-full h-12 rounded-xl bg-slate-50 border-none font-bold text-xs px-3 outline-none">
												{US_STATES.map((s) => (
													<option
														key={s}
														value={s}>
														{s}
													</option>
												))}
											</select>
										</div>
										<div className="space-y-1">
											<Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
												Zip Code
											</Label>
											<Input
												value={currentReg?.zip || ""}
												onChange={(e) =>
													setCurrentReg((prev) =>
														prev ? { ...prev, zip: e.target.value } : null,
													)
												}
												className="h-12 rounded-xl bg-slate-50 border-none font-bold"
											/>
										</div>
									</div>
								</div>
							</div>
						</div>

						<Separator />

						{/* CATEGORIES */}
						<div className="space-y-4">
							<Label className="text-[10px] font-black uppercase text-slate-400 border-b pb-2 block">
								Modify Enrollment Slots
							</Label>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
								{AVAILABLE_CATEGORIES.map((catName) => {
									const isChecked = currentReg?.categories.some(
										(c) => c.name === catName,
									);
									const id = `cat-${catName.replace(/\s+/g, "-").toLowerCase()}`;
									return (
										<div
											key={catName}
											className={cn(
												"flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
												isChecked
													? "border-slate-900 bg-slate-950 text-white"
													: "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200",
											)}
											onClick={() => handleCategoryToggle(catName)}>
											<label
												htmlFor={id}
												className="text-[9px] font-black uppercase leading-tight cursor-pointer">
												{catName}
											</label>
											<Checkbox
												id={id}
												checked={isChecked}
												onCheckedChange={() => handleCategoryToggle(catName)}
												className={cn(
													"w-4 h-4 border-2 rounded",
													isChecked ? "border-white" : "border-slate-200",
												)}
											/>
										</div>
									);
								})}
							</div>
						</div>

						<Button
							type="submit"
							disabled={isUpdating}
							className="w-full h-16 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all">
							{isUpdating ? (
								<Loader2 className="animate-spin" />
							) : (
								"Authorize Rgistration"
							)}
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
