"use client";
import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { Label } from "./ui/label";
import { useState } from "react";

export function ColorPicker({
	setHue,
	hue,
}: {
	setHue: Dispatch<SetStateAction<number>>;
	hue?: number;
}) {
	const [left, setLeft] = useState(hue ? Math.round(hue / 2) : -5);
	const [containerLeft, setContainerLeft] = useState<number | null>(null);
	const [containerWidth, setContainerWidth] = useState<number | null>(null);
	const pickerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		setHue(Math.max(0, Math.round(left * 2)));
		if (containerLeft === null || containerWidth === null) {
			setContainerLeft(
				pickerRef.current?.getBoundingClientRect().left || null
			);
			setContainerWidth(pickerRef.current?.clientWidth || null);
		}
	}, [left]);
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
							key={i}
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
