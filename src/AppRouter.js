import React, {Suspense} from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App";
import Testepage from "./pages/Testepage";
import ListagemBids from "./pages/listagemBids";
import BidGoPage from "./pages/BidGoPage";
import LoginPage from "./pages/LoginPage";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div>Loading…</div>}>
                <Routes>
                    <Route path="/" element={<App />} >
                        <Route index element={<BidGoPage />} />
                        <Route path="/teste" element={<BidGoPage />} />
                        <Route path="/listagemBids" element={<ListagemBids />} />
                    </Route>
                    <Route path="/Login" element={<LoginPage />} />
                    <Route path="*" element={<div>NOT FOUND</div>} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}