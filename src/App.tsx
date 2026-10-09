import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { LandingPage } from "./pages/LandingPage";
import { MissedDaysPage } from "./pages/MissedDaysPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { ProgressPage } from "./pages/ProgressPage";
import { RoadmapPage } from "./pages/RoadmapPage";
import { RoadmapPreviewPage } from "./pages/RoadmapPreviewPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TodayPage } from "./pages/TodayPage";
import { PlanProvider } from "./state/PlanContext";

export default function App() {
  return (
    <PlanProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/roadmap-preview" element={<RoadmapPreviewPage />} />
          <Route element={<AppShell />}>
            <Route path="/today" element={<TodayPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/missed-days" element={<MissedDaysPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </BrowserRouter>
    </PlanProvider>
  );
}
