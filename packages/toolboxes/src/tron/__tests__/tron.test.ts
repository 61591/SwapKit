import { afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { AssetValue, Chain, SKConfig } from "@swapkit/helpers";
import { getTronToolbox } from "../toolbox";

const testAddress = "TLPum2cYam4ahPdryb1YrsuVDudufFsMxs";
const emptyRecipient = "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax";
const USDTAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

const context: {
  toolbox: Awaited<ReturnType<typeof getTronToolbox>>;
} = {} as any;

beforeEach(async () => {
  SKConfig.set({
    apiKeys: {
      swapKit: process.env.TEST_API_KEY || Bun.env.TEST_API_KEY,
    },
  });
  
  context.toolbox = await getTronToolbox();
});

describe("TRON toolkit", () => {
  test.skip("Get Balances", async () => {
    const balances = await context.toolbox.getBalance(testAddress);
    expect(balances.find((balance) => balance.symbol === "TRX")).toBeDefined();
  }, 10000);

  test.skip("Send TRX", async () => {
    await context.toolbox.transfer({
      recipient: emptyRecipient,
      assetValue: await AssetValue.from({ chain: Chain.Tron, value: "1" }),
      sender: testAddress,
    });
  }, 10000);

  test.skip("Send TRC20 Token", async () => {
    const assetValue = AssetValue.from({
      asset: "TRX.USDT-TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
      value: "1",
    });

    await context.toolbox.transfer({
      recipient: emptyRecipient,
      assetValue,
      sender: testAddress,
    });
  }, 10000);

  test.skip("Approve Token and validate approved amount", async () => {
    expect(
      await context.toolbox.isApproved({
        assetAddress: USDTAddress,
        spenderAddress: emptyRecipient,
        from: testAddress,
        amount: "1000000",
      }),
    ).toBe(false);

    await context.toolbox.approve({
      assetAddress: USDTAddress,
      spenderAddress: emptyRecipient,
      amount: "1000000",
    });

    expect(
      await context.toolbox.isApproved({
        assetAddress: USDTAddress,
        spenderAddress: emptyRecipient,
        from: testAddress,
        amount: "1000000",
      }),
    ).toBe(true);
  }, 10000);

  test("Validate TRON address", () => {
    expect(context.toolbox.validateAddress("TLPuM2cYam4ahPdryb1YrsuVDudufFsMxs")).toBe(true);
    expect(context.toolbox.validateAddress("invalid-address")).toBe(false);
    expect(context.toolbox.validateAddress("0x123")).toBe(false);
  });
});
