import express, { Request } from "express";
import { validate } from "../middleware/validate";
import { activateWalletSchema, sendCryptoSchema } from "../types/wallet.types";
import {
  activateWallet,
  getWallet,
  sendCryptocurrency,
} from "../services/wallet.service";
import { sendErrorResponse, sendSuccessResponse } from "../utils/apiResponse";

const router = express.Router();

router.post("/activate/:userId", validate(activateWalletSchema), async (req, res) => {
  try {
    if (!req.params.userId) {
      return sendErrorResponse(res, "User ID is required", 401);
    }
    const response = await activateWallet(req.params.userId);
    sendSuccessResponse(res, { response }, "Wallet activated successfully");
  } catch (error: any) {
    sendErrorResponse(res, error.message);
  }
});

router.get("/", async (req, res) => {
  try {
    if (!req.userId) {
      return sendErrorResponse(res, "User ID is required", 401);
    }

    const wallet = await getWallet(req.userId);
    sendSuccessResponse(res, { wallet }, "Wallet retrieved successfully");
  } catch (error: any) {
    sendErrorResponse(res, error.message);
  }
});

router.post("/send", validate(sendCryptoSchema), async (req, res) => {
  try {
    if (!req.userId) {
      return sendErrorResponse(res, "User ID is required", 401);
    }

    const transaction = await sendCryptocurrency(req.userId, req.body);
    sendSuccessResponse(
      res,
      { transaction },
      "Cryptocurrency sent successfully"
    );
  } catch (error: any) {
    sendErrorResponse(res, error.message);
  }
});

export default router;
