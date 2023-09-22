"use client";
import NewGraphDialog from "@/components/NewGraphDialog";
import { useContext } from "react";
import { GraphContext } from "./GraphContext";
import Graph from "@/components/Graph";
import GraphWithDetails from "@/components/Graph";

export default function Home() {
	const { graphs } = useContext(GraphContext);
	return (
		<div className="flex flex-col gap-5">
			{Array.from(graphs.values()).map((graphState) => (
				<GraphWithDetails graphState={graphState} />
			))}
			<NewGraphDialog className="self-start" />
		</div>
	);
}
