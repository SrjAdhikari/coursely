//* src/hooks/usePayments.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import { createCheckout, getCheckoutStatus } from "@/api/payments.api";
import { checkoutStatusKey } from "@/lib/queryKeys";

/** Create a hosted-Checkout session. */
const useCreateCheckout = () => useMutation({ mutationFn: createCheckout });

/**
 * Reconcile a checkout session (success page). `poll` drives a refetch interval
 * while the payment is still settling; polling stops automatically once the
 * session reconciles as enrolled, and the page turns `poll` off at its retry
 * deadline.
 */
const useCheckoutStatus = (sessionId: string, poll: boolean) =>
	useQuery({
		queryKey: checkoutStatusKey(sessionId),
		queryFn: () => getCheckoutStatus(sessionId),
		enabled: !!sessionId,
		retry: false,
		refetchInterval: (query) =>
			poll && !query.state.data?.data.enrolled ? 1500 : false,
	});

export { useCreateCheckout, useCheckoutStatus };
