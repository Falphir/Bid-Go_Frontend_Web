import React, { useRef, useState, useEffect } from 'react';
import './CreateTransportPage.css';
import axios from 'axios';

function CreateTransportPage() {
  const [imageFile, setImageFile] = useState(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [pckg, setPckg] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [dimensions, setDimensions] = useState('//');
  const [pickupDate, setPickupDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [biddingStartDate, setBiddingStartDate] = useState('');
  const [biddingEndDate, setBiddingEndDate] = useState('');
  const [isAutomaticSelectionEnabled, setIsAutomaticSelectionEnabled] = useState(false);
  const [volume, setVolume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const API_URL = 'https://bidgowebapi-a3dtg5f7bzfdc4br.westeurope-01.azurewebsites.net/api/transports/createTransport';

  // Handles image selection through the hidden file input
  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) setImageFile(file);
  };

  // Update the combined dimensions string from parts
  const updateDimensionsString = (l, w, h) => {
    setDimensions(`${l || ''}/${w || ''}/${h || ''}`);
  };

  // Compute volume (cm³) automatically when dimensions change
  useEffect(() => {
    const parse = (v) => {
      if (v === '' || v === null || v === undefined) return NaN;
      const normalized = String(v).replace(',', '.');
      const n = parseFloat(normalized);
      return Number.isFinite(n) ? n : NaN;
    };

    const l = parse(length);
    const w = parse(width);
    const h = parse(height);

    const vol = l * w * h;
    if (Number.isFinite(vol)) setVolume(Math.round(vol));
    else setVolume('');
  }, [length, width, height]);

  // cleanup ao desmontar
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // Submission handler: sends FormData if there's an image, otherwise JSON
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!token) {
        setError('Autenticação: token não encontrado. Faz login e tenta de novo.');
        setLoading(false);
        return;
      }

      // Helper to decode JWT payload safely (browser safe)
      const parseJwt = (tokenStr) => {
        try {
          const parts = tokenStr.split('.');
          if (parts.length < 2) return null;
          const payload = parts[1];
          // base64url -> base64
          const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          // add padding if needed
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
          console.warn('Failed to parse JWT', e);
          return null;
        }
      };

  const tokenPayload = parseJwt(token);
  const userIdFromToken = tokenPayload?.userId ?? tokenPayload?.userID ?? tokenPayload?.sub ?? null;
  // In this system companyId is the same as the user id (user can be a company or driver)
  const companyIdFromToken = userIdFromToken;
  // log for debugging (remove in production)
  console.debug('Extracted userId/companyId from token:', userIdFromToken);

      // normalize numbers: convert numeric-string fields to numbers or null
      const toNumber = (v) => {
        if (v === '' || v === null || v === undefined) return null;
        const n = parseFloat(String(v).replace(',', '.'));
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
        formData.append('image', imageFile);

        // append only non-empty string fields
        if (origin) formData.append('origin', origin);
        if (destination) formData.append('destination', destination);
        if (pckg) formData.append('package', pckg);
        if (weightNum !== null) formData.append('weight', String(weightNum));
        if (lengthNum !== null) formData.append('length', String(lengthNum));
        if (widthNum !== null) formData.append('width', String(widthNum));
        if (heightNum !== null) formData.append('height', String(heightNum));
        if (dimensions) formData.append('dimensions', dimensions);
        if (pickupDate) formData.append('pickupDate', pickupDate);
        if (deliveryDate) formData.append('deliveryDate', deliveryDate);
        if (maxPriceNum !== null) formData.append('maxPrice', String(maxPriceNum));
        if (biddingStartDate) formData.append('biddingStartDate', biddingStartDate);
        if (biddingEndDate) formData.append('biddingEndDate', biddingEndDate);
    if (volumeNum !== null) formData.append('volume', String(volumeNum));
    if (companyIdFromToken) formData.append('companyId', String(companyIdFromToken));
        formData.append('isAutomaticSelectionEnabled', isAutomaticSelectionEnabled ? 'true' : 'false');

        // debug log entries being sent
        console.debug('Sending FormData to', API_URL);
        for (const pair of formData.entries()) console.debug(pair[0], pair[1]);

        await axios.post(API_URL, formData, {
          signal: controller.signal,
          headers: {
            // DO NOT set Content-Type for FormData; the browser will add the boundary
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        const payload = {
          origin: origin || null,
          destination: destination || null,
          pckg: pckg || null,
          weight: weightNum,
          length: lengthNum,
          width: widthNum,
          height: heightNum,
          dimensions: dimensions || null,
          pickupDate: pickupDate || null,
          deliveryDate: deliveryDate || null,
          maxPrice: maxPriceNum,
          biddingStartDate: biddingStartDate || null,
          biddingEndDate: biddingEndDate || null,
          volume: volumeNum,
          companyId: companyIdFromToken || null,
          isAutomaticSelectionEnabled,
        };

        console.debug('Sending JSON payload to', API_URL, payload);

        await axios.post(API_URL, payload, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Success: you can clear the form or show a message here
      // For now, reset loading and keep the data for user feedback
      setLoading(false);
    } catch (err) {
      if (axios.isCancel?.(err) || err.name === 'CanceledError') return;
      if (err.response) {
        const body = err.response.data ? ` - ${JSON.stringify(err.response.data)}` : '';
        setError(`Server error: ${err.response.status} ${err.response.statusText}${body}`);
      } else if (err.request) {
        setError('Network error: no response from server');
      } else {
        setError(`Request error: ${err.message}`);
      }
      setLoading(false);
    }
  };

  return (
    <div className="create-transport-container">
      <h2 className="create-title">Novo Pedido de Transporte</h2>
      <form className="transport-form" onSubmit={handleSubmit}>
        {/* Image upload drop zone */}
        <div className="drop-zone-wrapper">
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload" className="drop-zone">
            {/* Icon representing image upload */}
            <svg
              className="upload-icon"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="2"
                y="3"
                width="20"
                height="18"
                rx="2"
                stroke="#7a8fa6"
                strokeWidth="2"
              />
              <path
                d="M3 16l5-5 3 3 4-4 6 6"
                stroke="#7a8fa6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="16.5" cy="7.5" r="1.5" fill="#7a8fa6" />
            </svg>
            <p className="drop-title">Carregar Imagem</p>
            <span className="drop-instruction">Arraste e solte ou clique para selecionar</span>
          </label>
          {imageFile && <p className="file-name">{imageFile.name}</p>}
        </div>

        {/* Fields for origin and destination */}
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

        {/* Cargo type */}
        <div className="field">
          <label>Tipo de Mercadoria</label>
          <input
            type="text"
            placeholder="Ex.: Eletrodoméstico"
            value={pckg}
            onChange={(e) => setPckg(e.target.value)}
          />
        </div>

        {/* Weight and dimensions */}
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

          <div className="field">
            <div className="dimensions-header">
              <label>Dimensões (cm)</label>
              <div className="volume-inline">{volume ? `${volume} cm³` : ''}</div>
            </div>
            <div className="dimensions-group">
              <input
                className="dimensions-input"
                type="text"
                placeholder="Comprimento"
                value={length}
                onChange={(e) => {
                  setLength(e.target.value);
                  updateDimensionsString(e.target.value, width, height);
                }}
                aria-label="Comprimento (cm)"
              />
              <span className="dimensions-sep">/</span>
              <input
                className="dimensions-input"
                type="text"
                placeholder="Largura"
                value={width}
                onChange={(e) => {
                  setWidth(e.target.value);
                  updateDimensionsString(length, e.target.value, height);
                }}
                aria-label="Largura (cm)"
              />
              <span className="dimensions-sep">/</span>
              <input
                className="dimensions-input"
                type="text"
                placeholder="Altura"
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                  updateDimensionsString(length, width, e.target.value);
                }}
                aria-label="Altura (cm)"
              />
            </div>
            <input type="hidden" value={dimensions} readOnly />
          </div>
        </div>

        {/* Dates */}
        <div className="row">
          <div className="field">
            <label>Data de recolha</label>
            <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Data de entrega</label>
            <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
          </div>
        </div>

        {/* Auction start/end (moved to top) */}
        <div className="row">
          <div className="field">
            <label>Início do Leilão</label>
            <input type="date" value={biddingStartDate} onChange={(e) => setBiddingStartDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Fim do Leilão</label>
            <input type="date" value={biddingEndDate} onChange={(e) => setBiddingEndDate(e.target.value)} />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>Preço Máximo (€)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex.: 150.00"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Algoritmo Automático</label>
            <div className="auto-algo">
              <label className="switch">
                <input type="checkbox" checked={isAutomaticSelectionEnabled} onChange={(e) => setIsAutomaticSelectionEnabled(e.target.checked)} />
                <span className="slider" />
              </label>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Enviando...' : 'Criar Pedido'}
        </button>
      </form>
    </div>
  );
}

export default CreateTransportPage;