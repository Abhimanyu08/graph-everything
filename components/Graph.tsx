"use client";
import {
	GraphContext,
	GraphState,
	StoredTile,
} from "@/app/contexts/GraphContext";
import { IndexedDbContext } from "@/app/contexts/IndexedDbContext";
import { useToast } from "@/components/ui/use-toast";
import { addDays, isSameDay } from "date-fns";
import { Edit2, Trash } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import GraphForm from "./GraphForm";
import GraphTileEditor from "./GraphTileEditor";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTrigger,
} from "./ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

function GraphWithDetails({ graphState }: { graphState: GraphState }) {
	const { hue, title } = graphState;
	const { dark, refreshGraphs } = useContext(GraphContext);
	const { documentDb } = useContext(IndexedDbContext);
	const [open, setOpen] = useState(false);
	const [openDeletionDialog, setOpenDeletionDialog] = useState(false);

	const onDelete = () => {
		// Delete from localStorage
		if (!documentDb) return;
		localStorage.removeItem(graphState.key);

		// Delete from IndexedDB

		const transaction = documentDb.transaction("tile", "readwrite");
		const store = transaction.objectStore("tile");
		const index = store.index("graphIndex");
		const request = index.openCursor(IDBKeyRange.only(graphState.key));

		request.onsuccess = function () {
			const cursor = request.result;
			if (cursor) {
				store.delete(cursor.primaryKey);
				cursor.continue();
			}
		};
		setOpenDeletionDialog(false);
		refreshGraphs();
	};
	return (
		<div
			className="flex flex-col border-[1px] w-fit p-4 gap-4 group"
			style={{
				backgroundColor: dark
					? `hsl(${hue}deg, 20%, 15%)`
					: `hsl(${hue}deg, 12%, 90%)`,
				// boxShadow: `0px 0px 5px 0.2px hsl(${hue}deg, 50%, 50%)`,
				borderColor: dark
					? `hsl(${hue}deg, 50%, 20%)`
					: `hsl(${hue}deg, 50%, 50%)`,
			}}
		>
			<div className="flex justify-between items-center">
				<h1
					className="font-text-xl font-medium"
					style={{
						color: dark
							? `hsl(${hue}deg 100% 50%)`
							: `hsl(${hue}deg 100% 30%)`,
					}}
				>
					{title}
				</h1>
				<div
					className="flex gap-3 group-hover:visible invisible "
					style={{
						color: dark
							? `hsl(${hue}deg 100% 50%)`
							: `hsl(${hue}deg 100% 30%)`,
					}}
				>
					<Dialog open={open}>
						<DialogTrigger>
							<Button
								variant={"outline"}
								className="h-3 rounded-sm px-2 py-3"
								onClick={() => setOpen(true)}
							>
								<Edit2 size={14} className="" />
							</Button>
							<DialogContent onClick={() => setOpen(false)}>
								<GraphForm
									setOpen={setOpen}
									graphState={graphState}
								/>
							</DialogContent>
						</DialogTrigger>
					</Dialog>
					<Dialog open={openDeletionDialog}>
						<DialogTrigger
							onClick={() => setOpenDeletionDialog(true)}
						>
							<Button
								variant={"destructive"}
								className="h-3 rounded-sm px-2 py-3"
							>
								<Trash size={14} className="" />
							</Button>
						</DialogTrigger>
						<DialogContent
							onClick={() => setOpenDeletionDialog(false)}
						>
							<p>
								Delete{" "}
								<span className="font-bold">
									{graphState.title}?
								</span>
							</p>
							<DialogFooter>
								<Button
									variant={"destructive"}
									onClick={onDelete}
									type="submit"
								>
									Confirm
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
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
	function getTilesByGraph(
		documentDb: IDBDatabase,
		graphId: string
	): Promise<Map<number, StoredTile>> {
		return new Promise((resolve, reject) => {
			const transaction = documentDb.transaction("tile", "readonly");
			const store = transaction.objectStore("tile");
			const index = store.index("graphIndex");
			const request = index.getAll(IDBKeyRange.only(graphId));

			request.onsuccess = () => {
				// Sort the results by timeStamp in ascending order
				const results = request.result;

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
		getTilesByGraph(documentDb, graphState.key).then((res) => {
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
					i - 20
				);

				let tile: StoredTile = {
					timeStamp: currentTileDate.getTime(),
					graphId: graphState.key,
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
						key={tile.timeStamp}
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
	const { toast } = useToast();

	let maximumMeasurement = 0;
	if (graphState.measurementType === "ratio") {
		maximumMeasurement = graphState.maximumTillNow;
	} else {
		maximumMeasurement = graphState.maximum;
	}

	const { dateToHighlight, dark } = useContext(GraphContext);
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
							backgroundColor: `hsl(${hue}deg ${
								dark ? "100%" : "80%"
							} ${getLightnessFromAmount(
								tileStats.amount,
								maximumMeasurement,
								dark
							)}%)`,
							borderColor: isSameDay(
								dateToHighlight,
								new Date(timeStamp)
							)
								? dark
									? `hsl(${hue}deg 100% 50%)`
									: `hsl(${hue}deg 100% 20%)`
								: dark
								? `hsl(${hue}deg 100% 8%)`
								: `hsl(${hue}deg 50% 70%)`,
						}}
						onClick={() => {
							const todayDate = addDays(new Date(), 1);
							todayDate.setHours(0, 0, 0, 0);
							if (todayDate > new Date(timeStamp)) {
								setOpen(true);
								return;
							}
							toast({
								title: "Uh...",
								description:
									"You are not allowed to add stuff to the future dates",
								variant: "destructive",
								duration: 2000,
							});
						}}
					>
						<TooltipTrigger className="w-full h-full duration-0"></TooltipTrigger>
					</DialogTrigger>
					<TooltipContent
						style={{
							// backgroundColor: `hsl(${graphState.hue}deg, 20%, 10%)`,
							// boxShadow: `0px 0px 5px 0.2px hsl(${hue}deg, 50%, 50%)`,
							borderColor: `hsl(${graphState.hue}deg, 100%, 20%)`,
							// color: `hsl(${graphState.hue}deg 50% 50%)`,
						}}
						side="right"
					>
						<p>
							{graphState.title}: {tileStats.amount} on{" "}
							{new Date(timeStamp).toDateString().slice(4)}
						</p>
						{tileStats.note && tileStats.note !== "<p></p>" && (
							<div
								className="prose dark:prose-invert mt-4"
								dangerouslySetInnerHTML={{
									__html: tileStats.note,
								}}
							></div>
						)}
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

function getLightnessFromAmount(
	amount: number,
	maximum: number,
	isDark?: boolean
) {
	// This function converts any given amount to a lightnes percentage between 0 to 70%.
	// Say someone tracks number of steps, maximum number of steps he has ever taken are 5000. If he walks 3000 steps on a day, then the tile corresponding to that day will have lightness value = (3000/5000)*70

	if (amount === 0) return isDark ? 0 : 98;
	if (maximum === 0) return 50;
	const lightness = (amount / maximum) * 50;

	return lightness;
}

export default GraphWithDetails;
