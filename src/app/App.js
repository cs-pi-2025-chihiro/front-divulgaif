import "./App.css";
import { BrowserRouter } from "react-router-dom";
import Footer from "../components/footer/footer";
import Header from "../components/header/header";
import AppRoutes from "../routes/Routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { setupInterceptors } from "../services/utils/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    setupInterceptors(i18n);
  }, [i18n]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="App">
          <Header />

          <AppRoutes />

          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
