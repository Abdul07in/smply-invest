import type { TradePlan } from "@/shared/types/trading";

export const getPlanMetrics = (plan: Pick<TradePlan, "side" | "entry" | "triggerPrice" | "stop" | "target" | "quantity">) => {
  const riskPerUnit = Math.abs(plan.entry - plan.stop);
  const rewardPerUnit = Math.abs(plan.target - plan.entry);
  const risk = riskPerUnit * plan.quantity;
  const reward = rewardPerUnit * plan.quantity;
  const valid = plan.entry > 0 && plan.triggerPrice > 0 && plan.stop > 0 && plan.target > 0 && plan.quantity > 0 &&
    (plan.side === "Long" ? plan.stop < plan.entry && plan.target > plan.entry : plan.stop > plan.entry && plan.target < plan.entry);
  return { risk, reward, ratio: risk ? reward / risk : 0, valid };
};
