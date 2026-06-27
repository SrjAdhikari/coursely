//* src/App.tsx

import useTheme from "@/hooks/useTheme";
import AppRoutes from "@/routes/AppRoutes";

const App = () => {
	// Apply and track the persisted light/dark theme app-wide.
	useTheme();
	return <AppRoutes />;
};

export default App;
