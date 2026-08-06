import { Layout } from "@/components/Layout";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { Toaster } from 'sonner';

import Dashboard from "./pages/Dashboard";
import Matrix from "./pages/Matrix";
import RiskForm from "./pages/RiskForm";
import Controls from "./pages/Controls";
import Monitoring from "./pages/Monitoring";
import Events from "./pages/Events";
import Measurements from "./pages/Measurements";
import HeatMap from "./pages/HeatMap";
import Parameters from "./pages/Parameters";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background p-8">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground">La página solicitada no existe.</p>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/matriz" component={Matrix} />
        <Route path="/matriz/nuevo" component={RiskForm} />
        <Route path="/matriz/:id" component={RiskForm} />
        <Route path="/controles" component={Controls} />
        <Route path="/monitoreo" component={Monitoring} />
        <Route path="/eventos" component={Events} />
        <Route path="/mediciones" component={Measurements} />
        <Route path="/mapa-calor" component={HeatMap} />
        <Route path="/parametros" component={Parameters} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter hook={useHashLocation}>
        <Router />
      </WouterRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;