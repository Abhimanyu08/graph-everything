import { GraphState } from "@/app/GraphContext";
import React from "react";

function GraphWithDetails({ graphState }: { graphState: GraphState }) {
	const { hue, title, frequency, measurementType } = graphState;
	return (
		<div
			className="flex flex-col w-fit p-4 gap-4"
			style={{
				backgroundColor: `hsl(${hue}deg, 25%, 10%)`,
				boxShadow: `1px 1px 10px 0.2px ${hslToHex(hue, 50, 50)}`,
			}}
		>
			<h1
				className="font-serif text-xl"
				style={{ color: `hsl(${hue}deg 50% 50%)` }}
			>
				{title}
			</h1>
			<Graph graphState={graphState} />
		</div>
	);
}

function Graph({ graphState }: { graphState: GraphState }) {
	const { hue, title, frequency, measurementType } = graphState;
	return (
		<div className="w-[768px] h-fit rounded-sm grid grid-cols-37 grid-rows-10  gap-[2px]  grid-flow-col">
			{Array.from({ length: 365 }).map(() => {
				return (
					<div
						className="rounded-sm h-4"
						style={{
							backgroundColor: `hsl(${hue}deg 100% ${Math.round(
								Math.max(0.1, Math.random()) * 50
							)}%)`,
							// backgroundColor: `hsl(0deg 0% 10%)`,
						}}
					></div>
				);
			})}
		</div>
	);
}

function GraphVisual({ hue }: { hue: number }) {}

function hslToHex(h: number, s: number, l: number) {
	l /= 100;
	const a = (s * Math.min(l, 1 - l)) / 100;
	const f = (n: number) => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color)
			.toString(16)
			.padStart(2, "0"); // Convert to Hex and ensure 2 digits
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}
export default GraphWithDetails;
