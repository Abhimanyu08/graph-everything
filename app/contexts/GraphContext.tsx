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
			measurementType: "ratio";
			timeStamp: number;
			maximumTillNow: number;
			key: string;
	  }
	| {
			title: string;
			hue: number;
			measurementType: "ordinal";
			minimum: number;
			maximum: number;
			maximumTillNow?: number;
			timeStamp: number;
			key: string;
	  };
export type StoredTile = {
	timeStamp: number;
	graphId: string;
	amount: number;
	note: string;

	refreshTile?: () => void;
};

export const GraphContext = createContext<{
	graphs: Map<string, GraphState>;
	refreshGraphs: () => void;
	dateToHighlight: Date;
	setDateToHighlight: Dispatch<SetStateAction<Date>>;
	dark: boolean;
	toggleDark: () => void;
}>({
	graphs: new Map(),
	refreshGraphs: () => {},
	dateToHighlight: new Date(),
	setDateToHighlight: () => {},
	dark: true,
	toggleDark: () => {},
});

export default function GraphContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [graphs, setGraphs] = useState<Map<string, GraphState>>(new Map());
	const [dateToHighlight, setDateToHighlight] = useState(new Date());
	const [refetchGraphs, setRefetchGraphs] = useState(true);
	const [dark, setDark] = useState(true);

	const toggleDark = () => {
		if (document.body.classList.contains("dark")) {
			document.body.classList.remove("dark");
		} else {
			document.body.classList.add("dark");
		}
		setDark((p) => !p);
	};

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
				dateToHighlight,
				setDateToHighlight,
				dark,
				toggleDark,
			}}
		>
			{children}
		</GraphContext.Provider>
	);
}
