import React, { useState } from 'react';
import './CreateTransportPage.css';

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

  // Submission handler; currently just logs the collected data. Replace
  // console.log with an API call or state management hook as needed.
  const handleSubmit = (e) => {
    e.preventDefault();
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
      imageFile,
      maxPrice,
      biddingStartDate,
      biddingEndDate,
      isAutomaticSelectionEnabled,
    };

    // For file uploads, consider using FormData to bundle data
    // e.g., const formData = new FormData();
    // formData.append('image', imageFile);
    // formData.append('attachment', attachment);

    console.log('Novo pedido de transporte:', payload);
    if (imageFile) {
      console.log('Imagem selecionada:', imageFile.name);
    }
    // Reset or redirect as desired
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
            <label>Dimensões (cm)</label>
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
          <div className="auto-algo">
            <span className="auto-label">Algoritmo Automático</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isAutomaticSelectionEnabled}
                onChange={(e) => setIsAutomaticSelectionEnabled(e.target.checked)}
              />
              <span className="slider" />
            </label>
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