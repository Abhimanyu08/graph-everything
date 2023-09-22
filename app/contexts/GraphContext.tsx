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
	  }
	| {
			title: string;
			hue: number;
			frequency: "daily" | "weekly" | "monthly";
			measurementType: "ordinal";
			minimum: number;
			maximum: number;
			timeStamp: number;
	  };
export type StoredTile = {
	timeStamp: number;
	graphTitle: string;
	amount: number;
	note: string;
};
export type Tile = {
	timeStamp?: number;
	graphTitle: string;
	measurementType: GraphState["measurementType"];
	maximum: number;
	minimum: number;
	stats?: StoredTile;
	refreshTile?: () => void;
};

export const GraphContext = createContext<{
	graphs: Map<string, GraphState>;
	refreshGraphs: () => void;
	editingTile: Tile | null;
	setEditingTile: Dispatch<SetStateAction<Tile | null>>;
}>({
	graphs: new Map(),
	refreshGraphs: () => {},
	editingTile: null,
	setEditingTile: () => {},
});

export default function GraphContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [graphs, setGraphs] = useState<Map<string, GraphState>>(new Map());
	const [editingTile, setEditingTile] = useState<Tile | null>(null);
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
			value={{ graphs, refreshGraphs, editingTile, setEditingTile }}
		>
			{children}
		</GraphContext.Provider>
	);
}
