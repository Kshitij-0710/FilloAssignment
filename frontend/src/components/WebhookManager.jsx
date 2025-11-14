// frontend/src/components/WebhookManager.jsx
import React, { useState, useEffect } from 'react';
import api from '../api.jsx'; // Your import is correct

// --- For the user-friendly dropdown ---
const EVENT_CHOICES = [
  { key: 'product.created', label: 'When a Product is Created' },
  { key: 'product.updated', label: 'When a Product is Updated' },
  { key: 'product.deleted', label: 'When a Product is Deleted' },
];

function WebhookManager() {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the "Create New" form
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newEvent, setNewEvent] = useState(EVENT_CHOICES[0].key); // Default
  const [formError, setFormError] = useState(null);
  const [testStatus, setTestStatus] = useState({}); // To show test results

  // --- Data Functions ---
  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/webhooks/');
      setWebhooks(response.data.results);
    } catch (err) {
      setFormError('Failed to fetch webhooks.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  // --- Event Handlers ---
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(null);
    setTestStatus({});
    if (!newWebhookUrl) {
      setFormError('URL is required.');
      return;
    }

    try {
      await api.post('/webhooks/', {
        url: newWebhookUrl,
        event_type: newEvent,
        is_active: true
      });
      setNewWebhookUrl('');
      setNewEvent(EVENT_CHOICES[0].key);
      fetchWebhooks();
    } catch (err) {
      setFormError('Failed to create webhook. Is the URL valid?');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this webhook?')) {
      try {
        await api.delete(`/webhooks/${id}/`);
        fetchWebhooks();
      } catch (err) {
        setFormError('Failed to delete webhook.');
      }
    }
  };

  // --- Story 4: Edit (Enable/Disable) ---
  const handleToggleActive = async (hook) => {
    try {
      // Send the *opposite* of its current status
      await api.patch(`/webhooks/${hook.id}/`, {
        is_active: !hook.is_active
      });
      fetchWebhooks(); // Refresh to show new status
    } catch (err) {
      setFormError('Failed to update status.');
    }
  };

  // --- Story 4: Test ---
  const handleTest = async (id) => {
    setTestStatus({ [id]: { testing: true, message: 'Sending...' } });
    try {
      const response = await api.post(`/webhooks/${id}/test/`);
      setTestStatus({ [id]: { 
        success: true, 
        message: `✅ ${response.data.message}` 
      }});
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Test failed.';
      setTestStatus({ [id]: { 
        success: false, 
        message: `❌ ${errorMsg}` 
      }});
    }
  };

  // Helper to find the "friendly" label
  const getEventLabel = (key) => {
    return EVENT_CHOICES.find(c => c.key === key)?.label || key;
  };

  // --- Render ---
  return (
    <div>
      {/* --- Create New Webhook Form --- */}
      <form className="webhook-form" onSubmit={handleCreate}>
        <input
          type="url"
          placeholder="https://your-webhook-url.com"
          value={newWebhookUrl}
          onChange={(e) => setNewWebhookUrl(e.target.value)}
          required
        />
        <select value={newEvent} onChange={(e) => setNewEvent(e.target.value)}>
          {EVENT_CHOICES.map(choice => (
            <option key={choice.key} value={choice.key}>
              {choice.label}
            </option>
          ))}
        </select>
        <button type="submit">Add Webhook</button>
      </form>
      {formError && <p className="status-box error">{formError}</p>}

      {/* --- Webhook List --- */}
      <div className="webhook-list">
        {loading ? (
          <p>Loading webhooks...</p>
        ) : (
          webhooks.map((hook) => (
            <div key={hook.id} className="webhook-list-item">
              <div className="info">
                {/* --- THIS IS THE FIX --- */}
                <span className="url">{hook.url}</span>
                {/* --- END OF FIX --- */}
                <span className="event">{getEventLabel(hook.event_type)}</span>
                {testStatus[hook.id] && (
                  <p style={{ 
                      color: testStatus[hook.id].success ? 'green' : 'red', 
                      marginTop: '10px' 
                  }}>
                    {testStatus[hook.id].message}
                  </p>
                )}
              </div>
              
              {/* --- Story 4: Actions (Toggle, Test, Delete) --- */}
              <div className="actions">
                <label className="toggle-switch" title={hook.is_active ? 'Disable' : 'Enable'}>
                  <input 
                    type="checkbox" 
                    checked={hook.is_active} 
                    onChange={() => handleToggleActive(hook)}
                  />
                  <span className="slider"></span>
                </label>
                <button 
                  className="test-btn" 
                  onClick={() => handleTest(hook.id)}
                  disabled={!hook.is_active || testStatus[hook.id]?.testing}
                >
                  {testStatus[hook.id]?.testing ? 'Testing...' : 'Test'}
                </button>
                <button className="delete-btn" onClick={() => handleDelete(hook.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
        {webhooks.length === 0 && !loading && <p>No webhooks configured.</p>}
      </div>
    </div>
  );
}

export default WebhookManager;