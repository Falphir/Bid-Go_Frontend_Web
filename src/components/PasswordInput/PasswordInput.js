import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./PasswordInput.css";

export default function PasswordInput({
                                          value,
                                          onChange,
                                          placeholder = "Password",
                                          name,
                                          required = false,
                                          autoComplete = "off",
                                          label,
                                      }) {
    const [show, setShow] = useState(false);

    return (
        <div className="password-input-wrapper">
            {label && <label className="password-label">{label}</label>}
            <div className="password-input-container">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    name={name}
                    required={required}
                    autoComplete={autoComplete}
                />
                <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShow(!show)}
                    aria-label={show ? "Hide password" : "Show password"}
                    title={show ? "Hide password" : "Show password"}
                >
                    {show ? <FiEyeOff /> : <FiEye />}
                </button>
            </div>
        </div>
    );
}
