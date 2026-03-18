import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import PublicView from "./components/PublicView";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicView />} />
      <Route path="/admin" element={<Dashboard />} />
    </Routes>
  );
}