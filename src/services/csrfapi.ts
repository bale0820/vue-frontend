import axios from 'axios';

const csrfapi = axios.create({
  baseURL: '/',
  withCredentials: true,
  // withXSRFToken: true,
  // 명시적으로 지정
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    Accept: 'application/json',
  },
});

export default csrfapi;