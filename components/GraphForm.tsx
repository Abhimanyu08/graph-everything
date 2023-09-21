"use client";
import { Info } from "lucide-react";
import React, { useEffect, useRef } from "react";
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

function ColorPicker() {
	const [left, setLeft] = useState(-5);
	const [containerLeft, setContainerLeft] = useState<number | null>(null);
	const [containerWidth, setContainerWidth] = useState<number | null>(null);
	const pickerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		setContainerLeft(
			pickerRef.current?.getBoundingClientRect().left || null
		);
		setContainerWidth(pickerRef.current?.clientWidth || null);
	}, []);
	return (
		<div className="grid grid-cols-6  items-center gap-4">
			<Label htmlFor="name" className="text-left  col-span-2">
				Graph theme color:
			</Label>
			<div
				className="w-[180px] h-4  flex  relative col-span-3"
				ref={pickerRef}
			>
				<div
					draggable
					className="rounded-full h-5 w-5 absolute  border-white border-2 "
					onDragStart={(e) => {
						e.dataTransfer.setData("text/plain", "");
						e.dataTransfer.setDragImage(new Image(), 0, 0);
					}}
					onDragCapture={(e) => {
						if (e.clientX === 0) return;
						if (!containerLeft || !containerWidth) return;
						const newLeft = Math.max(
							-5,
							Math.min(
								e.clientX - containerLeft,
								containerWidth - 5
							)
						);
						e.currentTarget.style.left = `${newLeft}px`;
						const deg = Math.round(newLeft * 2);
						e.currentTarget.style.backgroundColor = `hsl(${deg}deg 100% 50%)`;
						setLeft(newLeft);
					}}
					style={{
						backgroundColor: `hsl(${Math.round(
							left * 2
						)}deg 100% 50%)`,
						top: "-2px",
						left: `${left}px`,
					}}
				></div>
				{Array.from({ length: 360 }).map((_, i) => {
					return (
						<div
							className="h-full w-[0.5px]"
							style={{
								backgroundColor: `hsl(${i}deg 100% 50%)`,
							}}
							onClick={(e) => {
								if (!containerLeft) return;
								setLeft(e.clientX - containerLeft);
							}}
						></div>
					);
				})}
			</div>
			<div
				className="rounded-full h-10 w-10"
				style={{
					backgroundColor: `hsl(${Math.round(left * 2)}deg 100% 50%)`,
				}}
			></div>
		</div>
	);
}

function GraphForm() {
	const [mtype, setMtype] = useState<"ratio" | "ordinal">("ratio");
	return (
		<>
			<DialogHeader>
				<DialogTitle>Graph Details</DialogTitle>
				<DialogDescription>
					Click save when you're done
				</DialogDescription>
			</DialogHeader>

			<div className="grid gap-4 py-4">
				<div className="grid grid-cols-4 items-center gap-4">
					<Label htmlFor="name" className="text-left">
						Graph Title
					</Label>
					<Input
						id="name"
						defaultValue="Number of Pomodoros"
						className="col-span-3"
					/>
				</div>
				<ColorPicker />
				<div className="grid grid-cols-8 items-center gap-4">
					<Label htmlFor="username" className="text-left col-span-4">
						How often would you track this thing?
					</Label>
					<Select defaultValue="daily">
						<SelectTrigger className="col-span-4">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="daily" defaultChecked>
								Every day
							</SelectItem>
							<SelectItem value="weekly">Every week</SelectItem>
							<SelectItem value="monthly">Every Month</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="grid grid-cols-8 items-center gap-4">
					<Label
						htmlFor="name"
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
									Say you decide to track number of pomodoros.
									This can be measured exactly for eg. "10
									pomodoros". If you decide to track "Quality
									of meditation", you can't assign a number to
									it. The best you can do is assign a rating
									out of 5, 10 whatever. Therefore, "Number of
									pomodoros" is a measurement of type "ratio",
									while quality of meditation is measurement
									of type "Ordinal"
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</Label>
					<RadioGroup
						defaultValue="ratio"
						className="flex col-span-4 justify-end gap-5"
						onValueChange={(e) => setMtype(e as any)}
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

				{mtype === "ordinal" && (
					<>
						<div className="grid grid-cols-8 items-center gap-4">
							<Label className="col-span-4">
								{" "}
								Minimum measurement
							</Label>
							<Input
								type="number"
								className="col-span-4"
								defaultValue={0}
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
								defaultValue={10}
							/>
						</div>
					</>
				)}
			</div>
			<DialogFooter>
				<Button type="submit">Save changes</Button>
			</DialogFooter>
		</>
	);
}

export default GraphForm;