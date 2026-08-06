import axios from 'axios';

const devServerIP = '192.168.137.1';
const isNativeApp = window.location.hostname === 'localhost' && window.location.port === '';
const host = isNativeApp ? devServerIP : window.location.hostname;

const API = axios.create({
  baseURL: `http://${host}:8000/api/`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for session authentication cookies
});

// CSRF Cookie setup for Django compatibility
API.interceptors.request.use((config) => {
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const csrftoken = getCookie('csrftoken');
  if (csrftoken) {
    config.headers['X-CSRFToken'] = csrftoken;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
