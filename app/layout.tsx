import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import GraphContextProvider from "./contexts/GraphContext";
import IndexedDbContextProvider from "./contexts/IndexedDbContext";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Graph Everything",
	description: "Github style graphs for tracking your daily activities",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body
				className={`${inter.className} flex items-center overflow-hidden py-20 flex-col px-16 dark w-screen min-h-screen overflow-y-auto`}
			>
				<IndexedDbContextProvider>
					<GraphContextProvider>{children}</GraphContextProvider>
					<Toaster />
				</IndexedDbContextProvider>
			</body>
		</html>
	);
}
