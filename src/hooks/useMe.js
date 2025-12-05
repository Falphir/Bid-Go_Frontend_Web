import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import axios from "axios";

/**
 * Converts an array of claim objects into a simpler user descriptor.
 *
 * @param {Object[]} [claims] - Raw claims array returned by the backend.
 * @returns {{nameId: (string|null), userId: (number|null), userType: (string|null), exp: (number|null), iss: (string|null), aud: (string|null)}}
 *   Normalized user claims object.
 */
function claimsArrayToObject(claims = []) {
  const map = {};
  for (const c of claims) map[c.type] = c.value;
  return {
    nameId:
      map[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ?? null,
    userId: map["userId"] ? Number(map["userId"]) : null,
    userType: map["userType"] ?? null,
    exp: map["exp"] ? Number(map["exp"]) : null,
    iss: map["iss"] ?? null,
    aud: map["aud"] ?? null,
  };
}

/**
 * Hook that exposes information about the currently authenticated user.
 *
 * It tries to parse the JWT token stored in local/session storage for a
 * quick synchronous initialization and then validates the session by
 * calling the `auth/me` endpoint. It derives convenience flags for the
 * user role (driver/company).
 *
 * @returns {{
 *   me: (Object|null),
 *   userId: (number|null),
 *   role: (string|null),
 *   isDriver: boolean,
 *   isCompany: boolean,
 *   loading: boolean,
 *   error: any
 * }} User descriptor and related state flags.
 */
export function useMe() {
  const parseJwtSync = (tokenStr) => {
    try {
      const parts = tokenStr.split(".");
      if (parts.length < 2) return null;
      const payload = parts[1];
      const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const pad = b64.length % 4;
      const padded = pad ? b64 + "=".repeat(4 - pad) : b64;
      const json = decodeURIComponent(
        atob(padded)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  };

  const tokenSync = localStorage.getItem("token")

  const initialMe = (() => {
    if (!tokenSync) return null;
    const payload = parseJwtSync(tokenSync);
    if (!payload) return null;
    return {
      nameId:
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ?? null,
      userId: payload.userId
        ? Number(payload.userId)
        : payload.sub
        ? Number(payload.sub)
        : null,
      userType: payload.role ?? null,
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

    const token =
      localStorage.getItem("token");
    const parseJwt = (tokenStr) => {
      try {
        const parts = tokenStr.split(".");
        if (parts.length < 2) return null;
        const payload = parts[1];
        const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const pad = b64.length % 4;
        const padded = pad ? b64 + "=".repeat(4 - pad) : b64;
        const json = decodeURIComponent(
          atob(padded)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        return JSON.parse(json);
      } catch (e) {
        return null;
      }
    };

    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        const quick = {
          nameId:
            payload[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ] ?? null,
          userId: payload.userId
            ? Number(payload.userId)
            : payload.sub
            ? Number(payload.sub)
            : null,
          userType: payload.role ?? null,
          exp: payload.exp ? Number(payload.exp) : null,
          iss: payload.iss ?? null,
          aud: payload.aud ?? null,
        };
        setMe(quick);
        setLoading(false);
      }
    }

    (async () => {
      try {
        const res = await api.get("auth/me", { signal: controller.signal });
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
