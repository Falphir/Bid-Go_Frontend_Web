import React, { useRef, useState, useEffect } from "react";
import "../styles/CreateTransportPage.css";
import axios from "axios";
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

// 🔥 GLOBAL VALIDATION FUNCTION
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

    if (!origin?.trim()) missing.push("Origem");
    if (!destination?.trim()) missing.push("Destino");
    if (!pckg?.trim()) missing.push("Tipo de Mercadoria");
    if (!weight?.trim()) missing.push("Peso");
    if (!length?.trim()) missing.push("Comprimento");
    if (!width?.trim()) missing.push("Largura");
    if (!height?.trim()) missing.push("Altura");
    if (!pickupDate?.trim()) missing.push("Data de Recolha");
    if (!deliveryDate?.trim()) missing.push("Data de Entrega");
    if (!biddingStartDate?.trim()) missing.push("Início do Leilão");
    if (!biddingEndDate?.trim()) missing.push("Fim do Leilão");
    if (!maxPrice?.trim()) missing.push("Preço Máximo");
    if (!volume?.trim()) missing.push("Volume");

    if (!imageFile) missing.push("Imagem");

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

    // IMAGE SELECT
    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) setImageFile(file);
    };

    // UPDATE DIMENSIONS STRING
    const updateDimensionsString = (l, w, h) => {
        setDimensions(`${l || ""}/${w || ""}/${h || ""}`);
    };

    // AUTO-COMPUTE VOLUME
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

    // CLEANUP
    useEffect(() => {
        return () => abortRef.current?.abort();
    }, []);

    // HANDLER: CREATE DRAFT
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
                `Campos em falta para criar DRAFT: ${missing.join(", ")}`,
                "error"
            );
            return;
        }

        await handleSubmit(null, API_URL_DRAFT, "Rascunho criado com sucesso.");
    };

    // HANDLER: CREATE TRANSPORT
    const handleSubmit = async (
        e,
        targetUrl = API_URL,
        successMessage = "Pedido criado com sucesso."
    ) => {
        if (e?.preventDefault) e.preventDefault();

        setLoading(true);
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                showToast("Token não encontrado. Faz login novamente.", "error");
                setLoading(false);
                return;
            }

            // Decode JWT
            const parseJwt = (tokenStr) => {
                try {
                    const parts = tokenStr.split(".");
                    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, "=");
                    const json = decodeURIComponent(
                        atob(padded)
                            .split("")
                            .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                            .join("")
                    );
                    return JSON.parse(json);
                } catch {
                    return null;
                }
            };

            const tokenPayload = parseJwt(token);
            const userId = tokenPayload?.userId || tokenPayload?.sub || null;

            // number converter
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

            // FORM DATA OR JSON
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
            navigate("/myTransports"); // redirect after success

        } catch (err) {
            const msg = getApiErrorMessage(err);
            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-transport-container">
            <h2 className="create-title">Novo Pedido de Transporte</h2>

            {/* FORM */}
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
                            `Preenche todos os campos obrigatórios: ${missing.join(", ")}`,
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
                        <label>Origem</label>
                        <input
                            type="text"
                            placeholder="Morada / Distrito / Código Postal"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label>Destino</label>
                        <input
                            type="text"
                            placeholder="Morada / Distrito / Código Postal"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                    </div>
                </div>

                <div className="field">
                    <label>Tipo de Mercadoria</label>
                    <input
                        type="text"
                        placeholder="Ex.: Eletrodoméstico"
                        value={pckg}
                        onChange={(e) => setPckg(e.target.value)}
                    />
                </div>

                <div className="row">
                    <div className="field">
                        <label>Peso (kg)</label>
                        <input
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
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={handleCreateDraft}
                    >
                        Criar DRAFT
                    </Button>

                    <Button
                        variant="primary"
                        type="submit"
                    >
                        Criar Pedido
                    </Button>
                </div>


            </form>
        </div>
    );
}

export default CreateTransportPage;
