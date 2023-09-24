"use client";
import {
	GraphContext,
	GraphState,
	StoredTile,
} from "@/app/contexts/GraphContext";
import { IndexedDbContext } from "@/app/contexts/IndexedDbContext";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { addDays, isSameDay } from "date-fns";
import { useContext, useEffect, useState } from "react";
import GraphTileEditor from "./GraphTileEditor";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

function GraphWithDetails({ graphState }: { graphState: GraphState }) {
	const { hue, title, frequency, measurementType } = graphState;
	return (
		<div
			className="flex flex-col border-[1px] w-fit p-4 gap-4 "
			style={{
				backgroundColor: `hsl(${hue}deg, 12%, 10%)`,
				// boxShadow: `0px 0px 5px 0.2px hsl(${hue}deg, 50%, 50%)`,
				borderColor: `hsl(${hue}deg, 50%, 20%)`,
			}}
		>
			<h1
				className="font-text-xl font-medium"
				style={{ color: `hsl(${hue}deg 50% 50%)` }}
			>
				{title}
			</h1>
			<Graph graphState={graphState} />
		</div>
	);
}

function Graph({ graphState }: { graphState: GraphState }) {
	const { documentDb } = useContext(IndexedDbContext);
	const { graphs } = useContext(GraphContext);
	const [timestampToTile, setTimestampToTile] = useState<Map<
		number,
		StoredTile
	> | null>(null);
	const [maximumAmount, setMaximumAmount] = useState(0);
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
				let maximum = 0;
				for (let result of results) {
					timeStampToTile.set(result.timeStamp, result);
					if (result.amount > maximum) {
						maximum = result.amount;
					}
				}

				setMaximumAmount(maximum);
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
			setTimestampToTile(res);
		});
	}, [documentDb, graphs]);

	if (timestampToTile === null) {
		return <p>Loading</p>;
	}

	return (
		<div className="w-[768px] h-fit  grid grid-cols-37  grid-rows-10  gap-[2px]  grid-flow-col">
			{Array.from({ length: 365 }).map((_, i) => {
				const currentTileDate = addDays(
					new Date(graphState.timeStamp),
					i - 30
				);

				let tile: StoredTile = {
					timeStamp: currentTileDate.getTime(),
					graphTitle: graphState.title,
					amount: 0,
					note: "",
				};
				if (timestampToTile) {
					for (let key of Array.from(timestampToTile.keys())) {
						if (isSameDay(currentTileDate, new Date(key))) {
							tile = timestampToTile.get(key)!;
						}
					}
				}
				return (
					<GraphTile
						graphState={{
							...graphState,
							maximumTillNow: maximumAmount,
						}}
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
	tile: StoredTile;
	timeStamp: number;
}) {
	const [tileStats, setTileStats] = useState(tile);
	const [open, setOpen] = useState(false);
	const { hue } = graphState;

	let maximumMeasurement = 0;
	if (graphState.measurementType === "ratio") {
		maximumMeasurement = graphState.maximumTillNow;
	} else {
		maximumMeasurement = graphState.maximum;
	}

	const { dateToHighlight } = useContext(GraphContext);
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

	// useEffect(() => {
	// 	setTileStats(tile);
	// }, [tile]);

	return (
		<Dialog open={open}>
			<TooltipProvider>
				<Tooltip>
					<DialogTrigger
						className={` rounded-sm h-[18px] border-[2px] hover:scale-105 active:scale-95`}
						style={{
							backgroundColor: `hsl(${hue}deg 100% ${getLightnessFromAmount(
								tileStats.amount,
								maximumMeasurement
							)}%)`,
							borderColor: isSameDay(
								dateToHighlight,
								new Date(timeStamp)
							)
								? `hsl(${hue}deg 100% 50%)`
								: `hsl(${hue}deg 100% 8%)`,
						}}
						onClick={() => {
							const todayDate = addDays(new Date(), 1);
							todayDate.setHours(0, 0, 0, 0);
							console.log(todayDate, new Date(timeStamp));
							if (todayDate > new Date(timeStamp)) {
								setOpen(true);
							}
						}}
					>
						<TooltipTrigger className="w-full h-full duration-0"></TooltipTrigger>
					</DialogTrigger>
					<TooltipContent
						style={{
							backgroundColor: `hsl(${graphState.hue}deg, 20%, 10%)`,
							// boxShadow: `0px 0px 5px 0.2px hsl(${hue}deg, 50%, 50%)`,
							borderColor: `hsl(${graphState.hue}deg, 100%, 20%)`,
							color: `hsl(${graphState.hue}deg 50% 50%)`,
						}}
					>
						{graphState.title}: {tile.amount} on{" "}
						{new Date(timeStamp).toDateString().slice(4)}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			{open && (
				<GraphTileEditor
					closeEditor={() => setOpen(false)}
					tile={{ ...tileStats, refreshTile }}
					graph={graphState}
				/>
			)}
		</Dialog>
	);
}

function getLightnessFromAmount(amount: number, maximum: number) {
	// This function converts any given amount to a lightnes percentage between 0 to 70%.
	// Say someone tracks number of steps, maximum number of steps he has ever taken are 5000. If he walks 3000 steps on a day, then the tile corresponding to that day will have lightness value = (3000/5000)*70

	if (amount === 0) return 0;
	if (maximum === 0) return 50;
	const lightness = (amount / maximum) * 50;

	return lightness;
}

export default GraphWithDetails;
