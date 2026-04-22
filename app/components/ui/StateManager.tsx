import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transitionState } from "~/lib/api/states";
import type { StatefulAttributes } from "~/lib/api/types";

/**
 * Color and label configuration per state action.
 * Covers all states used across forms, pages, products, and websites.
 */
const STATE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  draft:     { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200', label: 'Draft' },
  published: { bg: 'bg-green-100 dark:bg-green-900',  text: 'text-green-800 dark:text-green-200',  label: 'Published' },
  active:    { bg: 'bg-green-100 dark:bg-green-900',  text: 'text-green-800 dark:text-green-200',  label: 'Active' },
  archived:  { bg: 'bg-gray-100 dark:bg-gray-800',    text: 'text-gray-800 dark:text-gray-200',    label: 'Archived' },
};

interface StateManagerProps {
  /** Plural entity type for the API route (e.g., 'pages', 'forms', 'products', 'websites') */
  entityType: string;
  /** Entity UUID */
  entityId: string;
  /** Current stateful attributes from the entity */
  stateAttrs: StatefulAttributes;
  /** React Query cache keys to invalidate after a transition */
  invalidateKeys?: readonly unknown[][];
  /** Optional callback after successful transition */
  onTransition?: () => void;
  /** Layout: 'inline' for compact row, 'full' for card-style */
  layout?: 'inline' | 'full';
}

/**
 * Reusable state management component.
 * Shows the current state badge and available transition buttons.
 * Works with any entity that includes Government::Stateful on the backend.
 */
export default function StateManager({
  entityType,
  entityId,
  stateAttrs,
  invalidateKeys = [],
  onTransition,
  layout = 'inline',
}: StateManagerProps) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (targetState: string) => transitionState(entityType, entityId, targetState),
    onSuccess: () => {
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key as readonly unknown[] });
      });
      onTransition?.();
      setConfirming(null);
    },
  });

  const currentState = stateAttrs.state;
  const transitions = stateAttrs.transitions || [];
  const isTransitioning = !!stateAttrs.transitioning || mutation.isPending;
  const config = STATE_CONFIG[currentState?.action || ''] || STATE_CONFIG.draft;

  const handleTransition = (targetAction: string) => {
    // Destructive transitions (archive) require confirmation
    if (targetAction === 'archived' && confirming !== targetAction) {
      setConfirming(targetAction);
      return;
    }
    mutation.mutate(targetAction);
  };

  if (layout === 'full') {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Status</h3>
        </div>
        <div className="p-6">
          {/* Current state */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">Current:</span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {currentState?.name || config.label}
              </span>
            </div>
            {stateAttrs.state_changed_at && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Changed {new Date(stateAttrs.state_changed_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Transitions */}
          {transitions.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Transition to
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {transitions.map((t) => {
                  const targetConfig = STATE_CONFIG[t.action] || { label: t.name };
                  const isArchive = t.action === 'archived';
                  const isConfirming = confirming === t.action;

                  return (
                    <button
                      key={t.action}
                      onClick={() => handleTransition(t.action)}
                      disabled={isTransitioning}
                      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                        isConfirming
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : isArchive
                          ? 'border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : t.action === 'published' || t.action === 'active'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {isTransitioning && mutation.variables === t.action ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Transitioning...
                        </span>
                      ) : isConfirming ? (
                        'Confirm Archive?'
                      ) : (
                        targetConfig.label || t.name
                      )}
                    </button>
                  );
                })}
                {confirming && (
                  <button
                    onClick={() => setConfirming(null)}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {transitions.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">No transitions available from this state.</p>
          )}

          {mutation.isError && (
            <p className="mt-3 text-xs text-red-600 dark:text-red-400">
              Transition failed. {(mutation.error as Error)?.message || 'Please try again.'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Inline layout
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {currentState?.name || config.label}
      </span>

      {transitions.map((t) => {
        const targetConfig = STATE_CONFIG[t.action] || { label: t.name };
        const isArchive = t.action === 'archived';
        const isConfirming = confirming === t.action;

        return (
          <button
            key={t.action}
            onClick={() => handleTransition(t.action)}
            disabled={isTransitioning}
            className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-50 ${
              isConfirming
                ? 'bg-red-600 text-white'
                : isArchive
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                : t.action === 'published' || t.action === 'active'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {isTransitioning && mutation.variables === t.action ? '...' : isConfirming ? 'Confirm?' : targetConfig.label || t.name}
          </button>
        );
      })}

      {confirming && (
        <button onClick={() => setConfirming(null)} className="text-xs text-gray-400 underline">
          Cancel
        </button>
      )}
    </div>
  );
}

/** Standalone badge for displaying state without transitions */
export function StateBadge({ state }: { state: StatefulAttributes['state'] }) {
  const config = STATE_CONFIG[state?.action || ''] || STATE_CONFIG.draft;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {state?.name || config.label}
    </span>
  );
}
