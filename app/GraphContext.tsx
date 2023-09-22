"use client";
import { createContext, useEffect, useState } from "react";

export type GraphState =
	| {
			title: string;
			hue: number;
			frequency: "daily" | "weekly" | "monthly";
			measurementType: "ratio";
	  }
	| {
			title: string;
			hue: number;
			frequency: "daily" | "weekly" | "monthly";
			measurementType: "ordinal";
			minimum: number;
			maximum: number;
	  };

export const GraphContext = createContext<{
	graphs: Map<string, GraphState>;
	refreshGraphs: () => void;
}>({
	graphs: new Map(),
	refreshGraphs: () => {},
});

export default function GraphContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [graphs, setGraphs] = useState<Map<string, GraphState>>(new Map());
	const [refetchGraphs, setRefetchGraphs] = useState(true);

	useEffect(() => {
		if (!refetchGraphs) return;
		const graphMap = new Map();
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			const keyRegex = /graph-(\d+)/;
			if (keyRegex.test(key!)) {
				graphMap.set(key, JSON.parse(localStorage.getItem(key!)!));
			}
		}
		setGraphs(graphMap);
		setRefetchGraphs(false);
	}, [refetchGraphs]);

	const refreshGraphs = () => setRefetchGraphs(true);

	return (
		<GraphContext.Provider value={{ graphs, refreshGraphs }}>
			{children}
		</GraphContext.Provider>
	);
}
