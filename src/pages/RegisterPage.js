import React, { useRef, useState, useEffect } from "react";
import "../styles/RegisterPage.css";
import { useNavigate } from "react-router";
import api from "../api/axiosConfig";
import logo from "../assets/logo.png";
import DriverRegisterForm from "../components/form/DriverRegisterForm";
import CompanyRegisterForm from "../components/form/CompanyRegisterForm";
import { getApiErrorMessage } from "../utils/httpError";
import { useToast } from "../components/feedback/ToastContext";

function RegisterPage() {
    const [mode, setMode] = useState(null);

    const [dName, setDName] = useState("");
    const [dEmail, setDEmail] = useState("");
    const [dPassword, setDPassword] = useState("");
    const [dPhone, setDPhone] = useState("");
    const [dNif, setDNif] = useState("");
    const [dDriverLicense, setDDriverLicense] = useState(null);
    const [dInsurance, setDInsurance] = useState(null);

    const [cName, setCName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [address, setAddress] = useState("");
    const [cEmail, setCEmail] = useState("");
    const [cPassword, setCPassword] = useState("");
    const [cPhone, setCPhone] = useState("");
    const [cNif, setCNif] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortRef = useRef(null);
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        return () => abortRef.current?.abort();
    }, []);

    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.body.classList.add("no-header");

        return () => {
            document.body.style.overflow = prevOverflow;
            document.body.classList.remove("no-header");
        };
    }, []);

    const resetErrors = () => setError(null);

    const submitDriver = async () => {
        resetErrors();
        if (!dName || !dEmail || !dPassword || !dPhone || !dNif) {
            setError("Fill in all required fields.");
            return;
        }
        if (!dDriverLicense || !dInsurance) {
            setError("Upload both Driver License and Insurance images.");
            return;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const form = new FormData();
        form.append("Name", dName);
        form.append("Email", dEmail);
        form.append("Password", dPassword);
        form.append("PhoneNumber", dPhone);
        form.append("Nif", dNif);
        form.append("DriverLicense", dDriverLicense);
        form.append("Insurance", dInsurance);

        setLoading(true);
        try {
            const res = await api.post("/register/driver", form, {
                signal: controller.signal,
            });
            const { token } = res.data || {};
            if (token) localStorage.setItem("token", token);
            showToast("Account successfully registered", "success");
            navigate("/login");
        } catch (err) {
            if (err.name === "CanceledError") return;
            let msg = getApiErrorMessage(err);
            if (!msg) {
                if (err.response)
                    msg = err.response.data?.message || `Error ${err.response.status}`;
                else if (err.request) msg = "Network error: no response from server.";
                else msg = `Error: ${err.message}`;
            }
            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const submitCompany = async () => {
        resetErrors();
        if (
            !cName ||
            !companyName ||
            !address ||
            !cEmail ||
            !cPassword ||
            !cPhone ||
            !cNif
        ) {
            setError("Fill in all required fields.");
            return;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const payload = {
            name: cName,
            companyName,
            address,
            email: cEmail,
            password: cPassword,
            phoneNumber: cPhone,
            nif: cNif,
        };

        setLoading(true);
        try {
            const res = await api.post("/register/company", payload, {
                signal: controller.signal,
            });
            const { token } = res.data || {};
            if (token) localStorage.setItem("token", token);
            showToast("Account successfully registered", "success");
            navigate("/login");
        } catch (err) {
            if (err.name === "CanceledError") return;
            let msg = getApiErrorMessage(err);
            if (!msg) {
                if (err.response)
                    msg = err.response.data?.message || `Error ${err.response.status}`;
                else if (err.request) msg = "Network error: no response from server.";
                else msg = `Error: ${err.message}`;
            }
            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <img src={logo} alt="Bid&Go logo" className="page-logo" />
            <div className="login-container">
                <div className="login-form">
                    <h2 className="login-title">Register</h2>

                    {!mode && (
                        <div>
                            <p
                                style={{
                                    margin: 0,
                                    marginBottom: 12,
                                    color: "#294766",
                                    fontSize: 14,
                                    fontWeight: 600,
                                }}
                            >
                                Choose the account type:
                            </p>
                            <div className="account-mode-selector">
                                <button
                                    type="button"
                                    className="account-option"
                                    onClick={() => setMode("driver")}
                                >
                                    <h3>Driver</h3>
                                    <p>
                                        Register as an Independent Driver to bid on transport jobs.
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    className="account-option"
                                    onClick={() => setMode("company")}
                                >
                                    <h3>Company</h3>
                                    <p>
                                        Create a Business Account to publish Transport Requests and
                                        manage history.
                                    </p>
                                </button>
                            </div>
                        </div>
                    )}

                    {!mode && (
                        <div className="register-login">
                            <span className="register-login-text">Already have an account?</span>
                            <button
                                className="register-login-link"
                                onClick={() => navigate("/login")}
                            >
                                Login here
                            </button>
                        </div>
                    )}

                    {mode === "driver" && (
                        <DriverRegisterForm
                            values={{
                                name: dName,
                                email: dEmail,
                                password: dPassword,
                                phone: dPhone,
                                nif: dNif,
                            }}
                            error={error}
                            loading={loading}
                            onChange={(field, value) => {
                                if (field === "name") setDName(value);
                                if (field === "email") setDEmail(value);
                                if (field === "password") setDPassword(value);
                                if (field === "phone") setDPhone(value);
                                if (field === "nif") setDNif(value);
                                if (field === "driverLicense") setDDriverLicense(value);
                                if (field === "insurance") setDInsurance(value);
                            }}
                            onSubmit={submitDriver}
                            onCancel={() => setMode(null)}
                        />
                    )}

                    {mode === "company" && (
                        <CompanyRegisterForm
                            values={{
                                name: cName,
                                companyName,
                                address,
                                email: cEmail,
                                password: cPassword,
                                phone: cPhone,
                                nif: cNif,
                            }}
                            error={error}
                            loading={loading}
                            onChange={(field, value) => {
                                if (field === "name") setCName(value);
                                if (field === "companyName") setCompanyName(value);
                                if (field === "address") setAddress(value);
                                if (field === "email") setCEmail(value);
                                if (field === "password") setCPassword(value);
                                if (field === "phone") setCPhone(value);
                                if (field === "nif") setCNif(value);
                            }}
                            onSubmit={submitCompany}
                            onCancel={() => setMode(null)}
                        />

                    )}
                    {mode !== null && (
                        <div className="register-login" style={{ marginTop: 20 }}>
                            <span className="register-login-text">Already have an account?</span>
                            <button
                                className="register-login-link"
                                onClick={() => navigate("/login")}
                            >
                                Login here
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
