import {
	GraphContext,
	GraphState,
	StoredTile,
} from "@/app/contexts/GraphContext";
import { IndexedDbContext } from "@/app/contexts/IndexedDbContext";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useContext, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { DialogContent, DialogHeader } from "./ui/dialog";

function GraphTileEditor({
	graph,
	tile,
	closeEditor,
}: {
	graph: GraphState;
	tile: StoredTile;
	closeEditor: () => void;
}) {
	const [amount, setAmount] = useState<number>(0);
	const { documentDb } = useContext(IndexedDbContext);
	const { refreshGraphs } = useContext(GraphContext);

	const editor = useEditor(
		{
			extensions: [StarterKit],
			content: tile?.note || "",
			editorProps: {
				attributes: {
					class: "h-full p-2 ",
				},
			},
		},
		[tile]
	);
	useEffect(() => {
		setAmount(tile?.amount || 0);
		return () => {
			editor?.destroy();
		};
	}, [tile]);

	const onSave = () => {
		if (!documentDb || !tile || !graph) return;

		const timeStamp = tile.timeStamp!;
		const tileObjectStore = documentDb
			.transaction("tile", "readwrite")
			.objectStore("tile");
		const tileDetails: StoredTile = {
			timeStamp,
			graphTitle: tile.graphTitle,
			amount: amount || 0,
			note: editor?.getHTML() || "",
		};
		tileObjectStore.put(tileDetails);
		if (graph.measurementType === "ratio") {
			if (graph.maximumTillNow < (amount || 0)) {
				refreshGraphs();
			} else {
				if (graph.maximumTillNow === tile.amount) {
					refreshGraphs();
					// user is editing the amount which was previously the maximum and has set it to a lower value. So we need to rescan all the tiles and see which one is maximum.
				}
			}
		}
		if (tile.refreshTile) {
			tile.refreshTile();
		}
		closeEditor();
	};

	return (
		<DialogContent
			className="flex flex-col p-4 gap-6  border-[1px]"
			style={{
				backgroundColor: `hsl(${graph.hue}deg, 20%, 10%)`,
				// boxShadow: `0px 0px 5px 0.2px hsl(${hue}deg, 50%, 50%)`,
				borderColor: `hsl(${graph.hue}deg, 100%, 20%)`,
				color: `hsl(${graph.hue}deg 50% 50%)`,
			}}
			onClick={closeEditor}
		>
			<DialogHeader className="ml-1 text-2xl font-serif mb-5">
				{new Date(tile.timeStamp!).toDateString()}
			</DialogHeader>
			<div className="flex flex-col gap-2">
				<Label htmlFor="amount" className="ml-1">
					{tile.graphTitle} :
				</Label>
				{graph.measurementType === "ordinal" ? (
					<Input
						id="amount"
						type="number"
						min={graph.minimum}
						max={graph.maximum}
						className="w-fit"
						value={amount}
						onChange={(e) =>
							setAmount(parseInt(e.currentTarget.value))
						}
						style={{
							backgroundColor: `hsl(${graph.hue}deg, 50%, 5%)`,
						}}
					/>
				) : (
					<Input
						id="amount"
						type="number"
						className="w-fit"
						value={amount}
						onChange={(e) =>
							setAmount(parseInt(e.currentTarget.value))
						}
						style={{
							backgroundColor: `hsl(${graph.hue}deg, 50%, 5%)`,
						}}
					/>
				)}
			</div>
			<div className="flex flex-col gap-2">
				<Label className="ml-1">Note:</Label>
				<EditorContent
					editor={editor}
					className="grow border-border border-[1px]  rounded-sm prose prose-invert prose-p:m-0"
					style={{
						backgroundColor: `hsl(${graph.hue}deg, 50%, 5%)`,
					}}
				/>
			</div>
			<Button
				className="self-end w-fit"
				size={"sm"}
				onClick={onSave}
				variant={"outline"}
			>
				Save Changes
			</Button>
		</DialogContent>
	);
}

export default GraphTileEditor;
