import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

import { readDb, writeDb, runAgentCycle, startAgentScheduler } from "./lib/agent";
import crypto from "node:crypto";

// Start background agent loop once on server startup
if (!(globalThis as any).__agentSchedulerStarted) {
  (globalThis as any).__agentSchedulerStarted = true;
  try {
    // If the database is initialized, start the scheduler
    const db = readDb();
    if (db.initialized) {
      startAgentScheduler(15);
    }
  } catch (err) {
    console.error("Failed to start agent background scheduler on startup:", err);
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    // Intercept GET/POST for /api/agent/status
    if (url.pathname === '/api/agent/status') {
      try {
        if (request.method === 'POST') {
          const body = await request.json() as any;
          let db = body.state || readDb();

          if (body.action === 'trigger_cycle') {
            db = await runAgentCycle(db);
            return new Response(JSON.stringify(db), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
          }

          if (body.settings) {
            const s = body.settings;
            if (s.name) db.persona.name = s.name;
            if (s.domain) db.persona.domain = s.domain;
            if (s.style) db.persona.style = s.style;
            if (s.frequency) db.persona.frequency = s.frequency;
            if (s.aggressiveness !== undefined) db.persona.aggressiveness = s.aggressiveness;
            if (s.sources) db.sources = s.sources;
            db.stats.sourcesMonitored = db.sources.filter(src => src.enabled).length;

            try {
              writeDb(db);
            } catch {}
          }
          return new Response(JSON.stringify(db), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        // GET method
        const db = readDb();
        return new Response(JSON.stringify(db), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // Intercept POST /api/agent/init
    if (url.pathname === '/api/agent/init' && request.method === 'POST') {
      try {
        const body = (await request.json()) as any;
        if (!body.persona || !body.persona.name || !body.persona.domain) {
          return new Response(JSON.stringify({ error: "Missing required persona.name or persona.domain" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const agentId = crypto.randomUUID();
        let db = body.state || readDb();

        db.initialized = true;
        db.agentId = agentId;
        db.persona = {
          name: body.persona.name,
          domain: body.persona.domain,
          style: body.persona.style || "Analytical",
          aggressiveness: body.persona.aggressiveness ?? 68,
          frequency: body.persona.frequency || "Daily"
        };
        db.posts = [];
        db.memories = [];
        db.rejected = [];
        db.activity = [];
        db.stats = {
          postsPublished: 0,
          topicsRejected: 0,
          sourcesMonitored: db.sources.length || 20,
          memoryEntries: 0,
          publishingScore: 95
        };

        // Trigger cycle immediately to populate first post
        db = await runAgentCycle(db);

        try {
          writeDb(db);
        } catch {}

        return new Response(JSON.stringify({ agentId, state: db }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // Intercept GET /api/agent/feed
    if (url.pathname === '/api/agent/feed') {
      try {
        const agentId = url.searchParams.get('agentId');
        if (!agentId) {
          return new Response(JSON.stringify({ error: "Missing agentId query parameter" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const db = readDb();
        if (db.agentId !== agentId) {
          return new Response(JSON.stringify({ error: "Agent not found" }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const formattedPosts = db.posts.map(p => ({
          id: p.id,
          createdAt: p.publishedAt,
          text: p.body,
          rationale: p.rationale,
          sources: p.sources.map(s => typeof s === 'string' ? s : s.url)
        }));

        return new Response(JSON.stringify({ posts: formattedPosts }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // Normal client routing / SSR
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
