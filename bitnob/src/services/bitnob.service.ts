import axios from "axios";
import env from "../config/env";
import logger from "../utils/logger";

const bitnobApi = axios.create({
  baseURL: env.BITNOB_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.BITNOB_API_KEY}`,
  },
});

export const createCustomer = async (data: {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}) => {
  try {
    const response = await bitnobApi.post("/customers", data);
    console.log(response);
    return response.data;
  } catch (error: any) {
    logger.error(
      "Error creating Bitnob customer:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to create customer"
    );
  }
};

export const generateWallet = async (customerId: string) => {
  try {
    const response = await bitnobApi.post("/wallets", { customerId });
    console.log(response);
    return response.data;
  } catch (error: any) {
    logger.error(
      "Error generating Bitnob wallet:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to generate wallet"
    );
  }
};

export const getWalletBalance = async (customerId: string) => {
  try {
    const response = await bitnobApi.get(`/wallets/balance/${customerId}`);
    console.log(response);
    return response.data;
  } catch (error: any) {
    logger.error(
      "Error getting Bitnob wallet balance:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to get wallet balance"
    );
  }
};

export const sendCrypto = async (data: {
  customerId: string;
  amount: number;
  address: string;
  currency: string;
  description?: string;
}) => {
  try {
    const response = await bitnobApi.post("/transactions/send", data);
    console.log(response);
    return response.data;
  } catch (error) {}
};

export const getTransactions = async (transactionId: string) => {
  try {
    const response = await bitnobApi.get(`/transactions/${transactionId}`);
    console.log(response);
    return response.data;
  } catch (error: any) {
    logger.error(
      "Error getting transaction:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to get transaction"
    );
  }
};
