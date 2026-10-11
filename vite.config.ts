import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Caminho relativo só na demo de feira. Com o default "/", o index.html
  // aponta pra "/assets/...", que a partir de file:// o navegador procura na
  // RAIZ DO DISCO — nada carrega e a tela abre em branco. Com "./", o mesmo
  // build abre por duplo clique e também servido pelo Apache.
  //
  // Isso só é seguro porque a demo usa HashRouter (ver src/App.tsx): a rota
  // vive no fragmento, então o documento é sempre /index.html e o caminho
  // relativo resolve igual. Com BrowserRouter, abrir /auth/callback faria
  // "./assets" virar "/auth/assets" e quebrar.
  base: mode === "demo" ? "./" : "/",
  server: {
    host: "::",
    port: 8092, // 8080 = TikTally-seller, 8091 vive ocupada por outra sessão → creator fixa na 8092
    strictPort: true, // NÃO pula de porta — porta fixa e previsível pro túnel
    allowedHosts: [
      "localhost",
      ".loca.lt", // LocalTunnel (callback OAuth do creator)
      ".ngrok.io",
      ".ngrok-free.app",
    ],
  },
  // Na demo, tudo num arquivo só. Não é preferência estética: o build normal
  // emite <script type="module">, e módulo ES a partir de file:// é bloqueado
  // por CORS (origem "null") em todo navegador moderno — duplo clique abre em
  // branco mesmo com caminho relativo. Inline, o script deixa de ser módulo e
  // roda do disco.
  //
  // É o que faz a demo virar "um HTML", igual ao tiktally-demo, e o que permite
  // mostrar o produto num notebook sem servidor e sem Wi-Fi do evento.
  plugins: mode === "demo" ? [react(), viteSingleFile()] : [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
