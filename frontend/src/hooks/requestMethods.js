import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = `http://${window.location.hostname}:2345/api/`;
const TOKEN_KEY = 'auth_token';

export const setAuthToken = (token) => token && Cookies.set(TOKEN_KEY, token, { expires: 7 });
export const getAuthToken = () => Cookies.get(TOKEN_KEY);
export const removeAuthToken = () => Cookies.remove(TOKEN_KEY);

export const setUserInfo = (user) => {
  if (!user) return;
  localStorage.setItem('user', JSON.stringify({
    id: user.id || user._id,
    email: user.email,
    fullName: user.fullName,
    gender: user.gender,
    birthDate: user.birthDate,
    height: user.height,
    weight: user.weight,
    isAdmin: user.isAdmin ?? false,
  }));
};

export const getUserInfo = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const removeUserInfo = () => localStorage.removeItem('user');

export const publicRequest = () => {
  const instance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      ...(getAuthToken() && {
        Authorization: getAuthToken().startsWith('Bearer ') 
          ? getAuthToken() 
          : `Bearer ${getAuthToken()}`
      })
    }
  });

  instance.interceptors.request.use(config => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(
    res => {
      const token = res.headers['x-auth-token'] || res.headers['X-Auth-Token'] || res.data?.token || res.data?.accessToken;
      if (token) {
        setAuthToken(token);
        res.data.token ??= token;
      }
      return res;
    },
    err => {
      if (err.response?.status === 401) removeAuthToken();
      return Promise.reject(err);
    }
  );

  return instance;
};
