'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, ChevronDown } from 'lucide-react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { getEvalBySlug } from '@/lib/evals/registry';
import type { Task, RunData, Comparison } from '@/components/run-detail';

interface RunSummary {
  id: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  taskCount: number;
  passedCount: number;
  failedCount: number;
}

function statusDotColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'failed':
      return 'bg-red-500';
    case 'running':
      return 'bg-yellow-500 animate-pulse';
    default:
      return 'bg-muted-foreground';
  }
}

function formatDuration(ms: number | null): string {
  if (ms == null) return '—';
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

function formatRunDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function aggregateStatus(tasks: Task[]): string {
  if (tasks.some((t) => t.status === 'running')) return 'running';
  if (tasks.some((t) => t.status === 'pending')) return 'pending';
  if (tasks.every((t) => t.status === 'completed')) return 'completed';
  if (tasks.some((t) => t.status === 'failed')) return 'failed';
  return 'completed';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const runMatch = pathname.match(/^\/runs\/([^/]+)/);
  const evalMatch = pathname.match(/^\/runs\/[^/]+\/evals\/([^/]+)/);
  const compareMatch = pathname.match(/^\/runs\/[^/]+\/compare\/([^/]+)/);
  const selectedRunId =
    runMatch?.[1] === 'new' ? null : (runMatch?.[1] ?? null);
  const selectedTaskId = evalMatch?.[1] ?? null;
  const selectedComparisonId = compareMatch?.[1] ?? null;

  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [runDataMap, setRunDataMap] = useState<Record<string, RunData>>({});
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const lastAutoExpandedRunId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const res = await fetch('/api/runs');
      if (res.ok && !cancelled) setRuns(await res.json());
    };
    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!selectedRunId) return;
    let cancelled = false;
    const load = async () => {
      const res = await fetch(`/api/runs/${selectedRunId}`);
      if (res.ok && !cancelled) {
        const data: RunData = await res.json();
        setRunDataMap((prev) => ({ ...prev, [selectedRunId]: data }));
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedRunId]);

  useEffect(() => {
    if (!selectedRunId) return;
    const runData = runDataMap[selectedRunId];
    if (!runData || lastAutoExpandedRunId.current === selectedRunId) return;
    lastAutoExpandedRunId.current = selectedRunId;
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(`run-${selectedRunId}`);
      if (selectedTaskId) {
        const task = runData.tasks.find((t) => t.id === selectedTaskId);
        if (task) next.add(`model-${selectedRunId}-${task.model}`);
      }
      return next;
    });
  }, [selectedRunId, selectedTaskId, runDataMap]);

  const fetchRunData = useCallback(async (id: string) => {
    const res = await fetch(`/api/runs/${id}`);
    if (res.ok) {
      const data: RunData = await res.json();
      setRunDataMap((prev) => ({ ...prev, [id]: data }));
    }
  }, []);

  const handleToggle = useCallback(
    (key: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
          if (key.startsWith('run-')) {
            const expandedRunId = key.slice(4);
            if (!runDataMap[expandedRunId]) fetchRunData(expandedRunId);
          }
        }
        return next;
      });
    },
    [runDataMap, fetchRunData],
  );

  const handleSelectTask = useCallback(
    (taskRunId: string, taskId: string) => {
      router.push(`/runs/${taskRunId}/evals/${taskId}`, { scroll: false });
    },
    [router],
  );

  const handleSelectComparison = useCallback(
    (compRunId: string, comparisonId: string) => {
      router.push(`/runs/${compRunId}/compare/${comparisonId}`, {
        scroll: false,
      });
    },
    [router],
  );

  return (
    <ResizablePanelGroup orientation="horizontal" id="app-layout">
      <ResizablePanel
        id="sidebar"
        defaultSize="25%"
        minSize="15%"
        maxSize="40%"
      >
        <TaskTree
          runs={runs}
          runDataMap={runDataMap}
          selectedRunId={selectedRunId}
          selectedTaskId={selectedTaskId}
          selectedComparisonId={selectedComparisonId}
          expanded={expanded}
          onToggle={handleToggle}
          onSelect={handleSelectTask}
          onSelectComparison={handleSelectComparison}
        />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="content" defaultSize="75%" minSize="50%">
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function TaskTree({
  runs,
  runDataMap,
  selectedRunId,
  selectedTaskId,
  selectedComparisonId,
  expanded,
  onToggle,
  onSelect,
  onSelectComparison,
}: {
  runs: RunSummary[];
  runDataMap: Record<string, RunData>;
  selectedRunId: string | null;
  selectedTaskId: string | null;
  selectedComparisonId: string | null;
  expanded: Set<string>;
  onToggle: (key: string) => void;
  onSelect: (runId: string, taskId: string) => void;
  onSelectComparison: (runId: string, comparisonId: string) => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto text-sm">
      {runs.map((run) => {
        const runKey = `run-${run.id}`;
        const isRunExpanded = expanded.has(runKey);
        const runData = runDataMap[run.id];
        const isActiveRun = run.id === selectedRunId;

        const modelGroups = new Map<string, Task[]>();
        if (runData) {
          for (const task of runData.tasks) {
            const list = modelGroups.get(task.model);
            if (list) list.push(task);
            else modelGroups.set(task.model, [task]);
          }
        }

        return (
          <div key={run.id} className="border-b last:border-b-0">
            <button
              type="button"
              onClick={() => onToggle(runKey)}
              className={`w-full text-left px-3 py-2 transition-colors cursor-pointer hover:bg-accent/50 flex items-center gap-2 ${
                isActiveRun && !selectedTaskId ? 'bg-accent/30' : ''
              }`}
            >
              {isRunExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">
                    {formatRunDate(run.createdAt)}
                  </span>
                  <span
                    className={`inline-block h-2 w-2 rounded-full shrink-0 ${statusDotColor(run.status)}`}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {run.passedCount}P / {run.failedCount}F / {run.taskCount}{' '}
                  total
                </div>
              </div>
            </button>

            {isRunExpanded &&
              runData &&
              Array.from(modelGroups.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([model, tasks]) => {
                  const modelKey = `model-${run.id}-${model}`;
                  const isModelExpanded = expanded.has(modelKey);
                  const shortModel = model.split('/').pop() ?? model;
                  const modelStatus = aggregateStatus(tasks);
                  const modelPassed = tasks.filter(
                    (t) => t.status === 'completed',
                  ).length;
                  const modelFailed = tasks.filter(
                    (t) => t.status === 'failed',
                  ).length;

                  return (
                    <div key={modelKey}>
                      <button
                        type="button"
                        onClick={() => onToggle(modelKey)}
                        className="w-full text-left pl-7 pr-3 py-1.5 transition-colors cursor-pointer hover:bg-accent/50 flex items-center gap-2"
                      >
                        {isModelExpanded ? (
                          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                        )}
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${statusDotColor(modelStatus)}`}
                        />
                        <span className="text-xs font-mono truncate">
                          {shortModel}
                        </span>
                        <span className="ml-auto text-[10px] text-muted-foreground font-mono shrink-0">
                          {modelPassed}P
                          {modelFailed > 0 ? ` / ${modelFailed}F` : ''}
                        </span>
                      </button>

                      {isModelExpanded &&
                        [...tasks]
                          .sort((a, b) => a.evalName.localeCompare(b.evalName))
                          .map((task) => {
                            const def = getEvalBySlug(task.evalName);
                            const isSelected =
                              selectedTaskId === task.id &&
                              selectedRunId === run.id;

                            return (
                              <button
                                key={task.id}
                                type="button"
                                onClick={() => onSelect(run.id, task.id)}
                                className={`w-full text-left pl-14 pr-3 py-1.5 transition-colors cursor-pointer hover:bg-accent/50 flex items-center gap-2 ${
                                  isSelected ? 'bg-accent' : ''
                                }`}
                              >
                                <span
                                  className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${statusDotColor(task.status)}`}
                                />
                                <span className="text-xs truncate">
                                  {def?.name ?? task.evalName}
                                </span>
                                <span className="ml-auto text-[10px] text-muted-foreground font-mono shrink-0">
                                  {formatDuration(task.durationMs)}
                                </span>
                              </button>
                            );
                          })}
                    </div>
                  );
                })}

            {isRunExpanded &&
              runData &&
              runData.comparisons &&
              runData.comparisons.length > 0 && (
                <ComparisonTreeNode
                  runId={run.id}
                  comparisons={runData.comparisons}
                  expanded={expanded}
                  selectedComparisonId={selectedComparisonId}
                  selectedRunId={selectedRunId}
                  onToggle={onToggle}
                  onSelectComparison={onSelectComparison}
                />
              )}

            {isRunExpanded && !runData && (
              <div className="pl-7 py-3 text-xs text-muted-foreground">
                Loading…
              </div>
            )}
          </div>
        );
      })}
      {runs.length === 0 && (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No runs
        </div>
      )}
    </div>
  );
}

