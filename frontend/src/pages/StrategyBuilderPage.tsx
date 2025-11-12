import React, { useState } from 'react';
import Palette from '../components/Palette';
import Canvas from '../components/Canvas';

// Define the type for a token
export interface Token {
  id: string;
  type: 'indicator' | 'operator' | 'value';
  label: string;
}

const StrategyBuilderPage: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);

  const handleItemClick = (item: { type: Token['type']; label: string }) => {
    const newToken: Token = {
      ...item,
      id: `${item.label}-${Date.now()}`, // Simple unique ID
    };
    setTokens((prevTokens) => [...prevTokens, newToken]);
  };

  const handleRemoveToken = (tokenId: string) => {
    setTokens((prevTokens) => prevTokens.filter((token) => token.id !== tokenId));
  };

  const handleTokenOrderChange = (newTokens: Token[]) => {
    setTokens(newTokens);
  };

  return (
    <div>
      <h1>Strategy Builder</h1>
      <p>Create and configure your trading strategies using the tools below.</p>
      <Palette onItemClick={handleItemClick} />
      <h2 style={{ marginTop: '20px' }}>Canvas</h2>
      <Canvas
        tokens={tokens}
        onRemoveToken={handleRemoveToken}
        onTokenOrderChange={handleTokenOrderChange}
      />
    </div>
  );
};

export default StrategyBuilderPage;
