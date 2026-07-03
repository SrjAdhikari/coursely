//* src/components/dashboard/OverallProgressCard.tsx

interface OverallProgressCardProps {
	percent: number;
	completed: number;
	total: number;
}

const OverallProgressCard = ({
	percent,
	completed,
	total,
}: OverallProgressCardProps) => (
	<div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-6 text-center">
		<span className="text-xs uppercase tracking-wide text-muted-foreground">
			Overall progress
		</span>

		<div
			className="relative grid size-32 place-items-center"
			role="img"
			aria-label={`${percent}% of your library complete`}
		>
			{/* Lime arc on its own masked layer so the centered label stays visible. */}
			<div
				className="absolute inset-0 rounded-full"
				style={{
					background: `conic-gradient(var(--primary) ${percent}%, var(--border) 0)`,
					WebkitMask:
						"radial-gradient(farthest-side, transparent calc(100% - 12px), #000 calc(100% - 11px))",
					mask: "radial-gradient(farthest-side, transparent calc(100% - 12px), #000 calc(100% - 11px))",
				}}
			/>

			<div className="relative">
				<span className="block font-heading text-3xl font-bold leading-none">
					{percent}%
				</span>
				<span className="mt-1 block text-[9px] uppercase tracking-wide text-muted-foreground">
					of your library
				</span>
			</div>
		</div>

		<p className="text-xs text-muted-foreground">
			{completed} / {total} lessons completed
		</p>
	</div>
);

export default OverallProgressCard;
