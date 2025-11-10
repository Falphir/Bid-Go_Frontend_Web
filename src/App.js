import logo from './logo.svg';
import './App.css';
import Navbar from "./components/Navbar";
import {Outlet} from "react-router";

function App() {
  return (
      <div className="App">
          <Navbar/>
          <main style={{padding: 16}}>
              <Outlet/>
          </main>
      </div>
  );
}

export default App;
