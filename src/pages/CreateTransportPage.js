import React, { useRef, useState, useEffect } from "react";
import "../styles/CreateTransportPage.css";
import api from "../api/axiosConfig";
import { getApiErrorMessage } from "../utils/httpError";
import { useToast } from "../components/feedback/ToastContext";
import ImageUpload from "../components/form/ImageUpload";
import DimensionFields from "../components/form/DimensionFields";
import DateFields from "../components/form/DateFields";
import AuctionDatesFields from "../components/form/AuctionDatesFields";
import PriceAutoSelectionFields from "../components/form/PriceAutoSelectionFields";
import { useNavigate } from "react-router";
import Button from "../components/Button/Button";

const validateTransportFields = ({
                                     origin,
                                     destination,
                                     pckg,
                                     weight,
                                     length,
                                     width,
                                     height,
                                     pickupDate,
                                     deliveryDate,
                                     biddingStartDate,
                                     biddingEndDate,
                                     maxPrice,
                                     volume,
                                     imageFile,
                                 }) => {
    const missing = [];

    if (!origin?.trim()) missing.push("Origin");
    if (!destination?.trim()) missing.push("Destination");
    if (!pckg?.trim()) missing.push("Package Type");
    if (!weight?.trim()) missing.push("Weight");
    if (!length?.trim()) missing.push("Length");
    if (!width?.trim()) missing.push("Width");
    if (!height?.trim()) missing.push("Height");
    if (!pickupDate?.trim()) missing.push("Pickup Date");
    if (!deliveryDate?.trim()) missing.push("Delivery Date");
    if (!biddingStartDate?.trim()) missing.push("Auction Start");
    if (!biddingEndDate?.trim()) missing.push("Auction End");
    if (!maxPrice?.trim()) missing.push("Max Price");
    if (!volume?.trim()) missing.push("Volume");

    if (!imageFile) missing.push("Image");

    return missing;
};

