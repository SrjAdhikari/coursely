//* src/App.tsx

// Side-effect import: applies the persisted theme on startup (the module-level
// boot in useTheme). The toggle itself lives in ThemeToggle.
import "@/hooks/useTheme";
import AppRoutes from "@/routes/AppRoutes";

const App = () => {
  return <AppRoutes />;
}

export default App;
