import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

export const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const c of cookies) {
    const [k, ...rest] = c.split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

// 요청 인터셉터
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Django CSRF는 보통 unsafe method에서 X-CSRFToken 헤더를 요구합니다.
    const method = String(config.method ?? 'get').toLowerCase();
    const isSafeMethod = method === 'get' || method === 'head' || method === 'options';

    if (!isSafeMethod) {
      const csrfToken = getCookie('csrftoken');
      if (csrfToken) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>)['X-CSRFToken'] = csrfToken;
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// 응답 인터셉터
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      window.location.href = '/error';
    }

    const status = error.response?.status;
    const config = error.config as (InternalAxiosRequestConfig & {
      __csrfRetried?: boolean;
    }) | null;

    const isCsrfEndpoint =
      config?.url === '/api/v3/django/auth/csrf-token/' ||
      config?.url === '/api/v3/django/auth/csrf-token';

    // CSRF 토큰 재발급 후 1회 재시도
    if (status === 403 && config && !config.__csrfRetried && !isCsrfEndpoint) {
      config.__csrfRetried = true;
      return instance
        .get('/api/v3/django/auth/csrf-token/')
        .then(() => instance.request(config));
    }

    // 테이블 세션 만료 → 로그인 화면으로 리디렉션
    if (status === 410) {
      const boothId = localStorage.getItem('boothId');
      window.location.href = boothId ? `/?id=${boothId}` : '/';
    }

    return Promise.reject(error);
  },
);
