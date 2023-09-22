"use client";
import NewGraphDialog from "@/components/NewGraphDialog";
import { useContext } from "react";
import { GraphContext } from "./contexts/GraphContext";
import Graph from "@/components/Graph";
import GraphWithDetails from "@/components/Graph";
import GraphTileEditor from "@/components/GraphTileEditor";

export default function Home() {
	const { graphs, editingTile } = useContext(GraphContext);
	return (
		<div className="flex gap-2">
			<div className="flex flex-col gap-5">
				{Array.from(graphs.values()).map((graphState) => (
					<GraphWithDetails graphState={graphState} />
				))}
				<NewGraphDialog className="self-start" />
			</div>
			{editingTile && (
				<div className="grow h-1/2 border-border border-2">
					<GraphTileEditor tile={editingTile} />
				</div>
			)}
		</div>
	);
}
