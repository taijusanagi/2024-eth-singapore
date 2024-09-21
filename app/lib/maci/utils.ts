import { BigNumberish } from "ethers";

export const asHex = (val: BigNumberish): string =>
  `0x${BigInt(val).toString(16)}`;

export const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export function sortActions(actions: any[]): any[] {
  return actions.slice().sort((a, b) => {
    if (a.blockNumber > b.blockNumber) {
      return 1;
    }

    if (a.blockNumber < b.blockNumber) {
      return -1;
    }

    if (a.transactionIndex > b.transactionIndex) {
      return 1;
    }

    if (a.transactionIndex < b.transactionIndex) {
      return -1;
    }

    return 0;
  });
}
