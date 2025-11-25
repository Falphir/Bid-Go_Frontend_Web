import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
import { useMe } from "../hooks/useMe";
import "../styles/HistoryPage.css";
import StatusMessage from "../components/feedback/StatusMessage";
import {
    normalizeHistoryDriver,
    normalizeHistoryCompany,
} from "../utils/normalizers";
import HistoryTable from "../components/data/HistoryTable";

function HistoryPage() {
    const { userId, isDriver, isCompany, loading: meLoading } = useMe();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const columns = useMemo(() => {
        if (isDriver) {
            return [
                { key: "companyName", label: "Company Name" },
                { key: "package", label: "Package" },
                { key: "date", label: "Date" },
                { key: "destination", label: "Destination" },
                { key: "price", label: "Price" },
                { key: "status", label: "Status" },
                { key: "rating", label: "Rating" },
            ];
        }

        return [
            { key: "requestId", label: "Request ID" },
            { key: "package", label: "Package" },
            { key: "driverName", label: "Driver Name" },
            { key: "date", label: "Date" },
            { key: "destination", label: "Destination" },
            { key: "price", label: "Price" },
            { key: "status", label: "Status" },
        ];
    }, [isDriver]);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            if (!userId) return;
            setLoading(true);
            setError(null);
            try {
                let res;
                if (isDriver) {
                    res = await api.get(`/history/driver/${userId}`, {
                        signal: controller.signal,
                    });
                    setItems(normalizeHistoryDriver(res.data));
                } else if (isCompany) {
                    res = await api.get(`/history/company/${userId}`, {
                        signal: controller.signal,
                    });
                    setItems(normalizeHistoryCompany(res.data));
                } else {
                    setItems([]);
                }
            } catch (err) {
                if (err?.name === "CanceledError") return;
                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load history."
                );
            } finally {
                setLoading(false);
            }
        };

        load();
        return () => controller.abort();
    }, [isDriver, isCompany, userId]);

    if (meLoading)
        return <StatusMessage type="loading">Validating session…</StatusMessage>;
    if (loading)
        return <StatusMessage type="loading">Loading history…</StatusMessage>;
    if (error) return <StatusMessage type="error">{error}</StatusMessage>;

    const title = isDriver
        ? "Bidding History"
        : isCompany
            ? "Transport Requests History"
            : "History";

    return (
        <div className="history-page">
            <h2 className="section-title">{title}</h2>
            <HistoryTable
                columns={columns}
                rows={items}
                emptyMessage="No records to display."
            />
        </div>
    );
}

export default HistoryPage;
