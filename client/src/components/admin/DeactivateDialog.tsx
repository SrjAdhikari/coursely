//* src/components/admin/DeactivateDialog.tsx

import { UserRoundX } from "lucide-react";

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

interface DeactivateDialogProps {
	studentName: string;
	onConfirm: () => void;
	onClose: () => void;
}

/**
 * Confirmation before deactivating a learner's account — destructive but
 * reversible (unlike a delete). Parent-conditionally mounted, so it is always
 * open while rendered. Confirming runs `onConfirm` and closes immediately (the
 * call site reports the result via a toast); `onClose` also fires on
 * cancel/dismiss.
 */
const DeactivateDialog = ({
	studentName,
	onConfirm,
	onClose,
}: DeactivateDialogProps) => (
	<AlertDialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
		<AlertDialogContent>
			<AlertDialogHeader>
				<div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-destructive/10">
					<UserRoundX aria-hidden className="size-5 text-destructive" />
				</div>

				<AlertDialogTitle>Deactivate account?</AlertDialogTitle>
				<AlertDialogDescription>
					<span className="font-medium text-foreground">{studentName}</span>{" "}
					will be signed out and unable to log in until an admin reactivates the
					account.
				</AlertDialogDescription>
			</AlertDialogHeader>

			<AlertDialogFooter>
				<AlertDialogCancel size="lg">Cancel</AlertDialogCancel>
				<AlertDialogAction variant="destructive" size="lg" onClick={onConfirm}>
					Deactivate
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
);

export default DeactivateDialog;
