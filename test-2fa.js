const axios = require('axios');
(async () => {
  const api = axios.create({ baseURL: 'http://localhost:18789', withCredentials: true });
  try {
    const loginRes = await api.post('/api/auth/login', { password: '61V@ss@r@venue' });
    const cookie = loginRes.headers['set-cookie'][0];
    const res = await api.get('/api/security/2fa/setup', { headers: { Cookie: cookie } });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.error("ERROR:", err.response ? err.response.data : err.message);
  }
})();
