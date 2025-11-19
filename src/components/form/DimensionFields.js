import React from 'react';

export default function DimensionFields({ length, width, height, volume, onChange }) {
  const handle = (field, value) => {
    onChange(field, value);
  };
  return (
    <div className="field">
      <div className="dimensions-header">
        <label>Dimensões (cm)</label>
        <div className="volume-inline">{volume ? `${volume} cm³` : ''}</div>
      </div>
      <div className="dimensions-group">
        <input className="dimensions-input" type="text" placeholder="Comprimento" value={length} onChange={(e) => handle('length', e.target.value)} aria-label="Comprimento (cm)" />
        <span className="dimensions-sep">/</span>
        <input className="dimensions-input" type="text" placeholder="Largura" value={width} onChange={(e) => handle('width', e.target.value)} aria-label="Largura (cm)" />
        <span className="dimensions-sep">/</span>
        <input className="dimensions-input" type="text" placeholder="Altura" value={height} onChange={(e) => handle('height', e.target.value)} aria-label="Altura (cm)" />
      </div>
      <input type="hidden" value={`${length}/${width}/${height}`} readOnly />
    </div>
  );
}
