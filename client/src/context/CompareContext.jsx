import React, { createContext, useContext, useState } from 'react';
import { useToast } from './ToastContext';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [comparedProducts, setComparedProducts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();

  const addToCompare = (product) => {
    if (comparedProducts.some(p => p.id === product.id)) {
      setComparedProducts(prev => prev.filter(p => p.id !== product.id));
      showToast(`Removed ${product.name} from comparison`, 'info');
      return;
    }

    if (comparedProducts.length >= 4) {
      showToast('You can compare up to 4 products at once', 'warning');
      return;
    }

    setComparedProducts(prev => [...prev, product]);
    showToast(`Added ${product.name} to comparison`, 'success');
  };

  const removeFromCompare = (productId) => {
    setComparedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setComparedProducts([]);
  };

  const isCompared = (productId) => {
    return comparedProducts.some(p => p.id === productId);
  };

  return (
    <CompareContext.Provider
      value={{
        comparedProducts,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isCompared,
        isOpen,
        setIsOpen
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
