// Copyright 2023 Quantoz Technology B.V. and contributors. Licensed
// under the Apache License, Version 2.0. See the NOTICE file at the root
// of this distribution or at http://www.apache.org/licenses/LICENSE-2.0

import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { authStorageService } from "../auth/authStorageService";
import * as SecureStore from "expo-secure-store";
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { fromByteArray, toByteArray } from "react-native-quick-base64";
import { Buffer } from "buffer";
import { isNil } from "lodash";
import { AuthService } from "../auth/authService";
import { SECURE_STORE_KEYS } from "../auth/types";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export const backendApiUrl = Constants.expoConfig?.extra?.API_URL;
export const mockApiUrl = Constants.expoConfig?.extra?.POSTMAN_MOCK_API_URL;
export const mockPaymentsApi = axios.create({
  baseURL: mockApiUrl,
  headers: {
    // Postman mock headers
    "x-api-key": Constants.expoConfig?.extra?.POSTMAN_MOCK_API_KEY,
    "x-api-version": "1.0",
  },
});

export const paymentsApi = axios.create({
  baseURL: backendApiUrl,
  headers: {
    "x-api-version": "1.0",
  },
});

paymentsApi.interceptors.request.use(requestInterceptor);
paymentsApi.interceptors.response.use(
  responseInterceptor,
  responseInterceptorError
);

mockPaymentsApi.interceptors.request.use(requestInterceptor);
mockPaymentsApi.interceptors.response.use(
  responseInterceptor,
  responseInterceptorError
);

async function requestInterceptor(config: InternalAxiosRequestConfig) {
  const oid = await SecureStore.getItemAsync(SECURE_STORE_KEYS.OID);
  const storage = authStorageService();
  let accessToken = await storage.getAccessToken();

  if (isNil(accessToken)) {
    accessToken = await getNewAccessToken();
  }

  const pubKeyFromStore = await SecureStore.getItemAsync(
    oid + SECURE_STORE_KEYS.PUBLIC_KEY
  );
  const privKeyFromStore = await SecureStore.getItemAsync(
    oid + SECURE_STORE_KEYS.PRIVATE_KEY
  );
  if (
    !isNil(pubKeyFromStore) &&
    !isNil(privKeyFromStore) &&
    !isNil(accessToken)
  ) {
    if (config.headers) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const sigData = getSignatureHeaders(
      new Date(),
      config?.data,
      privKeyFromStore
    );
    config.headers["x-public-key"] = pubKeyFromStore;
    config.headers["x-timestamp"] = sigData.timestamp;
    config.headers["x-signature"] = sigData.signature;
    config.headers["x-algorithm"] = "ED25519";
  }
  return config;
}

// the date is supplied as a parameter to allow for testing
// there were various issues with trying to mock it directly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSignatureHeaders(
  date: Date,
  data: unknown,
  privKeyFromStore: string
) {
  const timestampInSeconds = Math.floor(date.getTime() / 1000).toString(); // Convert current time to Unix timestamp in seconds
  const dataToSign = data
    ? timestampInSeconds + JSON.stringify(data)
    : timestampInSeconds;
  const bytesToSign = Buffer.from(dataToSign, "utf-8");

  const privKey = toByteArray(privKeyFromStore);
  const privKeyHex = ed.etc.bytesToHex(privKey);

  const hash = ed.sign(bytesToSign, privKeyHex);

  // Encode the signature in Base64 format
  const base64Signature = fromByteArray(hash);

  return {
    timestamp: timestampInSeconds,
    signature: base64Signature,
  };
}

const getNewAccessToken = async () => {
  const result = await AuthService().renew();
  if (result.type === "error") {
    await AuthService().logout();
    return null;
  } else if (result.type === "success" && "token" in result) {
    return result.token;
  } else {
    return null;
  }
};

async function responseInterceptor(response: AxiosResponse) {
  return response;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function responseInterceptorError(error: any) {
  const originalRequest = error.config;
  //console.warn("responseInterceptorError", error.response?.data?.Errors[0])
  if (
    error.response &&
    error.response.status === 401 &&
    error.response?.data?.Errors[0]?.Code === "Unauthorized"
  ) {
    // Check if the request has already been retried
    if (!originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = 0;
    }

    // Check if the retry count is less than 2
    if (originalRequest._retryCount < 2) {
      originalRequest._retryCount++;

      try {
        const newToken = await getNewAccessToken();
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return paymentsApi(originalRequest);
      } catch (e) {
        return Promise.reject({ ...error, originalError: error });
      }
    }
  }

  if (
    error.response &&
    error.response.status === 400 &&
    error.response?.data?.Errors[0]?.Code === "StellarHorizonFailure"
  ) {
    await AuthService().logout();
    return Promise.reject({ ...error, originalError: error });
  }

  return Promise.reject({ ...error, originalError: error });
}
