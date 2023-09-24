"use client";
import {
	Dispatch,
	SetStateAction,
	createContext,
	useEffect,
	useState,
} from "react";

export type GraphState =
	| {
			title: string;
			hue: number;
			frequency: "daily" | "weekly" | "monthly";
			measurementType: "ratio";
			timeStamp: number;
			maximumTillNow: number;
			key: string;
	  }
	| {
			title: string;
			hue: number;
			frequency: "daily" | "weekly" | "monthly";
			measurementType: "ordinal";
			minimum: number;
			maximum: number;
			maximumTillNow?: number;
			timeStamp: number;
			key: string;
	  };
export type StoredTile = {
	timeStamp: number;
	graphTitle: string;
	amount: number;
	note: string;

	refreshTile?: () => void;
};

export const GraphContext = createContext<{
	graphs: Map<string, GraphState>;
	refreshGraphs: () => void;
	// editingTile: StoredTile | null;
	// setEditingTile: Dispatch<SetStateAction<StoredTile | null>>;
	// editingGraph: GraphState | null;
	// setEditingGraph: Dispatch<SetStateAction<GraphState | null>>;
	dateToHighlight: Date;
	setDateToHighlight: Dispatch<SetStateAction<Date>>;
}>({
	graphs: new Map(),
	refreshGraphs: () => {},
	// editingTile: null,
	// setEditingTile: () => {},
	// editingGraph: null,
	// setEditingGraph: () => {},
	dateToHighlight: new Date(),
	setDateToHighlight: () => {},
});

export default function GraphContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [graphs, setGraphs] = useState<Map<string, GraphState>>(new Map());
	// const [editingTile, setEditingTile] = useState<StoredTile | null>(null);
	// const [editingGraph, setEditingGraph] = useState<GraphState | null>(null);
	const [dateToHighlight, setDateToHighlight] = useState(new Date());
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
		<GraphContext.Provider
			value={{
				graphs,
				refreshGraphs,
				// editingTile,
				// setEditingTile,
				// editingGraph,
				// setEditingGraph,
				dateToHighlight,
				setDateToHighlight,
			}}
		>
			{children}
		</GraphContext.Provider>
	);
}
