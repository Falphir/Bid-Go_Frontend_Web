import React from 'react';
import { mapStatusToClass, prettyStatus } from '../../utils/status';

export default function StatusBadge({ status, prefix, className = '' }) {
  const cls = mapStatusToClass(status);
  const label = prettyStatus(status);
  return (
    <span className={['status-badge', cls, className].filter(Boolean).join(' ')}>
      {prefix ? prefix + ' ' : ''}{label}
    </span>
  );
}
