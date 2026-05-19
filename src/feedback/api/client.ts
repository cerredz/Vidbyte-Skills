import type {
  FeedbackEntry,
  ActionConfig,
  Collection,
  Connector,
  HarnessMessage,
} from "../types";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? "https://vidbyte.pro";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_ORIGIN}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message: string;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.error || `Request failed (status ${response.status})`;
    } catch {
      message = `Request failed (status ${response.status})`;
    }
    const err = new Error(message) as Error & { status: number };
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function fetchFeedbackEntries(params?: {
  domain?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<FeedbackEntry[]> {
  const searchParams = new URLSearchParams();
  if (params?.domain) searchParams.set("domain", params.domain);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));

  const query = searchParams.toString();
  const endpoint = `/api/skills/feedback${query ? `?${query}` : ""}`;
  return request<FeedbackEntry[]>(endpoint);
}

export async function fetchFeedbackEntry(id: string): Promise<FeedbackEntry> {
  return request<FeedbackEntry>(`/api/skills/feedback/${id}`);
}

export async function updateFeedbackStatus(
  id: string,
  updates: { isMarked?: boolean; isSaved?: boolean; collectionId?: string },
): Promise<FeedbackEntry> {
  return request<FeedbackEntry>(`/api/skills/feedback/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function createProduct(config: ActionConfig): Promise<{ id: string; url: string }> {
  return request<{ id: string; url: string }>(
    `/api/products/${config.type}`,
    {
      method: "POST",
      body: JSON.stringify(config),
    },
  );
}

export async function fetchCollections(): Promise<Collection[]> {
  return request<Collection[]>("/api/collections");
}

export async function createCollection(name: string): Promise<Collection> {
  return request<Collection>("/api/collections", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function updateCollection(
  id: string,
  updates: { feedbackIds?: string[] },
): Promise<Collection> {
  return request<Collection>(`/api/collections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function fetchConnectors(): Promise<Connector[]> {
  return request<Connector[]>("/api/connectors");
}

export async function submitHarnessQuestion(
  question: string,
  conversationId?: string,
): Promise<{ message: HarnessMessage }> {
  return request<{ message: HarnessMessage }>("/api/harness/ask", {
    method: "POST",
    body: JSON.stringify({ question, conversation_id: conversationId }),
  });
}

export async function fetchHarnessHistory(): Promise<HarnessMessage[]> {
  return request<HarnessMessage[]>("/api/harness/conversation");
}
