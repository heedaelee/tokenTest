import { useRecoilState } from "recoil";
import { tokenState } from "./atom";

export const useToken = () => {
  const [token, setToken] = useRecoilState(tokenState);

  const getToken = () => token;
  const setNewToken = (newToken) => setToken(newToken);

  return { getToken, setNewToken };
};
