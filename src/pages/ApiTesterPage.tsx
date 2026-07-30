import { useEffect, useMemo, useState } from "react";
import { Play, Braces } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ENDPOINTS,
  ENDPOINT_KEYS,
  type EndpointKey,
} from "@/api/endpoints.generated";
import { callEndpoint, USE_MOCK, type CallResult } from "@/services/creatorClient";

const GROUP_LABELS: Record<string, string> = {
  perfil: "Perfil & Vitrine",
  ganhos: "Ganhos & Rastreio",
  descoberta: "Descoberta & Colaborações",
  amostras: "Amostras",
  links: "Links de afiliado",
  estudio: "Estúdio de conteúdo",
  analytics: "Analytics",
  toko: "Toko Mapper",
};

const METHOD_VARIANT: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  GET: "success",
  POST: "warning",
  DELETE: "destructive",
  PUT: "secondary",
};

// classes literais (Tailwind JIT precisa das strings completas)
const METHOD_COLOR: Record<string, string> = {
  GET: "text-success",
  POST: "text-warning",
  DELETE: "text-destructive",
  PUT: "text-muted-foreground",
};

export default function ApiTesterPage() {
  const [selected, setSelected] = useState<EndpointKey>(ENDPOINT_KEYS[0]);
  const def = ENDPOINTS[selected];

  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [query, setQuery] = useState<Record<string, string>>({});
  const [bodyText, setBodyText] = useState("");
  const [result, setResult] = useState<CallResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPathParams({});
    setQuery({});
    setBodyText(def.hasBody ? "{}" : "");
    setResult(null);
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const grouped = useMemo(() => {
    const g: Record<string, EndpointKey[]> = {};
    for (const k of ENDPOINT_KEYS) (g[ENDPOINTS[k].group] ||= []).push(k);
    return g;
  }, []);

  async function run() {
    setLoading(true);
    let body: Record<string, unknown> | undefined;
    if (def.hasBody && bodyText.trim()) {
      try {
        body = JSON.parse(bodyText);
      } catch {
        setResult({ ok: false, error: "Body não é JSON válido", source: USE_MOCK ? "mock" : "live" });
        setLoading(false);
        return;
      }
    }
    const cleanQuery = Object.fromEntries(Object.entries(query).filter(([, v]) => v !== ""));
    const res = await callEndpoint(selected, { pathParams, query: cleanQuery, body });
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Tester</h1>
          <p className="text-muted-foreground">Rode qualquer um dos {ENDPOINT_KEYS.length} endpoints de creator.</p>
        </div>
        <Badge variant={USE_MOCK ? "secondary" : "success"}>
          {USE_MOCK ? "Modo MOCK (fixtures da doc)" : "Modo LIVE (TikTok real)"}
        </Badge>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* lista de endpoints */}
        <Card className="h-fit max-h-[75vh] overflow-y-auto">
          <CardContent className="p-2">
            {Object.entries(grouped).map(([group, keys]) => (
              <div key={group} className="mb-2">
                <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
                  {GROUP_LABELS[group] ?? group}
                </p>
                {keys.map((k) => {
                  const e = ENDPOINTS[k];
                  return (
                    <button
                      key={k}
                      onClick={() => setSelected(k)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                        selected === k ? "bg-primary/10 text-primary" : "hover:bg-accent"
                      )}
                    >
                      <span className={cn("w-11 shrink-0 text-[10px] font-bold", METHOD_COLOR[e.method] ?? "text-foreground")}>
                        {e.method}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{e.title}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* detalhe + runner */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={METHOD_VARIANT[def.method]}>{def.method}</Badge>
                <code className="break-all rounded bg-muted px-2 py-1 text-sm">{def.path}</code>
                <Badge variant="outline">v{def.version}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{def.title}</span>
                {" · scope: "}
                {def.scopes.length ? def.scopes.map((s) => <code key={s} className="mr-1">{s}</code>) : "—"}
              </p>

              {def.pathParams.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Path params</p>
                  {def.pathParams.map((p) => (
                    <Input
                      key={p}
                      placeholder={p}
                      value={pathParams[p] ?? ""}
                      onChange={(e) => setPathParams((s) => ({ ...s, [p]: e.target.value }))}
                    />
                  ))}
                </div>
              )}

              {def.queryParams.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Query params</p>
                  {def.queryParams.map((p) => (
                    <Input
                      key={p}
                      placeholder={p}
                      value={query[p] ?? ""}
                      onChange={(e) => setQuery((s) => ({ ...s, [p]: e.target.value }))}
                    />
                  ))}
                </div>
              )}

              {def.hasBody && (
                <div className="space-y-2">
                  <p className="flex items-center gap-1 text-sm font-medium">
                    <Braces className="h-3.5 w-3.5" /> Body (JSON)
                  </p>
                  <textarea
                    className="min-h-[120px] w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    spellCheck={false}
                  />
                </div>
              )}

              <Button onClick={run} disabled={loading} className="gap-2">
                <Play className="h-4 w-4" />
                {loading ? "Rodando..." : "Rodar"}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center gap-2">
                  <Badge variant={result.ok ? "success" : "destructive"}>
                    {result.ok ? "OK" : "ERRO"}
                  </Badge>
                  <Badge variant="secondary">{result.source}</Badge>
                  {result.error && <span className="text-sm text-destructive">{result.error}</span>}
                </div>
                <pre className="max-h-[50vh] overflow-auto rounded-md bg-muted p-3 text-xs">
                  {JSON.stringify(result.ok ? result.data : result.raw ?? result.error, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
