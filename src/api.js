// authService.js
import axios from "axios";

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // 쿠키 전송 설정
});

// 액세스 토큰 설정
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// 리프레시 토큰으로 새로운 액세스 토큰 발급 함수
// const refreshAccessToken = async () => {
//   const response = await api.post("/tokenCheck", {}, { skipAuthRefresh: true });
//   const newAccessToken = response.data.accessToken;
//   return newAccessToken;
// };

// 액세스 토큰 유효성 검사 및 갱신
// Axios 요청 인터셉터 설정 (401 에러 처리)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 에러 응답 상태가 401이고 요청이 이미 재시도된 것이 아닌지 확인
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.log("토큰 만료:", error.response);
      // /refresh-token 요청 자체를 다시 시도하지 않도록 방지
      if (originalRequest.url === "/refresh-token") {
        return Promise.reject(error);
      }

      originalRequest._retry = true; // 무한 루프 방지 플래그 설정

      try {
        const response = await api.post("/refresh-token");
        const { accessToken } = response.data;

        console.log("토큰 갱신 성공:", accessToken);
        localStorage.setItem("accessToken", accessToken);
        setAuthToken(accessToken);

        // 갱신된 토큰으로 원래 요청을 다시 시도
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token expired, please log in again.");
        localStorage.removeItem("accessToken");
      }
    }
    return Promise.reject(error);
  }
);

// 초기 토큰 설정
const token = localStorage.getItem("accessToken");
if (token) setAuthToken(token);

export default api;

// 로그인 함수
export const useLogin = () => {
  return async (username, password) => {
    try {
      const response = await api.post("/login", { username, password });
      const accessToken = response.data.accessToken;

      return true;
    } catch (error) {
      console.error("로그인 실패:", error);
      return false;
    }
  };
};

// 로그아웃 함수
export const useLogout = () => {
  return () => {
    api.post("/logout"); // 서버에서 리프레시 토큰 삭제
  };
};
