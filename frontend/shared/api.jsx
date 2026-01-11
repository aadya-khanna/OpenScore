// Shared API Helper Functions
// Used by both Customer and Lender dashboards

// #region agent log
fetch('http://127.0.0.1:7243/ingest/8dfa98f0-80c4-47da-830b-a723723dba69',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.jsx:1',message:'shared/api.jsx script loading',data:{timestamp:new Date().toISOString()},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B'})}).catch(()=>{});
// #endregion

const apiCall = async (endpoint, method = 'GET', token, body = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (e) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      throw new Error(error.error?.message || error.message || 'API request failed');
    }

    return await response.json();
  } catch (err) {
    if (err.message.includes('fetch') || err.name === 'TypeError') {
      throw new Error('Failed to fetch: Unable to connect to backend server');
    }
    throw err;
  }
};
