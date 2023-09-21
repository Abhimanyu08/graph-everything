import React from "react";

function Graph() {
	const hue = Math.round(Math.random() * 360);

	return (
		<div className="w-[768px] h-[213.33px] grid grid-cols-37 grid-rows-10 bg-black gap-1  grid-flow-col">
			{Array.from({ length: 365 }).map(() => {
				return (
					<div
						style={{
							// backgroundColor: hslToHex(
							// 	hue,
							// 	100,
							// 	Math.round(Math.max(0.1, Math.random()) * 50)
							// ),
							backgroundColor: `hsl(${hue}deg 100% ${Math.round(
								Math.max(0.1, Math.random()) * 50
							)}%)`,
						}}
					></div>
				);
			})}
		</div>
	);
}

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
export default Graph;
