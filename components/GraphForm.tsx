"use client";
import { Info } from "lucide-react";
import React, { Dispatch, SetStateAction, useContext, useRef } from "react";
import { Button } from "./ui/button";
import {
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useState } from "react";
import { GraphContext, GraphState } from "@/app/contexts/GraphContext";
import { ColorPicker } from "./ColorPicker";

function GraphForm({
	setOpen,
	graphState,
}: {
	setOpen: Dispatch<SetStateAction<boolean>>;
	graphState?: GraphState;
}) {
	const [measurementType, setMeasurementType] = useState<"ratio" | "ordinal">(
		graphState?.measurementType || "ratio"
	);
	const [hue, setHue] = useState(0);
	const titleRef = useRef<HTMLInputElement>(null);
	const minimumRef = useRef<HTMLInputElement>(null);
	const maximumRef = useRef<HTMLInputElement>(null);

	const { refreshGraphs } = useContext(GraphContext);

	const onSave = () => {
		const timeStamp = Date.now();
		const newGraphKey = `graph-${timeStamp}`;
		const graphDetails: Partial<GraphState> = {
			title: titleRef.current?.value || "No Title",
			hue,
			measurementType,
			minimum:
				measurementType === "ordinal"
					? parseInt(minimumRef.current?.value || "1")
					: undefined,
			maximum:
				measurementType === "ordinal"
					? parseInt(maximumRef.current?.value || "5")
					: undefined,
			timeStamp: timeStamp,
			key: graphState?.key || newGraphKey,
		};

		if (graphDetails.measurementType === "ratio") {
			graphDetails["maximumTillNow"] = 0;
		}

		localStorage.setItem(
			graphState?.key || newGraphKey,
			JSON.stringify(graphDetails)
		);

		setOpen(false);
		refreshGraphs();
	};
	return (
		<>
			<DialogHeader>
				<DialogTitle>Graph Details</DialogTitle>
				<DialogDescription>
					{`Click save when you're done`}
				</DialogDescription>
			</DialogHeader>

			<div className="grid gap-4 py-4">
				<div className="grid grid-cols-4 items-center gap-4">
					<Label htmlFor="title" className="text-left">
						Graph Title
					</Label>
					<Input
						id="title"
						defaultValue={
							graphState?.title || "Number of Pomodoros"
						}
						className="col-span-3"
						ref={titleRef}
					/>
				</div>
				<ColorPicker setHue={setHue} hue={graphState?.hue} />

				<div className="grid grid-cols-8 items-center gap-4">
					<Label
						htmlFor="measurement"
						className="text-left col-span-4 flex items-start"
					>
						What type of measurement is it?
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<Info size={20} />
								</TooltipTrigger>
								<TooltipContent
									className="w-96 text-lighttext"
									side="left"
								>
									{`Say you decide to track number of pomodoros.
									This can be measured exactly for eg. "10
									pomodoros". If you decide to track "Quality
									of meditation", you can't assign a number to
									it. The best you can do is assign a rating
									out of 5, 10 whatever. Therefore, "Number of
									pomodoros" is a measurement of type "ratio",
									while quality of meditation is measurement
									of type "Ordinal"`}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</Label>
					<RadioGroup
						defaultValue={graphState?.measurementType || "ratio"}
						className="flex col-span-4 justify-end gap-5"
						onValueChange={(e) => setMeasurementType(e as any)}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="ratio" id="ratio" />
							<Label htmlFor="ratio">Ratio</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="ordinal" id="ordinal" />
							<Label htmlFor="ordinal">Ordinal</Label>
						</div>
					</RadioGroup>
				</div>

				{measurementType === "ordinal" && (
					<>
						<div className="grid grid-cols-8 items-center gap-4">
							<Label className="col-span-4">
								{" "}
								Minimum measurement
							</Label>
							<Input
								type="number"
								className="col-span-4"
								defaultValue={
									(graphState?.measurementType ===
										"ordinal" &&
										graphState.minimum) ||
									0
								}
								ref={minimumRef}
							/>
						</div>
						<div className="grid grid-cols-8 items-center gap-4">
							<Label className="col-span-4">
								{" "}
								Maximum measurement
							</Label>
							<Input
								type="number"
								className="col-span-4"
								defaultValue={
									(graphState?.measurementType ===
										"ordinal" &&
										graphState.maximum) ||
									10
								}
								ref={maximumRef}
							/>
						</div>
					</>
				)}
			</div>
			<DialogFooter>
				<Button type="submit" onClick={onSave}>
					Save changes
				</Button>
			</DialogFooter>
		</>
	);
}

export default GraphForm;
