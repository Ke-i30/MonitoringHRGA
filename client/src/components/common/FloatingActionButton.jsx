import React from 'react';
import { Plus } from 'lucide-react';

export const FloatingActionButton = ({ onClick, title = 'Buat Permintaan Baru' }) => {
  return (
    <button onClick={onClick} className="fab-button" title={title}>
      <Plus size={28} />
    </button>
  );
};
