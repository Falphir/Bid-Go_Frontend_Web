import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import { Outlet } from "react-router";
import { ToastProvider } from "./components/feedback/ToastContext";

/**
 * Root application component for the Bid-Go frontend.
 *
 * It is responsible for wiring global styles, providers and the
 * main router that defines the application navigation.
 *
 * @returns {JSX.Element} Main application shell.
 */

function App() {
  return (
    <ToastProvider>
      <div className="App">
        <Navbar />
        <main style={{ padding: 16 }}>
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
