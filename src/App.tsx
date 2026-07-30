import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";

import AuthPage from "@/pages/AuthPage";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
});

/** Envolve uma página protegida no Layout padrão. */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        themes={["light", "dark", "black"]}
      >
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Públicas */}
              <Route path="/auth" element={<AuthPage />} />

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
          </BrowserRouter>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
