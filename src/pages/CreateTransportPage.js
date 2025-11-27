import React, { useState, useEffect } from "react";
import "../styles/CreateTransportPage.css";
import { getApiErrorMessage } from "../utils/httpError";
import { useToast } from "../components/feedback/ToastContext";
import ImageUpload from "../components/form/ImageUpload";
import DimensionFields from "../components/form/DimensionFields";
import DateFields from "../components/form/DateFields";
import AuctionDatesFields from "../components/form/AuctionDatesFields";
import PriceAutoSelectionFields from "../components/form/PriceAutoSelectionFields";
import { useNavigate } from "react-router";
import Button from "../components/Button/Button";
import useCreateTransport from "../hooks/useCreateTransport";

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
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { createTransport, createDraft, loading } = useCreateTransport();

    

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

        // build payload/form and use createDraft from hook
        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append("image", imageFile);

                formData.append("origin", origin);
                formData.append("destination", destination);
                formData.append("package", pckg);
                formData.append("weight", Number(weight) || null);
                formData.append("length", Number(length) || null);
                formData.append("width", Number(width) || null);
                formData.append("height", Number(height) || null);
                formData.append("dimensions", dimensions);
                formData.append("pickupDate", pickupDate);
                formData.append("deliveryDate", deliveryDate);
                formData.append("maxPrice", Number(maxPrice) || null);
                formData.append("biddingStartDate", biddingStartDate);
                formData.append("biddingEndDate", biddingEndDate);
                formData.append("volume", Number(volume) || null);
                const token = localStorage.getItem("token");
                const tokenPayload = parseJwt(token);
                const userId = tokenPayload?.userId || tokenPayload?.sub || null;
                formData.append("companyId", String(userId));
                formData.append(
                    "isAutomaticSelectionEnabled",
                    isAutomaticSelectionEnabled ? "true" : "false"
                );

                await createDraft({ isForm: true, payload: formData });
            } else {
                const token = localStorage.getItem("token");
                const tokenPayload = parseJwt(token);
                const userId = tokenPayload?.userId || tokenPayload?.sub || null;

                const payload = {
                    origin,
                    destination,
                    pckg,
                    weight: Number(weight) || null,
                    length: Number(length) || null,
                    width: Number(width) || null,
                    height: Number(height) || null,
                    dimensions,
                    pickupDate,
                    deliveryDate,
                    maxPrice: Number(maxPrice) || null,
                    biddingStartDate,
                    biddingEndDate,
                    volume: Number(volume) || null,
                    companyId: userId,
                    isAutomaticSelectionEnabled,
                };

                await createDraft({ isForm: false, payload });
            }

            showToast("Draft created successfully.", "success");
            navigate("/myTransports");
        } catch (err) {
            const msg = getApiErrorMessage(err);
            showToast(msg, "error");
        }
    };

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

    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();

        const successMessage = "Request created successfully.";
        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append("image", imageFile);

                formData.append("origin", origin);
                formData.append("destination", destination);
                formData.append("package", pckg);
                formData.append("weight", Number(weight) || null);
                formData.append("length", Number(length) || null);
                formData.append("width", Number(width) || null);
                formData.append("height", Number(height) || null);
                formData.append("dimensions", dimensions);
                formData.append("pickupDate", pickupDate);
                formData.append("deliveryDate", deliveryDate);
                formData.append("maxPrice", Number(maxPrice) || null);
                formData.append("biddingStartDate", biddingStartDate);
                formData.append("biddingEndDate", biddingEndDate);
                formData.append("volume", Number(volume) || null);
                const token = localStorage.getItem("token");
                const tokenPayload = parseJwt(token);
                const userId = tokenPayload?.userId || tokenPayload?.sub || null;
                formData.append("companyId", String(userId));
                formData.append(
                    "isAutomaticSelectionEnabled",
                    isAutomaticSelectionEnabled ? "true" : "false"
                );

                await createTransport({ isForm: true, payload: formData });
            } else {
                const token = localStorage.getItem("token");
                const tokenPayload = parseJwt(token);
                const userId = tokenPayload?.userId || tokenPayload?.sub || null;

                const payload = {
                    origin,
                    destination,
                    pckg,
                    weight: Number(weight) || null,
                    length: Number(length) || null,
                    width: Number(width) || null,
                    height: Number(height) || null,
                    dimensions,
                    pickupDate,
                    deliveryDate,
                    maxPrice: Number(maxPrice) || null,
                    biddingStartDate,
                    biddingEndDate,
                    volume: Number(volume) || null,
                    companyId: userId,
                    isAutomaticSelectionEnabled,
                };

                await createTransport({ isForm: false, payload });
            }

            showToast(successMessage, "success");
            navigate("/myTransports");
        } catch (err) {
            const msg = getApiErrorMessage(err);
            showToast(msg, "error");
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
