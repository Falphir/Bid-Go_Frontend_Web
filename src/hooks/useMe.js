// src/hooks/useMe.js
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import axios from "axios";

function claimsArrayToObject(claims = []) {
    const map = {};
    for (const c of claims) map[c.type] = c.value;
    return {
        nameId: map["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ?? null,
        userId: map["userId"] ? Number(map["userId"]) : null,
        userType: map["userType"] ?? null,
        exp: map["exp"] ? Number(map["exp"]) : null,
        iss: map["iss"] ?? null,
        aud: map["aud"] ?? null,
    };
}

export function useMe() {
    // Fast-path: synchronously derive initial `me` from token so userId is
    // available on first render (avoids components racing with the background
    // auth/me request).
    const parseJwtSync = (tokenStr) => {
        try {
            const parts = tokenStr.split('.');
            if (parts.length < 2) return null;
            const payload = parts[1];
            const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const pad = b64.length % 4;
            const padded = pad ? b64 + '='.repeat(4 - pad) : b64;
            const json = decodeURIComponent(
                atob(padded)
                    .split('')
                    .map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join('')
            );
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    };

    const tokenSync =
        localStorage.getItem('token') || localStorage.getItem('access_token') ||
        sessionStorage.getItem('token') || sessionStorage.getItem('access_token');

    const initialMe = (() => {
        if (!tokenSync) return null;
        const payload = parseJwtSync(tokenSync);
        if (!payload) return null;
        return {
            nameId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? null,
            userId: payload.userId ? Number(payload.userId) : (payload.sub ? Number(payload.sub) : null),
            userType: payload.userType ?? payload.role ?? null,
            exp: payload.exp ? Number(payload.exp) : null,
            iss: payload.iss ?? null,
            aud: payload.aud ?? null,
        };
    })();

    const [me, setMe] = useState(initialMe);
    const [loading, setLoading] = useState(initialMe ? false : true);
    const [error, setError] = useState(null);
    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();

        // Try to synchronously derive claims from the token (fast path)
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const parseJwt = (tokenStr) => {
            try {
                const parts = tokenStr.split('.');
                if (parts.length < 2) return null;
                const payload = parts[1];
                const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
                const pad = b64.length % 4;
                const padded = pad ? b64 + '='.repeat(4 - pad) : b64;
                const json = decodeURIComponent(
                    atob(padded)
                        .split('')
                        .map(function (c) {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        })
                        .join('')
                );
                return JSON.parse(json);
            } catch (e) {
                return null;
            }
        };

        if (token) {
            const payload = parseJwt(token);
            if (payload) {
                // Map common claim names into the same object shape
                const quick = {
                    nameId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? null,
                    userId: payload.userId ? Number(payload.userId) : (payload.sub ? Number(payload.sub) : null),
                    userType: payload.userType ?? payload.role ?? null,
                    exp: payload.exp ? Number(payload.exp) : null,
                    iss: payload.iss ?? null,
                    aud: payload.aud ?? null,
                };
                setMe(quick);
                setLoading(false);
            }
        }

        // Background: refresh authoritative user claims from API
        (async () => {
            try {
                // Only call if component still mounted
                const res = await api.get('auth/me', { signal: controller.signal }); // ajusta rota se preciso
                if (!cancelled) setMe(claimsArrayToObject(res.data?.claims || []));
            } catch (e) {
                if (!axios.isCancel(e) && !cancelled) setError(e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, []);

    const role = me?.userType ?? null;
    const userId = me?.userId ?? null;
    const isDriver = role?.toLowerCase() === "driver";
    const isCompany = role?.toLowerCase() === "company";

    return { me, userId, role, isDriver, isCompany, loading, error };
}