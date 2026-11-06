import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getCandidateBackendUrls = (): string[] => {
  const candidates = [
    process.env.OFFICE_BACKEND_API_URL,
    process.env.INTERNAL_API_URL,
    "http://backend:8080/api/v1",
    "http://nevolyn-backend:8080/api/v1",
    "http://nevolyn-backend-1:8080/api/v1",
    "http://127.0.0.1:8080/api/v1",
    "http://localhost:8080/api/v1",
    "http://host.docker.internal:8080/api/v1",
  ];

  const unique: string[] = [];
  for (const raw of candidates) {
    if (!raw || !raw.trim()) continue;
    const normalized = raw.trim().replace(/\/+$/, "");
    const withApiPrefix = normalized.endsWith("/api/v1")
      ? normalized
      : `${normalized}/api/v1`;
    if (!unique.includes(withApiPrefix)) {
      unique.push(withApiPrefix);
    }
  }
  return unique;
};

async function proxyRequest(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params;
  const subPath = Array.isArray(path) ? path.join("/") : "";
  const search = req.nextUrl.search || "";

  const forwardHeaders = new Headers();
  const incomingAuth = req.headers.get("authorization") || "";
  const isBasicAuth = incomingAuth.trim().toLowerCase().startsWith("basic ");
  const headersToCopy = [
    "authorization",
    ...(isBasicAuth ? [] : ["cookie"]),
    "content-type",
    "accept",
    "user-agent",
    "cf-connecting-ip",
    "x-forwarded-for",
    "x-real-ip",
    "x-rd-wifi-secret",
  ];

  for (const key of headersToCopy) {
    const val = req.headers.get(key);
    if (val) {
      forwardHeaders.set(key, val);
    }
  }

  const method = req.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
  const bodyBuffer = hasBody ? await req.arrayBuffer() : undefined;

  const candidates = getCandidateBackendUrls();
  let lastError: unknown = null;

  for (const baseUrl of candidates) {
    const targetUrl = `${baseUrl}/${subPath}${search}`;
    try {
      const upstreamRes = await fetch(targetUrl, {
        method,
        headers: forwardHeaders,
        body: bodyBuffer && bodyBuffer.byteLength > 0 ? bodyBuffer : undefined,
        redirect: "manual",
        cache: "no-store",
      });

      const responseHeaders = new Headers();
      const contentType = upstreamRes.headers.get("content-type");
      if (contentType) {
        responseHeaders.set("content-type", contentType);
      }
      const contentDisposition = upstreamRes.headers.get("content-disposition");
      if (contentDisposition) {
        responseHeaders.set("content-disposition", contentDisposition);
      }

      if (typeof upstreamRes.headers.getSetCookie === "function") {
        const cookies = upstreamRes.headers.getSetCookie();
        for (const cookie of cookies) {
          responseHeaders.append("set-cookie", cookie);
        }
      } else {
        const rawSetCookie = upstreamRes.headers.get("set-cookie");
        if (rawSetCookie) {
          responseHeaders.set("set-cookie", rawSetCookie);
        }
      }

      const responseBody = await upstreamRes.arrayBuffer();
      return new NextResponse(
        upstreamRes.status === 204 ? null : responseBody,
        {
          status: upstreamRes.status,
          headers: responseHeaders,
        }
      );
    } catch (err) {
      lastError = err;
    }
  }

  return NextResponse.json(
    {
      success: false,
      message:
        "Backend API service is temporarily unreachable or restarting. Please wait a few seconds and try again.",
      detail: lastError instanceof Error ? lastError.message : "Upstream connection failed",
    },
    { status: 502 }
  );
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, context);
}

export async function OPTIONS(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, context);
}

