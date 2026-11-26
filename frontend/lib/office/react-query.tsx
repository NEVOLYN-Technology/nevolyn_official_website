"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

type QueryKey = readonly unknown[];

interface CacheEntry {
  data: unknown;
  updatedAt: number;
}

type Listener = (prefixKey?: string) => void;

export class QueryClient {
  private cache = new Map<string, CacheEntry>();
  private listeners = new Set<Listener>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_options?: Record<string, unknown>) {}

  static serializeKey(key: QueryKey): string {
    try {
      return JSON.stringify(key);
    } catch {
      return String(key);
    }
  }

  get(key: QueryKey): CacheEntry | undefined {
    return this.cache.get(QueryClient.serializeKey(key));
  }

  set(key: QueryKey, data: unknown): void {
    this.cache.set(QueryClient.serializeKey(key), {
      data,
      updatedAt: Date.now(),
    });
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  invalidateQueries(opts?: { queryKey?: QueryKey }): Promise<void> {
    const prefix = opts?.queryKey && opts.queryKey.length > 0 ? String(opts.queryKey[0]) : undefined;
    this.listeners.forEach((fn) => fn(prefix));
    return Promise.resolve();
  }
}

const QueryClientContext = createContext<QueryClient | null>(null);

const defaultClient = new QueryClient();

export function QueryClientProvider({
  client,
  children,
}: {
  client: QueryClient;
  children: React.ReactNode;
}) {
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  );
}

export function useQueryClient(): QueryClient {
  return useContext(QueryClientContext) ?? defaultClient;
}

export interface UseQueryOptions<TData> {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  refetchInterval?: number | false;
}

export interface UseQueryResult<TData> {
  data: TData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

export function useQuery<TData = unknown>(
  options: UseQueryOptions<TData>
): UseQueryResult<TData> {
  const { queryKey, queryFn, enabled = true, refetchInterval } = options;
  const client = useQueryClient();
  const serializedKey = QueryClient.serializeKey(queryKey);
  const primaryKey = queryKey.length > 0 ? String(queryKey[0]) : "";

  const cached = client.get(queryKey);
  const [data, setData] = useState<TData | undefined>(
    cached ? (cached.data as TData) : undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(enabled && !cached);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const queryKeyRef = useRef(queryKey);
  queryKeyRef.current = queryKey;

  const execute = useCallback(async () => {
    if (!enabled) return;
    setIsFetching(true);
    try {
      const result = await queryFnRef.current();
      client.set(queryKeyRef.current, result);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [client, enabled]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    execute();
  }, [serializedKey, enabled, execute]);

  useEffect(() => {
    return client.subscribe((prefix) => {
      if (!prefix || prefix === primaryKey) {
        execute();
      }
    });
  }, [client, primaryKey, execute]);

  useEffect(() => {
    if (!enabled || !refetchInterval || refetchInterval <= 0) return;
    const id = setInterval(() => {
      execute();
    }, refetchInterval);
    return () => clearInterval(id);
  }, [enabled, refetchInterval, execute]);

  return {
    data,
    isLoading,
    isFetching,
    isError: error !== null,
    error,
    refetch: execute,
  };
}

export interface UseMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<unknown>;
  onError?: (error: unknown, variables: TVariables) => void | Promise<unknown>;
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isPending: boolean;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data: TData | undefined;
}

export function useMutation<TData = unknown, TVariables = void>(
  options: UseMutationOptions<TData, TVariables>
): UseMutationResult<TData, TVariables> {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<TData | undefined>(undefined);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    setIsPending(true);
    setError(null);
    try {
      const res = await optionsRef.current.mutationFn(variables);
      setData(res);
      await optionsRef.current.onSuccess?.(res, variables);
      return res;
    } catch (err) {
      setError(err);
      await optionsRef.current.onError?.(err, variables);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  const mutate = useCallback(
    (variables: TVariables) => {
      mutateAsync(variables).catch(() => {
        // Handled via onError callback
      });
    },
    [mutateAsync]
  );

  return {
    mutate: mutate as (variables: TVariables) => void,
    mutateAsync,
    isPending,
    isLoading: isPending,
    isError: error !== null,
    error,
    data,
  };
}

