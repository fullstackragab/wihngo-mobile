export type SupportTransaction = {
  transactionId: string;
  supporterId: string;
  birdId?: string;
  amount: number;
  paymentProvider: string;
  paymentId: string;
  status: string;
  createdAt: string;
};

export type SupportTransactionCreateDto = {
  supporterId: string;
  birdId?: string;
  amount: number;
  paymentProvider: string;
  paymentId: string;
  status: string;
};

export enum SupportAmount {
  Small = 5,
  Medium = 10,
  Large = 25,
  Generous = 50,
  VeryGenerous = 100,
}
