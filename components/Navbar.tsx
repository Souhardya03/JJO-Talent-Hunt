import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
	return (
		<nav className="border-b fixed w-full z-999 top-0 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					<div className=" flex items-center gap-4 justify-center">
						<div>
							<Image
								src={"/JJOLogo.png"}
								alt=""
								width={48}
								height={48}
							/>
						</div>
						<Link
							href="/"
							className="text-2xl font-bold text-blue-900">
							JJO Talent Hunt 2026
						</Link>
					</div>
					<div className="hidden md:block">
						<Link
							href="/admin"
							className="text-sm font-medium text-gray-500 hover:text-blue-900 transition-colors">
							Admin Panel
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
}
