export interface ApiResponse<T = any> {
  success: boolean
  statusCode: number
  message: string
  data: T
  meta?: {
    timestamp: string
    traceId?: string
  }
}

export interface ApiFieldError {
  field: string
  message: string
}

export interface ApiErrorResponse {
  success: false
  statusCode: number
  errorCode: string
  message: string
  errors?: ApiFieldError[]
  meta?: {
    timestamp: string
    traceId?: string
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  const headers = new Headers(options.headers || {})

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const contentType = response.headers.get('content-type')
    const isJson = contentType && contentType.includes('application/json')
    const body = isJson ? await response.json() : null

    if (!response.ok) {
      if (body && body.message) {
        throw body as ApiErrorResponse
      }
      throw {
        success: false,
        statusCode: response.status,
        errorCode: `HTTP_${response.status}`,
        message: body?.message || response.statusText || 'Server error occurred.',
        errors: body?.errors,
        meta: { timestamp: new Date().toISOString(), traceId: 'err-res' },
      } as ApiErrorResponse
    }

    return body as ApiResponse<T>
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error && error.success === false) {
      throw error
    }
    if (error && error.name === 'AbortError') {
      throw {
        success: false,
        statusCode: 504,
        errorCode: 'TIMEOUT',
        message: 'Request timed out after 15 seconds. Please try again.',
        meta: { timestamp: new Date().toISOString(), traceId: 'timeout' },
      } as ApiErrorResponse
    }
    throw {
      success: false,
      statusCode: 503,
      errorCode: 'NETWORK_ERROR',
      message: 'Unable to connect to Saturn R&D API server. Please verify your network connection.',
      meta: { timestamp: new Date().toISOString(), traceId: 'offline' },
    } as ApiErrorResponse
  }
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    })
  },
  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    })
  },
  delete: <T = any>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
}
