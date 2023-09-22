import { StoredTile, Tile } from "@/app/contexts/GraphContext";
import React, { useContext, useEffect, useState } from "react";
import { Input } from "./ui/input";
import Tiptap from "./Tiptap";
import { Button } from "./ui/button";
import { Editor } from "@tiptap/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { IndexedDbContext } from "@/app/contexts/IndexedDbContext";

function GraphTileEditor({ tile }: { tile: Tile }) {
	const [amount, setAmount] = useState(tile.stats?.amount || null);
	const { documentDb } = useContext(IndexedDbContext);

	const editor = useEditor({
		extensions: [StarterKit],
		content: tile.stats?.note || "",
		editorProps: {
			attributes: {
				class: "h-full p-2 ",
			},
		},
	});
	useEffect(() => {
		return () => {
			editor?.destroy();
		};
	}, []);

	const onSave = () => {
		if (!documentDb) return;

		const timeStamp = tile.stats?.timeStamp || tile.timeStamp!;
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
		if (tile.refreshTile) {
			tile.refreshTile();
		}
	};

	return (
		<div className="flex flex-col p-4 gap-4 h-full">
			<h1>
				{tile.graphTitle} - {new Date(tile.timeStamp!).toDateString()}
			</h1>
			{tile.measurementType === "ordinal" ? (
				<Input
					type="number"
					min={tile.minimum}
					max={tile.maximum}
					className="w-fit"
					value={amount || undefined}
					onChange={(e) => setAmount(parseInt(e.currentTarget.value))}
				/>
			) : (
				<Input
					type="number"
					className="w-fit"
					value={amount || undefined}
					onChange={(e) => setAmount(parseInt(e.currentTarget.value))}
				/>
			)}
			<EditorContent
				editor={editor}
				className="grow border-border border-[1px] p-2 rounded-sm prose prose-invert prose-p:m-0"
			/>
			<Button className="self-end w-fit" onClick={onSave}>
				Save Changes
			</Button>
		</div>
	);
}

export default GraphTileEditor;