function CreateTransportPage() {
    const [imageFile, setImageFile] = useState(null);
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [pckg, setPckg] = useState("");
    const [weight, setWeight] = useState("");
    const [length, setLength] = useState("");
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");
    const [dimensions, setDimensions] = useState("//");
    const [pickupDate, setPickupDate] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [biddingStartDate, setBiddingStartDate] = useState("");
    const [biddingEndDate, setBiddingEndDate] = useState("");
    const [isAutomaticSelectionEnabled, setIsAutomaticSelectionEnabled] =
        useState(false);
    const [volume, setVolume] = useState("");
    const [loading, setLoading] = useState(false);
    const abortRef = useRef(null);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const API_URL = "/transports/createTransport";
    const API_URL_DRAFT = "/transports/createDRAFTTransport";

    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) setImageFile(file);
    };

    const updateDimensionsString = (l, w, h) => {
        setDimensions(`${l || ""}/${w || ""}/${h || ""}`);
    };

    useEffect(() => {
        const parse = (v) => {
            if (!v) return NaN;
            const n = parseFloat(String(v).replace(",", "."));
            return Number.isFinite(n) ? n : NaN;
        };

        const l = parse(length);
        const w = parse(width);
        const h = parse(height);

        const vol = l * w * h;

        if (Number.isFinite(vol)) setVolume(String(Math.round(vol)));
        else setVolume("");
    }, [length, width, height]);

    useEffect(() => {
        return () => abortRef.current?.abort();
    }, []);

    const handleCreateDraft = async () => {
        const missing = validateTransportFields({
            origin,
            destination,
            pckg,
            weight,
            length,
            width,
            height,
            pickupDate,
            deliveryDate,
            biddingStartDate,
            biddingEndDate,
            maxPrice,
            volume,
            imageFile,
        });

        if (missing.length > 0) {
            showToast(
                `Missing required fields to create DRAFT: ${missing.join(", ")}`,
                "error"
            );
            return;
        }

        await handleSubmit(null, API_URL_DRAFT, "Draft created successfully.");
    };

    const handleSubmit = async (
        e,
        targetUrl = API_URL,
        successMessage = "Request created successfully."
    ) => {
        if (e?.preventDefault) e.preventDefault();

        setLoading(true);
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                showToast("Token not found. Please log in again.", "error");
                setLoading(false);
                return;
            }

            const parseJwt = (tokenStr) => {
                try {
                    const parts = tokenStr.split(".");
                    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                    const padded = b64.padEnd(
                        b64.length + (4 - (b64.length % 4)) % 4,
                        "="
                    );
                    const json = decodeURIComponent(
                        atob(padded)
                            .split("")
                            .map((c) =>
                                "%" + c.charCodeAt(0).toString(16).padStart(2, "0")
                            )
                            .join("")
                    );
                    return JSON.parse(json);
                } catch {
                    return null;
                }
            };

            const tokenPayload = parseJwt(token);
            const userId = tokenPayload?.userId || tokenPayload?.sub || null;

            const toNumber = (v) => {
                if (!v) return null;
                const n = parseFloat(String(v).replace(",", "."));
                return Number.isFinite(n) ? n : null;
            };

            const weightNum = toNumber(weight);
            const lengthNum = toNumber(length);
            const widthNum = toNumber(width);
            const heightNum = toNumber(height);
            const maxPriceNum = toNumber(maxPrice);
            const volumeNum = toNumber(volume);

            if (imageFile) {
                const formData = new FormData();
                formData.append("image", imageFile);

                formData.append("origin", origin);
                formData.append("destination", destination);
                formData.append("package", pckg);
                formData.append("weight", weightNum);
                formData.append("length", lengthNum);
                formData.append("width", widthNum);
                formData.append("height", heightNum);
                formData.append("dimensions", dimensions);
                formData.append("pickupDate", pickupDate);
                formData.append("deliveryDate", deliveryDate);
                formData.append("maxPrice", maxPriceNum);
                formData.append("biddingStartDate", biddingStartDate);
                formData.append("biddingEndDate", biddingEndDate);
                formData.append("volume", volumeNum);
                formData.append("companyId", String(userId));
                formData.append(
                    "isAutomaticSelectionEnabled",
                    isAutomaticSelectionEnabled ? "true" : "false"
                );

                await api.post(targetUrl, formData, { signal: controller.signal });
            } else {
                await api.post(
                    targetUrl,
                    {
                        origin,
                        destination,
                        pckg,
                        weight: weightNum,
                        length: lengthNum,
                        width: widthNum,
                        height: heightNum,
                        dimensions,
                        pickupDate,
                        deliveryDate,
                        maxPrice: maxPriceNum,
                        biddingStartDate,
                        biddingEndDate,
                        volume: volumeNum,
                        companyId: userId,
                        isAutomaticSelectionEnabled,
                    },
                    { signal: controller.signal }
                );
            }

            showToast(successMessage, "success");
            navigate("/myTransports");
        } catch (err) {
            const msg = getApiErrorMessage(err);
            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-transport-container">
            <h2 className="create-title">New Transport Request</h2>

            <form
                className="transport-form"
                onSubmit={(e) => {
                    const missing = validateTransportFields({
                        origin,
                        destination,
                        pckg,
                        weight,
                        length,
                        width,
                        height,
                        pickupDate,
                        deliveryDate,
                        biddingStartDate,
                        biddingEndDate,
                        maxPrice,
                        volume,
                        imageFile,
                    });

                    if (missing.length > 0) {
                        e.preventDefault();
                        showToast(
                            `Fill all required fields: ${missing.join(", ")}`,
                            "error"
                        );
                        return;
                    }

                    handleSubmit(e);
                }}
            >
                <ImageUpload file={imageFile} onChange={handleImageChange} />

                <div className="row">
                    <div className="field">
                        <label>Origin</label>
                        <input
                            className="Origin"
                            type="text"
                            placeholder="Address / District / Postal Code"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label>Destination</label>
                        <input
                          className="Destination"
                            type="text"
                            placeholder="Address / District / Postal Code"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                    </div>
                </div>

                <div className="field">
                    <label>Package Type</label>
                    <input
                    className="PackageType"
                        type="text"
                        placeholder="Ex.: Household appliance"
                        value={pckg}
                        onChange={(e) => setPckg(e.target.value)}
                    />
                </div>

                <div className="row">
                    <div className="field">
                      
                        <label>Weight (kg)</label>
                        <input
                        className="Weight"
                            type="text"
                            placeholder="Ex.: 10"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                        />
                    </div>

                    <DimensionFields
            
                        length={length}
                        width={width}
                        height={height}
                        volume={volume}
                        onChange={(field, value) => {
                            if (field === "length") setLength(value);
                            if (field === "width") setWidth(value);
                            if (field === "height") setHeight(value);

                            updateDimensionsString(
                                field === "length" ? value : length,
                                field === "width" ? value : width,
                                field === "height" ? value : height
                            );
                        }}
                    />
                </div>

                <DateFields
                    pickupDate={pickupDate}
                    deliveryDate={deliveryDate}
                    onChange={(field, value) => {
                        if (field === "pickupDate") setPickupDate(value);
                        if (field === "deliveryDate") setDeliveryDate(value);
                    }}
                />

                <AuctionDatesFields
                    biddingStartDate={biddingStartDate}
                    biddingEndDate={biddingEndDate}
                    onChange={(field, value) => {
                        if (field === "biddingStartDate") setBiddingStartDate(value);
                        if (field === "biddingEndDate") setBiddingEndDate(value);
                    }}
                />

                <PriceAutoSelectionFields
                    maxPrice={maxPrice}
                    isAutomaticSelectionEnabled={isAutomaticSelectionEnabled}
                    onChange={(field, value) => {
                        if (field === "maxPrice") setMaxPrice(value);
                        if (field === "isAutomaticSelectionEnabled")
                            setIsAutomaticSelectionEnabled(value);
                    }}
                />

                <div className="form-actions" style={{ display: "flex", gap: "12px" }}>
                    <Button variant="secondary" type="button" onClick={handleCreateDraft}>
                        {loading ? "Please wait…" : "Create DRAFT"}
                    </Button>

                    <Button variant="primary" type="submit">
                        {loading ? "Creating…" : "Create Request"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default CreateTransportPage;
