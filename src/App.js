import logo from './logo.svg';
import './App.css';
import Navbar from "./components/Navbar/Navbar";
import {Outlet} from "react-router";
import { ToastProvider } from "./components/feedback/ToastContext";

function App() {
  return (
      <ToastProvider>
        <div className="App">
            <Navbar/>
            <main style={{padding: 16}}>
                <Outlet/>
            </main>
        </div>
      </ToastProvider>
  );
}

export default App;
