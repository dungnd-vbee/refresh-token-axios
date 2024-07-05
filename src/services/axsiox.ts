import Axios, { AxiosRequestConfig } from "axios";
import setAxiosHeader from "../utilities/setAxiosHeader";

const axiosInstance = Axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, 
});

axiosInstance.interceptors.request.use(
  async (config) => setAxiosHeader(config),
  (error) => {
    Promise.reject(error);
  }
);

interface RetryQueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
  config: AxiosRequestConfig;
}

const refreshAndRetryQueue: RetryQueueItem[] = [];
let isRefreshing = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfig = error.config;
    if (error.response && error.response.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
            await axiosInstance.get('/api/auth/refreshtoken', {
                withCredentials: true, 
              })
              .then(async (response) => {
                axiosInstance.defaults.headers.common['Authorization'] =
                'Bearer ' + response.data.accessToken; // Set lại access token mới vào axios

                // Gán access token mới vào originalRequest
                if (originalRequest.headers) {
                  originalRequest.headers['Authorization'] = 'Bearer ' + response.data.accessToken;
                }
                return axiosInstance(originalRequest);
              })
              .catch((errorRefresh) => {
                return Promise.reject(errorRefresh);
              });
            // Repeat all miss request by 401
            refreshAndRetryQueue.forEach(({ config, resolve, reject }) => {
              axiosInstance(config)
                .then((response) => resolve(response))
                .catch((err) => reject(err));
            });
            refreshAndRetryQueue.length = 0;
      
        } catch (refreshError) {
          refreshAndRetryQueue.length = 0;
        } finally {
          isRefreshing = false;
        }
      }
      return new Promise<void>((resolve, reject) => {
        refreshAndRetryQueue.push({ config: originalRequest, resolve, reject });
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