function ComparisonTreeNode({
  runId,
  comparisons,
  expanded,
  selectedComparisonId,
  selectedRunId,
  onToggle,
  onSelectComparison,
}: {
  runId: string;
  comparisons: Comparison[];
  expanded: Set<string>;
  selectedComparisonId: string | null;
  selectedRunId: string | null;
  onToggle: (key: string) => void;
  onSelectComparison: (runId: string, comparisonId: string) => void;
}) {
  const nodeKey = `compare-${runId}`;
  const isExpanded = expanded.has(nodeKey);

  const sorted = [...comparisons].sort((a, b) =>
    a.evalName.localeCompare(b.evalName),
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(nodeKey)}
        className="w-full text-left pl-7 pr-3 py-1.5 transition-colors cursor-pointer hover:bg-accent/50 flex items-center gap-2"
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
        <span className="inline-block h-1.5 w-1.5 rounded-full shrink-0 bg-blue-500" />
        <span className="text-xs font-medium truncate">Final Comparison</span>
        <span className="ml-auto text-[10px] text-muted-foreground font-mono shrink-0">
          {comparisons.length}
        </span>
      </button>

      {isExpanded &&
        sorted.map((comp) => {
          const def = getEvalBySlug(comp.evalName);
          const isSelected =
            selectedComparisonId === comp.id && selectedRunId === runId;
          const winnerShort =
            comp.winnerModel.split('/').pop() ?? comp.winnerModel;

          return (
            <button
              key={comp.id}
              type="button"
              onClick={() => onSelectComparison(runId, comp.id)}
              className={`w-full text-left pl-14 pr-3 py-1.5 transition-colors cursor-pointer hover:bg-accent/50 flex items-center gap-2 ${
                isSelected ? 'bg-accent' : ''
              }`}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full shrink-0 bg-blue-500" />
              <span className="text-xs truncate">
                {def?.name ?? comp.evalName}
              </span>
              <span className="ml-auto text-[10px] text-muted-foreground font-mono shrink-0">
                {winnerShort}
              </span>
            </button>
          );
        })}
    </div>
  );
}
