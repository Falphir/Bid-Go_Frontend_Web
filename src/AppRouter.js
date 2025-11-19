import React, {Suspense} from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App";
import BidGoPage from "./pages/BidGoPage";
import LoginPage from "./pages/LoginPage";
import CreateTransportPage from "./pages/CreateTransportPage";
import RequestDetailsPage from "./pages/RequestDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import HistoryPage from "./pages/HistoryPage";
import MyBidsPage from "./pages/MyBidsPage";
import RegisterPage from "./pages/RegisterPage";
import NotificationPage from "./pages/NotificationPage";


export default function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div>Loading…</div>}>
                <Routes>
                    <Route path="/" element={<App />} >
                        <Route index element={<BidGoPage />} />
                        <Route path="/teste" element={<BidGoPage />} />
                        <Route path="/createRequest" element={<CreateTransportPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/transportRequest/:id" element={<RequestDetailsPage />} />
                        <Route path="/notifications" element={<NotificationPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                         <Route path="/myBids" element={<MyBidsPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Route>
                    <Route path="/Login" element={<LoginPage />} />
                    <Route path="*" element={<div>NOT FOUND</div>} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}