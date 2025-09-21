# example 1
import { client } from '@/lib/client';
import { UpdateModelParams } from '@mastra/client-js';
import { usePlaygroundStore } from '@mastra/playground-ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAgents = () => {
  const { runtimeContext } = usePlaygroundStore();
  const query = useQuery({
    queryKey: ['agents', JSON.stringify(runtimeContext)],
    queryFn: () => client.getAgents(runtimeContext),
  });

  return {
    ...query,
    data: query.data ?? {},
  };
};

export const useAgent = (agentId: string) => {
  const { runtimeContext } = usePlaygroundStore();
  return useQuery({
    queryKey: ['agent', agentId, JSON.stringify(runtimeContext)],
    queryFn: () => client.getAgent(agentId).details(runtimeContext),
    enabled: !!agentId,
  });
};

export const useModelProviders = () => {
  return useQuery({
    queryKey: ['model-providers'],
    queryFn: () => client.getModelProviders(),
  });
};

export const useUpdateAgentModel = (agentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateModelParams) => client.getAgent(agentId).updateModel(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', agentId] });
    },
    onError: err => {
      console.error('Error updating model', err);
    },
  });
};

# example 2
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { toast } from 'sonner';
import { LegacyWorkflowRunResult, WorkflowWatchResult, GetWorkflowResponse } from '@mastra/client-js';
import type { LegacyWorkflow } from '@mastra/core/workflows/legacy';
import { useMastraClient } from '@/contexts/mastra-client-context';
import { useQuery } from '@tanstack/react-query';

export type ExtendedLegacyWorkflowRunResult = LegacyWorkflowRunResult & {
  sanitizedOutput?: string | null;
  sanitizedError?: {
    message: string;
    stack?: string;
  } | null;
};

export type ExtendedWorkflowWatchResult = WorkflowWatchResult & {
  sanitizedOutput?: string | null;
  sanitizedError?: {
    message: string;
    stack?: string;
  } | null;
};

export const useWorkflow = (workflowId: string) => {
  const client = useMastraClient();
  return useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => client.getWorkflow(workflowId).details(),
    retry: false,
  });
};

