import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { IS_DEMO_BUILD } from "@/services/creatorClient";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";

import AuthPage from "@/pages/AuthPage";
import FeiraPage from "@/pages/FeiraPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import DashboardPage from "@/pages/DashboardPage";
import ConnectPage from "@/pages/ConnectPage";
import PerfilPage from "@/pages/PerfilPage";
import VitrinePage from "@/pages/VitrinePage";
import GanhosPage from "@/pages/GanhosPage";
import DescobertaPage from "@/pages/DescobertaPage";
import AmostrasPage from "@/pages/AmostrasPage";
import LinksPage from "@/pages/LinksPage";
import EstudioPage from "@/pages/EstudioPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import TokoPage from "@/pages/TokoPage";
import ApiTesterPage from "@/pages/ApiTesterPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "@/pages/NotFound";

/**
 * A demo de feira usa HashRouter; o app, BrowserRouter.
 *
 * Duas razões, e as duas são sobre abrir a demo SEM servidor — num notebook, no
 * estande, sem depender do Wi-Fi do evento:
 *
 *  - de `file://`, o history API do BrowserRouter não funciona: navegar lança
 *    SecurityError, porque não há origem pra empurrar estado.
 *  - com a rota no fragmento (`#/ganhos`), o documento é sempre `index.html`,
 *    então o `base: "./"` do vite.config resolve os assets igual servido pelo
 *    Apache ou aberto do disco.
 *
 * O app de verdade continua com URL limpa: lá existe servidor, e o
 * `/auth/callback` do OAuth da TikTok precisa de caminho real, não de hash.
 */
const Router = IS_DEMO_BUILD ? HashRouter : BrowserRouter;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
});

/** Envolve uma página protegida no Layout padrão. */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Dark é o padrão, não o alternativo: o produto é de gestão financeira e
          foi desenhado no escuro — o claro continua existindo e suportado, mas
          quem chega sem preferência salva entra no tema para o qual as telas
          foram compostas. `enableSystem` sai junto, senão o SO decide por nós e
          metade dos creators cai no claro sem ter pedido. */}
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        themes={["light", "dark", "black"]}
      >
        <AuthProvider>
          <Router>
            <Routes>
              {/* Públicas */}
              <Route path="/auth" element={<AuthPage />} />
              {/* Destino do QR Code do banner de estande. Sem sessão: quem chega aqui não tem conta. */}
              <Route path="/feira" element={<FeiraPage />} />

              {/* Protegidas */}
              <Route
                path="/auth/callback"
                element={
                  <ProtectedRoute>
                    <AuthCallbackPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/conectar"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ConnectPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PerfilPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vitrine"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <VitrinePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ganhos"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <GanhosPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/descoberta"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DescobertaPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/amostras"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AmostrasPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/links"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <LinksPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/estudio"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <EstudioPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AnalyticsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/toko"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TokoPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/api-tester"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ApiTesterPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
