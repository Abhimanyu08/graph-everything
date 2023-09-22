"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import GraphForm from "@/components/GraphForm";
import { Button } from "@/components/ui/button";
import Graph from "@/components/Graph";

export default function NewGraphDialog({ className }: { className: string }) {
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open}>
			<DialogTrigger className={className}>
				<Button variant={"outline"} onClick={() => setOpen(true)}>
					New Graph
				</Button>
			</DialogTrigger>
			<DialogContent onClick={() => setOpen(false)}>
				<GraphForm setOpen={setOpen} />
			</DialogContent>
		</Dialog>
	);
}
