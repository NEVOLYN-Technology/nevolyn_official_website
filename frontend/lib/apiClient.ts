/**
 * Typed fetch wrapper for the Saturn R&D Spring Boot API.
 *
 * Every backend route answers with the same envelope, so callers can rely on
 * `success`, `message` and `data` being present on any resolved response, and on
 * a rejected promise always carrying an {@link ApiErrorResponse}.
 */

/** Standard success envelope returned by every `/api/v1` endpoint. */
export interface ApiResponse<T = unknown> {
  success: boolean
  statusCode: number
  message: string
  data: T
  meta?: ApiMeta
}

/** Per-field validation failure produced by Bean Validation on the backend. */
export interface ApiFieldError {
  field: string
  message: string
}

/** Standard failure envelope. Always the rejection value of an api call. */
export interface ApiErrorResponse {
  success: false
  statusCode: number
  errorCode: string
  message: string
  errors?: ApiFieldError[]
  meta?: ApiMeta
}

export interface ApiMeta {
  timestamp: string
  traceId?: string
}

/**
 * Base URL for all requests, including the `/api/v1` prefix — call sites pass
 * bare paths such as `/contact`.
 *
 * FUTURE CUSTOM DOMAIN: set `NEXT_PUBLIC_API_URL` in the Vercel project settings
 * (Settings → Environment Variables) to e.g. `https://api.saturn-rnd.com/api/v1`.
 * NEXT_PUBLIC_* values are inlined at build time, so changing it requires a
 * redeploy — editing the variable alone will not update a already-built bundle.
 */
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'https://saturn-rnd-backend.onrender.com/api/v1'
).replace(/\/+$/, '')

/**
 * Request timeout in milliseconds.
 *
 * Deliberately generous: the API runs on Render's free tier, which suspends the
 * instance after ~15 minutes of inactivity. The next request has to wait for a
 * full container cold start — JVM boot, Hikari pool, Hibernate schema scan —
 * which routinely takes 30-50s. A shorter timeout makes the first submission
 * after an idle period fail every single time, while the request itself was
 * about to succeed.
 *
 * Drop this to ~15s once the backend moves to an always-on paid instance.
 */
const REQUEST_TIMEOUT_MS = 120_000

/** Builds the rejection value used for transport-level failures. */
function transportError(statusCode: number, errorCode: string, message: string): ApiErrorResponse {
  return {
    success: false,
    statusCode,
    errorCode,
    message,
    meta: { timestamp: new Date().toISOString() },
  }
}

/** Narrows an unknown thrown value to the API's error envelope. */
function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as { success: unknown }).success === false
  )
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  const headers = new Headers(options.headers)

  // Let the browser set Content-Type for FormData — it has to append the
  // multipart boundary, and overriding it corrupts the upload.
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, { ...options, headers, signal: controller.signal })

    const contentType = response.headers.get('content-type')
    const body: unknown = contentType?.includes('application/json') ? await response.json() : null

    if (!response.ok) {
      if (isApiErrorResponse(body)) {
        throw body
      }
      throw transportError(
        response.status,
        `HTTP_${response.status}`,
        response.statusText || 'Server error occurred.',
      )
    }

    return body as ApiResponse<T>
  } catch (error: unknown) {
    // Re-throw envelopes produced above untouched; only genuine transport
    // failures get translated here.
    if (isApiErrorResponse(error)) {
      throw error
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw transportError(
        504,
        'TIMEOUT',
        'The server is taking longer than usual to respond — it may be waking from sleep. Please try again in a moment.',
      )
    }
    throw transportError(
      503,
      'NETWORK_ERROR',
      'Unable to connect to the Saturn R&D API server. Please check your network connection.',
    )
  } finally {
    clearTimeout(timeoutId)
  }
}

/** JSON-serialisable request body, or a FormData payload for file uploads. */
type RequestBody = FormData | Record<string, unknown> | unknown[]

function withBody(method: string, body?: RequestBody, options: RequestInit = {}): RequestInit {
  return {
    ...options,
    method,
    body: body instanceof FormData ? body : JSON.stringify(body),
  }
}

export const apiClient = {
  get: <T = unknown>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, body?: RequestBody, options?: RequestInit) =>
    request<T>(endpoint, withBody('POST', body, options)),

  put: <T = unknown>(endpoint: string, body?: RequestBody, options?: RequestInit) =>
    request<T>(endpoint, withBody('PUT', body, options)),

  delete: <T = unknown>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
}
