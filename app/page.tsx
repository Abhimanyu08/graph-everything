"use client";
import NewGraphDialog from "@/components/NewGraphDialog";
import { useContext } from "react";
import { GraphContext } from "./contexts/GraphContext";
import GraphWithDetails from "@/components/Graph";
import GraphTileEditor from "@/components/GraphTileEditor";

export default function Home() {
	const { graphs, editingTile, editingGraph } = useContext(GraphContext);
	return (
		<div className="flex flex-col gap-5 w-fit items-center">
			{Array.from(graphs.values()).map((graphState) => (
				<GraphWithDetails graphState={graphState} />
			))}
			<NewGraphDialog className="mt-2 self-start" />
		</div>
	);
}
