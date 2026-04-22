import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import PublicView from "./components/PublicView";
import JournalView from "./components/JournalView";
import ProjectPage from "./components/ProjectPage";
import VideoPage from "./components/VideoPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicView />} />
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/journal" element={<JournalView />} />
      <Route path="/journal/:slug" element={<JournalView />} />
      <Route path="/project/:slug" element={<ProjectPage />} />
      <Route path="/video/:id" element={<VideoPage />} />
    </Routes>
  );
}
