"use client";
import {
	GraphContext,
	GraphState,
	StoredTile,
	Tile,
} from "@/app/contexts/GraphContext";
import { IndexedDbContext } from "@/app/contexts/IndexedDbContext";
import { addDays, formatDistance, isSameDay } from "date-fns";
import React, { useContext, useEffect, useState } from "react";

function GraphWithDetails({ graphState }: { graphState: GraphState }) {
	const { hue, title, frequency, measurementType } = graphState;
	return (
		<div
			className="flex flex-col  w-fit p-4 gap-4 "
			style={{
				backgroundColor: `hsl(${hue}deg, 12%, 10%)`,
				boxShadow: `0px 0px 5px 0.2px hsl(${hue}deg, 50%, 50%)`,
				// borderColor: `hsl(${hue}deg, 50%, 50%)`,
			}}
		>
			<h1
				className="font-serif text-xl font-medium"
				style={{ color: `hsl(${hue}deg 30% 50%)` }}
			>
				{title}
			</h1>
			<Graph graphState={graphState} />
		</div>
	);
}

function Graph({ graphState }: { graphState: GraphState }) {
	const { documentDb } = useContext(IndexedDbContext);
	const [timestampToTile, setTimestampToTile] = useState<Map<
		number,
		StoredTile
	> | null>(null);
	function getTilesByTitle(
		documentDb: IDBDatabase,
		title: string
	): Promise<Map<number, StoredTile>> {
		return new Promise((resolve, reject) => {
			const transaction = documentDb.transaction("tile", "readonly");
			const store = transaction.objectStore("tile");
			const index = store.index("titleIndex");
			const request = index.getAll(IDBKeyRange.only(title));

			request.onsuccess = () => {
				// Sort the results by timeStamp in ascending order
				const results = request.result.sort(
					(a, b) => a.timeStamp - b.timeStamp
				) as StoredTile[];

				let timeStampToTile = new Map<number, StoredTile>();

				for (let result of results) {
					timeStampToTile.set(result.timeStamp, result);
				}

				resolve(timeStampToTile);
			};

			request.onerror = () => {
				reject(request.error);
			};
		});
	}

	useEffect(() => {
		if (!documentDb) return;
		getTilesByTitle(documentDb, graphState.title).then((res) => {
			if (!res || res.size === 0) return;
			setTimestampToTile(res);
		});
	}, [documentDb]);
	return (
		<div className="w-[768px] h-fit  grid grid-cols-37  grid-rows-10  gap-[2px]  grid-flow-col">
			{Array.from({ length: 365 }).map((_, i) => {
				let tile: StoredTile | undefined = undefined;
				const currentTileDate = addDays(
					new Date(graphState.timeStamp),
					i - 10
				);

				if (timestampToTile) {
					for (let key of Array.from(timestampToTile.keys())) {
						if (isSameDay(currentTileDate, new Date(key))) {
							tile = timestampToTile.get(key)!;
						}
					}
				}
				return (
					<GraphTile
						graphState={graphState}
						timeStamp={currentTileDate.getTime()}
						tile={tile}
					/>
				);
			})}
		</div>
	);
}

function GraphTile({
	graphState,
	tile,
	timeStamp,
}: {
	graphState: GraphState;
	tile?: StoredTile;
	timeStamp: number;
}) {
	const [tileStats, setTileStats] = useState(tile);
	const { hue, title, measurementType } = graphState;
	let minimum: number, maximum: number;
	if (measurementType === "ordinal") {
		minimum = graphState.minimum;
		maximum = graphState.maximum;
	}

	const { setEditingTile } = useContext(GraphContext);
	const { documentDb } = useContext(IndexedDbContext);

	const refreshTile = () => {
		const tileObjectStore = documentDb
			?.transaction("tile")
			.objectStore("tile");
		const request = tileObjectStore?.get(tile?.timeStamp || timeStamp);
		request?.addEventListener("success", () => {
			const updatedTile = request.result;
			setTileStats(updatedTile);
		});
	};

	useEffect(() => {
		if (!tileStats) {
			setTileStats(tile);
		}
	}, [tile]);

	return (
		<div
			className="rounded-sm h-[18px] border-[1px]"
			style={{
				// backgroundColor: `hsl(${hue}deg 100% ${Math.round(
				// 	Math.max(0.1, Math.random()) * 50
				// )}%)`,
				borderColor: `hsl(${hue}deg 100% 8%)`,
				backgroundColor: `hsl(0deg 100% 0%)`,
			}}
			onClick={() => {
				const todayDate = addDays(new Date(), 1);
				todayDate.setHours(0, 0, 0, 0);
				if (todayDate > new Date(timeStamp)) {
					setEditingTile({
						timeStamp: timeStamp,
						graphTitle: title,
						measurementType,
						maximum: maximum || 0,
						minimum: minimum || 0,
						stats: tileStats,
						refreshTile: refreshTile,
					});
				}
			}}
		></div>
	);
}

export default GraphWithDetails;
