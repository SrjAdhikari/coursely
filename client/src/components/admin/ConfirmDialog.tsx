//* src/components/admin/ConfirmDialog.tsx

import { Trash2 } from "lucide-react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
	itemType: string;
	itemName: string;
	onConfirm: () => void;
	onClose: () => void;
}

/**
 * Confirmation before permanently deleting an admin resource (course, section,
 * lesson). Centered destructive icon with copy derived from the item. Parent-
 * conditionally mounted, so it is always open while rendered. Confirming runs
 * `onConfirm` and closes immediately (the call site reports the result via a
 * toast); `onClose` also fires on cancel/dismiss.
 */
const ConfirmDialog = ({
	itemType,
	itemName,
	onConfirm,
	onClose,
}: ConfirmDialogProps) => (
	<AlertDialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
		<AlertDialogContent>
			<AlertDialogHeader>
				<div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-destructive/10">
					<Trash2 aria-hidden className="size-5 text-destructive" />
				</div>
				<AlertDialogTitle>Delete {itemType}?</AlertDialogTitle>
				<AlertDialogDescription>
					This will permanently delete{" "}
					<span className="font-medium text-foreground">{itemName}</span>.
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel size="lg">Cancel</AlertDialogCancel>
				<AlertDialogAction variant="destructive" size="lg" onClick={onConfirm}>
					Delete
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
);

export default ConfirmDialog;
