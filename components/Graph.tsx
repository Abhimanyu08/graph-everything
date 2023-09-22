import { GraphContext, GraphState } from "@/app/contexts/GraphContext";
import { addDays } from "date-fns";
import React, { useContext } from "react";

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
	const currentDate = new Date();
	return (
		<div className="w-[768px] h-fit  grid grid-cols-37  grid-rows-10  gap-[2px]  grid-flow-col">
			{Array.from({ length: 365 }).map((_, i) => {
				return (
					<GraphTile
						graphState={graphState}
						dateString={addDays(currentDate, i)
							.toString()
							.slice(3, 16)}
					/>
				);
			})}
		</div>
	);
}

function GraphTile({
	graphState,
	dateString,
}: {
	graphState: GraphState;
	dateString: string;
}) {
	const { hue, title, measurementType } = graphState;
	let minimum: number, maximum: number;
	if (measurementType === "ordinal") {
		minimum = graphState.minimum;
		maximum = graphState.maximum;
	}
	const { setEditingTile } = useContext(GraphContext);
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
			onClick={() =>
				setEditingTile({
					dateString,
					graphTitle: title,
					measurementType,
					maximum: maximum || 0,
					minimum: minimum || 0,
				})
			}
		></div>
	);
}

export default GraphWithDetails;
