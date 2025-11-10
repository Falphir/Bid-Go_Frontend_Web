import React, {Suspense} from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App";
import Testepage from "./pages/Testepage";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div>Loading…</div>}>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/teste" element={<Testepage />} />
                    <Route path="*" element={<div>NOT FOUND</div>} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}