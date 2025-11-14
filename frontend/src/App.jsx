import React, { useState } from 'react';
import Uploader from './components/Uploader.jsx';
import ProductList from './components/ProductList.jsx'; // Import the new list
import WebhookManager from './components/WebhookManager.jsx'; // Import webhooks
import './index.css';

function App() {
  // This state connects the Uploader to the ProductList
  const [refreshKey, setRefreshKey] = useState(0);

  // This function will be called by the Uploader on success
  const handleUploadComplete = () => {
    // Bumping the key forces ProductList to re-run its useEffect
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div>
      <h1>Product Importer</h1>
      
      {/* --- Section 1: Uploader (Story 1, 1A) --- */}
      <section>
        <h2>Upload CSV</h2>
        <Uploader onUploadComplete={handleUploadComplete} />
      </section>

      {/* --- Section 2: Product List (Story 2, 3) --- */}
      <section>
        <h2>Products</h2>
        <ProductList refreshKey={refreshKey} />
      </section>

      {/* --- Section 3: Webhook Manager (Story 4) --- */}
      <section>
        <h2>Webhooks</h2>
        <WebhookManager />
      </section>
      
    </div>
  );
}

export default App;