export const useLegacyWorkflow = (workflowId: string) => {
  const [legacyWorkflow, setLegacyWorkflow] = useState<LegacyWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const client = useMastraClient();

  useEffect(() => {
    const fetchWorkflow = async () => {
      setIsLoading(true);
      try {
        if (!workflowId) {
          setLegacyWorkflow(null);
          setIsLoading(false);
          return;
        }
        const res = await client.getLegacyWorkflow(workflowId).details();
        if (!res) {
          setLegacyWorkflow(null);
          console.error('Error fetching legacy workflow');
          toast.error('Error fetching legacy workflow');
          return;
        }
        const steps = res.steps;
        const stepsWithWorkflow = await Promise.all(
          Object.values(steps)?.map(async step => {
            if (!step.workflowId) return step;

            const wFlow = await client.getLegacyWorkflow(step.workflowId).details();

            if (!wFlow) return step;

            return { ...step, stepGraph: wFlow.stepGraph, stepSubscriberGraph: wFlow.stepSubscriberGraph };
          }),
        );
        const _steps = stepsWithWorkflow.reduce((acc, b) => {
          return { ...acc, [b.id]: b };
        }, {});
        setLegacyWorkflow({ ...res, steps: _steps } as LegacyWorkflow);
      } catch (error) {
        setLegacyWorkflow(null);
        console.error('Error fetching legacy workflow', error);
        toast.error('Error fetching legacy workflow');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, [workflowId]);

  return { legacyWorkflow, isLoading };
};

export const useExecuteWorkflow = () => {
  const client = useMastraClient();

  const createLegacyWorkflowRun = async ({ workflowId, prevRunId }: { workflowId: string; prevRunId?: string }) => {
    try {
      const workflow = client.getLegacyWorkflow(workflowId);
      const { runId: newRunId } = await workflow.createRun({ runId: prevRunId });
      return { runId: newRunId };
    } catch (error) {
      console.error('Error creating workflow run:', error);
      throw error;
    }
  };

  const startLegacyWorkflowRun = async ({
    workflowId,
    runId,
    input,
  }: {
    workflowId: string;
    runId: string;
    input: any;
  }) => {
    try {
      const workflow = client.getLegacyWorkflow(workflowId);
      await workflow.start({ runId, triggerData: input || {} });
    } catch (error) {
      console.error('Error starting workflow run:', error);
      throw error;
    }
  };

  return {
    startLegacyWorkflowRun,
    createLegacyWorkflowRun,
  };
};

export const useWatchWorkflow = () => {
  const [isWatchingLegacyWorkflow, setIsWatchingLegacyWorkflow] = useState(false);
  const [legacyWatchResult, setLegacyWatchResult] = useState<ExtendedLegacyWorkflowRunResult | null>(null);
  const client = useMastraClient();

  // Debounce the state update to prevent too frequent renders
  const debouncedSetLegacyWorkflowWatchResult = useDebouncedCallback((record: ExtendedLegacyWorkflowRunResult) => {
    // Sanitize and limit the size of large data fields
    const formattedResults = Object.entries(record.results || {}).reduce(
      (acc, [key, value]) => {
        let output = value.status === 'success' ? value.output : undefined;
        if (output) {
          output = Object.entries(output).reduce(
            (_acc, [_key, _value]) => {
              const val = _value as { type: string; data: unknown };
              _acc[_key] = val.type?.toLowerCase() === 'buffer' ? { type: 'Buffer', data: `[...buffered data]` } : val;
              return _acc;
            },
            {} as Record<string, any>,
          );
        }
        acc[key] = { ...value, output };
        return acc;
      },
      {} as Record<string, any>,
    );
    const sanitizedRecord: ExtendedLegacyWorkflowRunResult = {
      ...record,
      sanitizedOutput: record
        ? JSON.stringify({ ...record, results: formattedResults }, null, 2).slice(0, 50000) // Limit to 50KB
        : null,
    };
    setLegacyWatchResult(sanitizedRecord);
  }, 100);

  const watchLegacyWorkflow = async ({ workflowId, runId }: { workflowId: string; runId: string }) => {
    try {
      setIsWatchingLegacyWorkflow(true);

      const workflow = client.getLegacyWorkflow(workflowId);

      await workflow.watch({ runId }, record => {
        try {
          debouncedSetLegacyWorkflowWatchResult(record);
        } catch (err) {
          console.error('Error processing workflow record:', err);
          // Set a minimal error state if processing fails
          setLegacyWatchResult({
            ...record,
          });
        }
      });
    } catch (error) {
      console.error('Error watching workflow:', error);

      throw error;
    } finally {
      setIsWatchingLegacyWorkflow(false);
    }
  };

  return {
    watchLegacyWorkflow,
    isWatchingLegacyWorkflow,
    legacyWatchResult,
  };
};

export const useResumeWorkflow = () => {
  const [isResumingLegacyWorkflow, setIsResumingLegacyWorkflow] = useState(false);

  const client = useMastraClient();

  const resumeLegacyWorkflow = async ({
    workflowId,
    stepId,
    runId,
    context,
  }: {
    workflowId: string;
    stepId: string;
    runId: string;
    context: any;
  }) => {
    try {
      setIsResumingLegacyWorkflow(true);

      const response = await client.getLegacyWorkflow(workflowId).resume({ stepId, runId, context });

      return response;
    } catch (error) {
      console.error('Error resuming workflow:', error);
      throw error;
    } finally {
      setIsResumingLegacyWorkflow(false);
    }
  };

  return {
    resumeLegacyWorkflow,
    isResumingLegacyWorkflow,
  };
};

# example 3
// Hook for fetching agents with smart polling

import type { GetAgentResponse } from "@mastra/client-js";
//import clientLogger from '@/lib/logger'
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { getAgent } from "@/lib/ai/get-agent";
import { STALE_TIMES } from "@/lib/constants";

interface UseAgentResult {
	data: GetAgentResponse;
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
}

/**
 * @returns {UseAgentResult} React Query result object with typed data and status properties
 */
function useAgent(agentId: string, options = {}): UseAgentResult {
	const network = useNetworkStatus();
	const queryAgent = useServerFn(getAgent);

	const queryResult = useQuery({
		queryKey: ["agents", agentId],
		queryFn: async () => await queryAgent({ data: { agentId: agentId } }),
		staleTime: STALE_TIMES.RARE,
		refetchInterval: !network.isOffline ? STALE_TIMES.RARE : false,
		refetchIntervalInBackground: false,
		...(!network.isOffline &&
			network.effectiveType === "slow-2g" && {
				refetchInterval: STALE_TIMES.RARE,
			}),
		...options,
	});

	return {
		data: queryResult.data as GetAgentResponse,
		isLoading: queryResult.isLoading,
		isError: queryResult.isError,
		error: queryResult.error,
	};
}

export { useAgent };

# example 4 

import { client } from '@/lib/client';

import { RuntimeContext } from '@mastra/core/di';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

export interface ExecuteToolInput {
  agentId: string;
  toolId: string;
  input: any;
  playgroundRuntimeContext?: Record<string, any>;
}

export const useExecuteTool = () => {
  return useMutation({
    mutationFn: async ({ agentId, toolId, input, playgroundRuntimeContext }: ExecuteToolInput) => {
      const runtimeContext = new RuntimeContext();
      Object.entries(playgroundRuntimeContext ?? {}).forEach(([key, value]) => {
        runtimeContext.set(key, value);
      });
      try {
        const agent = client.getAgent(agentId);
        const response = await agent.executeTool(toolId, { data: input, runtimeContext });

        return response;
      } catch (error) {
        toast.error('Error executing agent tool');
        console.error('Error executing tool:', error);
        throw error;
      }
    },
  });
};

# example 5
import { useQuery, useMutation } from '@tanstack/react-query';
import { mastraApi, Message, AGENT_METADATA } from '../mastra-api';
import { AgentType } from '../stores/copilotStore';

// Query keys for React Query
const QUERY_KEYS = {
  agents: 'agents',
  agent: (agentId: string) => ['agent', agentId],
  agentMetadata: 'agentMetadata',
};

/**
 * Hook to fetch all available Mastra agents
 */
export function useAgents() {
  return useQuery({
    queryKey: [QUERY_KEYS.agents],
    queryFn: () => mastraApi.getAgents(),
  });
}

/**
 * Hook to fetch a specific Mastra agent by ID
 */
export function useAgent(agentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.agent(agentId),
    queryFn: () => mastraApi.getAgent(agentId),
    enabled: !!agentId,
  });
}

/**
 * Hook to fetch metadata for all agents to show in the UI
 */
export function useAgentMetadata() {
  return useQuery({
    queryKey: [QUERY_KEYS.agentMetadata],
    queryFn: () => {
      // This data is static and comes from the AGENT_METADATA constant
      // We transform it to an array for easier consumption in UI components
      // Only return the universal workflow agent now
      return [AGENT_METADATA['universalAgent']];
    },
    // This data doesn't change, so we can cache it indefinitely
    staleTime: Infinity,
  });
}

/**
 * Hook to get agent-specific suggestions 
 * Now returns universal suggestions for all agent types
 */
export function useAgentSuggestions(agentType: AgentType) {
  // Universal suggestions for all agent types
  return [
    'How can you help me?',
    'Tell me about BISO',
    'Find available job openings',
    'Tell me about the Computer Science department',
    'Where can I find the student handbook?'
  ];
}

/**
 * Hook to send a message to a Mastra agent and get a response
 * Always uses the universalAgent agent
 */
export function useSendMessage() {
  
  return useMutation({
    mutationFn: ({
      agentId,
      messages,
      threadId,
    }: {
      agentId: string;
      messages: Message[];
      threadId?: string;
    }) => {
      // Always use the universalAgent agent
      const universalAgentId = 'universalAgent';
      console.log('Sending message to universal agent from useSendMessage hook');
      return mastraApi.generateResponse(universalAgentId, messages, threadId);
    },
    // Optional: invalidate any cache that depends on the conversation
    onSuccess: (data) => {
      // Log the successful response
      console.log('Successfully received response in useSendMessage hook:', data);
      // If you store conversation data in React Query, invalidate it here
    },
    onError: (error) => {
      // Log any errors
      console.error('Error in useSendMessage hook:', error);
    }
  });
}

/**
 * Hook to generate a system message context
 * Now returns a single system message for all agent types
 */
export function useAgentSystemMessage(agentType: AgentType): string {
  // Universal system message for all agent types
  return "You are a helpful AI assistant for BISO. You can search website content, find documents, match jobs, and provide department information. You'll understand the user's intent and provide relevant information.";
} 

