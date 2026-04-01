import Dashboard from "../components/Dashboard/dashboard";
import "./AppLayout.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Dashboard />

      <div className="app-content">
        <div className="app-background"></div>
        <div className="app-page">{children}</div>
      </div>
    </div>
  );
}
