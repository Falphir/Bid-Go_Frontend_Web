import React, {Suspense} from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App";
import BidGoPage from "./pages/BidGoPage";
import LoginPage from "./pages/LoginPage";
import RequestDetailsPage from "./pages/RequestDetailsPage";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div>Loading…</div>}>
                <Routes>
                    <Route path="/" element={<App />} >
                        <Route index element={<BidGoPage />} />
                        <Route path="/teste" element={<BidGoPage />} />
                        <Route path="/accept-bids/:id" element={<RequestDetailsPage />} />
                    </Route>

                    <Route path="/Login" element={<LoginPage />} />
                    <Route path="*" element={<div>NOT FOUND</div>} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}