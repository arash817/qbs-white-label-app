import { backendApiUrl } from "../utils/axios";

type AppDefaultConfig = {
  defaultFiatCurrency: string;
  defaultStableCoin: string;
  supportEmail: string;
  feeSettings: {
    minimumFee: number;
  };
  fundBankingInfo: {
    beneficiary: string;
    iban: string;
    bic: string;
  };
  sharePaymentUrl: string;
  minSendAmount: number;
  maxPaymentMessageLength: number;
};

export const defaultConfig: AppDefaultConfig = {
  defaultFiatCurrency: "EUR",
  defaultStableCoin: "SCEUR",
  supportEmail: "support@quantozpayments.com",
  feeSettings: {
    minimumFee: 2,
  },
  fundBankingInfo: {
    beneficiary: "Quantoz Payments B.V.",
    iban: "NL123456789",
    bic: "NLABN12434",
  },
  sharePaymentUrl: `${backendApiUrl}/deeplinks/paymentrequests/`,
  minSendAmount: 0.01,
  maxPaymentMessageLength: 28,
};

export const appNavigationState = {
  screens: {
    AppStack: {
      screens: {
        PortfolioOverview: {
          screens: {
            SendStack: {
              screens: {
                SendSummary: {
                  path: "paymentrequests/:code",
                },
              },
            },
          },
        },
      },
    },
  },
};
