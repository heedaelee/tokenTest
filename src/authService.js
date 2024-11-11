// authService.js
import axios from "axios";
import { useSetRecoilState } from "recoil";
import { accessTokenState, isAuthenticatedState } from "./atom";

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // 쿠키 전송 설정
});

// 로그인 함수
export const useLogin = () => {
  const setAccessToken = useSetRecoilState(accessTokenState);
  const setIsAuthenticated = useSetRecoilState(isAuthenticatedState);

  return async (username, password) => {
    try {
      const response = await api.post("/login", { username, password });
      const accessToken = response.data.accessToken;

      // 액세스 토큰을 Recoil 상태에 저장
      setAccessToken(accessToken);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("로그인 실패:", error);
      setIsAuthenticated(false);
      return false;
    }
  };
};

// 로그아웃 함수
export const useLogout = () => {
  const setAccessToken = useSetRecoilState(accessTokenState);
  const setIsAuthenticated = useSetRecoilState(isAuthenticatedState);

  return () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    api.post("/logout"); // 서버에서 리프레시 토큰 삭제
  };
};

// 리프레시 토큰으로 새로운 액세스 토큰 발급 함수
const refreshAccessToken = async () => {
  const response = await api.post("/tokenCheck", {}, { skipAuthRefresh: true });
  const newAccessToken = response.data.accessToken;
  return newAccessToken;
};

// Axios 요청 인터셉터 설정 (401 에러 처리)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지 플래그

      try {
        const newAccessToken = await refreshAccessToken();
        console.log("토큰 갱신 성공:", newAccessToken);
        // Recoil 상태 업데이트
        const setAccessToken = useSetRecoilState(accessTokenState);
        const setIsAuthenticated = useSetRecoilState(isAuthenticatedState);
        setAccessToken(newAccessToken);
        setIsAuthenticated(true);

        // 갱신된 토큰으로 원래 요청을 다시 시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("토큰 갱신 실패:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
