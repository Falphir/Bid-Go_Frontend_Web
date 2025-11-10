import React, { useRef, useState, useEffect } from 'react';
import './CreateTransportPage.css';
import axios from "axios";


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

  // Handles image selection through the hidden file input
  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  // Update the combined dimensions string from parts
  const updateDimensionsString = (l, w, h) => {
    setDimensions(`${l || ''}/${w || ''}/${h || ''}`);
  };

  // Compute volume (cm³) automatically when dimensions change
  useEffect(() => {
    // accept commas as decimal separators
    const parse = (v) => {
      if (!v && v !== 0) return NaN;
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const url = "https://bidgowebapi-a3dtg5f7bzfdc4br.westeurope-01.azurewebsites.net/api/transports/createTransport";

        let res;
        // If an image is present, submit as multipart/form-data
        if (imageFile) {
          const formData = new FormData();
          formData.append('image', imageFile);
          formData.append('origin', origin);
          formData.append('destination', destination);
          formData.append('pckg', pckg);
          formData.append('weight', weight);
          formData.append('length', length);
          formData.append('width', width);
          formData.append('height', height);
          formData.append('dimensions', dimensions);
          formData.append('pickupDate', pickupDate);
          formData.append('deliveryDate', deliveryDate);
          formData.append('maxPrice', maxPrice);
          formData.append('biddingStartDate', biddingStartDate);
          formData.append('biddingEndDate', biddingEndDate);
          formData.append('volume', volume);
          formData.append('isAutomaticSelectionEnabled', isAutomaticSelectionEnabled ? 'true' : 'false');

          res = await axios.post(url, formData, {
            signal: controller.signal,
            headers: {
              // Let axios/browser set the Content-Type with boundary for FormData
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaWd1ZWxAZ21haWwuY29tIiwidXNlcklkIjoiMiIsInVzZXJUeXBlIjoiQ29tcGFueSIsImV4cCI6MTc2Mjc3NjY5NCwiaXNzIjoiQmlkR29CYWNrZW5kIiwiYXVkIjoiQmlkR29Gcm9udGVuZCJ9.OJIOZLVMVuzzU7ja6DWG2ROZgvogM_ZZbrzD_ajSQ_4`
            }
          });
        } else {
          const payload = {
            origin,
            destination,
            pckg,
            weight,
            length,
            width,
            height,
            pickupDate,
            deliveryDate,
            maxPrice,
            biddingStartDate,
            biddingEndDate,
            volume,
            isAutomaticSelectionEnabled,
          };

          res = await axios.post(url, payload, {
            signal: controller.signal,
            headers: { "Content-Type": "application/json", Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaWd1ZWxAZ21haWwuY29tIiwidXNlcklkIjoiMiIsInVzZXJUeXBlIjoiQ29tcGFueSIsImV4cCI6MTc2Mjc3NjY5NCwiaXNzIjoiQmlkR29CYWNrZW5kIiwiYXVkIjoiQmlkR29Gcm9udGVuZCJ9.OJIOZLVMVuzzU7ja6DWG2ROZgvogM_ZZbrzD_ajSQ_4` }
          });
        }
        // Optionally handle res here (e.g., show success message)
      } catch (err) {
        if (axios.isCancel?.(err) || err.name === 'CanceledError') return;
        if (err.response) {
          // Server responded with a non-2xx status
          setError(`Server error: ${err.response.status} ${err.response.statusText}`);
        } else if (err.request) {
          // No response received
          setError('Network error: no response from server' + err.request);
        } else {
          // Something else happened while setting up the request
          setError(`Request error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    abortRef.current = controller;
    

    setLoading(true);
    try {
      const res = await axios.post(
        "https://bidgowebapi-a3dtg5f7bzfdc4br.westeurope-01.azurewebsites.net/api/transports/createTransport",
        payload,
        {
          signal: controller.signal, // <- usa o controller local
          headers: { "Content-Type": "application/json", Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtaWd1ZWxAZ21haWwuY29tIiwidXNlcklkIjoiMiIsInVzZXJUeXBlIjoiQ29tcGFueSIsImV4cCI6MTc2Mjc3NjY5NCwiaXNzIjoiQmlkR29CYWNrZW5kIiwiYXVkIjoiQmlkR29Gcm9udGVuZCJ9.OJIOZLVMVuzzU7ja6DWG2ROZgvogM_ZZbrzD_ajSQ_4` }
        }
      );
      } catch (err) {
        if (axios.isCancel?.(err) || err.name === 'CanceledError') return;
      if (err.response) {
        // Server responded with a non-2xx status
        setError(`Server error: ${err.response.status} ${err.response.statusText}`);
      } else if (err.request) {
        // No response received
        setError('Network error: no response from server' + err.request);
      } else {
        // Something else happened while setting up the request
        setError(`Request error: ${err.message}`);
      }
    } finally {
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
            <span className="drop-instruction">
              Arraste e solte ou clique para selecionar
            </span>
          </label>
          {imageFile && (
            <p className="file-name">{imageFile.name}</p>
          )}
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
                onChange={(e) => { setLength(e.target.value); updateDimensionsString(e.target.value, width, height); }}
                aria-label="Comprimento (cm)"
              />
              <span className="dimensions-sep">/</span>
              <input
                className="dimensions-input"
                type="text"
                placeholder="Largura"
                value={width}
                onChange={(e) => { setWidth(e.target.value); updateDimensionsString(length, e.target.value, height); }}
                aria-label="Largura (cm)"
              />
              <span className="dimensions-sep">/</span>
              <input
                className="dimensions-input"
                type="text"
                placeholder="Altura"
                value={height}
                onChange={(e) => { setHeight(e.target.value); updateDimensionsString(length, width, e.target.value); }}
                aria-label="Altura (cm)"
              />
              
            </div>
            {/* Hidden combined value kept for convenience */}
            <input type="hidden" value={dimensions} readOnly />
          </div>
        </div>

        {/* Dates */}
        <div className="row">
          <div className="field">
            <label>Data de recolha</label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Data de entrega</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </div>
        </div>


    {/* Auction start/end (moved to top) */}
        <div className="row">
          <div className="field">
            <label>Início do Leilão</label>
            <input
              type="date"
              value={biddingStartDate}
              onChange={(e) => setBiddingStartDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Fim do Leilão</label>
            <input
              type="date"
              value={biddingEndDate}
              onChange={(e) => setBiddingEndDate(e.target.value)}
            />
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
                <input
                  type="checkbox"
                  checked={isAutomaticSelectionEnabled}
                  onChange={(e) => setIsAutomaticSelectionEnabled(e.target.checked)}
                />
                <span className="slider" />
              </label>
            </div>
          </div>
        </div>
        {/* Optional submit button; feel free to remove or customize as needed */}
        <button type="submit" className="submit-button">
          Criar Pedido
        </button>
      </form>
    </div>
  );
}


export default CreateTransportPage;