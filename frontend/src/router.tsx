import { Suspense, lazy, type ComponentType } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

const Home = lazy(() => import("@/pages/Home").then((m) => ({ default: m.Home })));
const Agent = lazy(() => import("@/pages/Agent").then((m) => ({ default: m.Agent })));
const RunDetail = lazy(() =>
  import("@/pages/RunDetail").then((m) => ({ default: m.RunDetail })),
);
const Compare = lazy(() =>
  import("@/pages/Compare").then((m) => ({ default: m.Compare })),
);
const Settings = lazy(() =>
  import("@/pages/Settings").then((m) => ({ default: m.Settings })),
);
const Runtime = lazy(() =>
  import("@/pages/Runtime").then((m) => ({ default: m.Runtime })),
);
const Reports = lazy(() =>
  import("@/pages/Reports").then((m) => ({ default: m.Reports })),
);
const Correlation = lazy(() =>
  import("@/pages/Correlation").then((m) => ({ default: m.Correlation })),
);
const AlphaZoo = lazy(() =>
  import("@/pages/AlphaZoo").then((m) => ({ default: m.AlphaZoo })),
);
const Overview = lazy(() =>
  import("@/pages/Overview").then((m) => ({ default: m.Overview })),
);
const HumanoidRobot = lazy(() =>
  import("@/pages/HumanoidRobot").then((m) => ({ default: m.HumanoidRobot })),
);
const AIPower = lazy(() =>
  import("@/pages/AIPower").then((m) => ({ default: m.AIPower })),
);
const SolidBattery = lazy(() =>
  import("@/pages/SolidBattery").then((m) => ({ default: m.SolidBattery })),
);
const WarRoom = lazy(() =>
  import("@/pages/WarRoom").then((m) => ({ default: m.WarRoom })),
);
const StockAnalysis = lazy(() =>
  import("@/pages/StockAnalysis").then((m) => ({ default: m.StockAnalysis })),
);

function PageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
      Loading…
    </div>
  );
}

function wrap(Component: ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/overview", element: wrap(Overview) },
      { path: "/humanoid-robot", element: wrap(HumanoidRobot) },
      { path: "/ai-power", element: wrap(AIPower) },
      { path: "/solid-battery", element: wrap(SolidBattery) },
      { path: "/war-room", element: wrap(WarRoom) },
      { path: "/stock-analysis", element: wrap(StockAnalysis) },
      { path: "/", element: wrap(Home) },
      { path: "/agent", element: wrap(Agent) },
      { path: "/runtime", element: wrap(Runtime) },
      { path: "/reports", element: wrap(Reports) },
      { path: "/settings", element: wrap(Settings) },
      { path: "/runs/:runId", element: wrap(RunDetail) },
      { path: "/compare", element: wrap(Compare) },
      { path: "/correlation", element: wrap(Correlation) },
      { path: "/alpha-zoo", element: wrap(AlphaZoo) },
      { path: "/alpha-zoo/bench", element: wrap(AlphaZoo) },
      { path: "/alpha-zoo/compare", element: wrap(AlphaZoo) },
      { path: "/alpha-zoo/:alphaId", element: wrap(AlphaZoo) },
    ],
  },
]);
