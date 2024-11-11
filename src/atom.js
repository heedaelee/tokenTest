import { atom } from "recoil";

export const accessTokenState = atom({
  key: "accessTokenState",
  default: null,
});

export const isAuthenticatedState = atom({
  key: "isAuthenticatedState",
  default: false,
});
