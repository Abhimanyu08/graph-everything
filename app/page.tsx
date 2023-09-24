"use client";
import NewGraphDialog from "@/components/NewGraphDialog";
import { useContext } from "react";
import { GraphContext } from "./contexts/GraphContext";
import GraphWithDetails from "@/components/Graph";
import { Calendar } from "@/components/ui/calendar";

export default function Home() {
	const { graphs, dateToHighlight, setDateToHighlight } =
		useContext(GraphContext);
	return (
		<div className="flex w-full justify-between">
			<div className="flex flex-col gap-5  items-center">
				{Array.from(graphs.values()).map((graphState) => (
					<GraphWithDetails
						graphState={graphState}
						key={graphState.title}
					/>
				))}
				<NewGraphDialog className="mt-2 self-start" />
			</div>
			<Calendar
				mode="single"
				className="border-border border-2 h-fit"
				selected={dateToHighlight}
				onSelect={setDateToHighlight as any}
			/>
		</div>
	);
}
