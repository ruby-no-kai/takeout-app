import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Api, LightningTimer, Track } from "./Api";

export type LightningTimerData = {
  tick: dayjs.Dayjs;
  remaining: number;
  m: string;
  s: string;
};

export function useLightningTimerFromTrack(track: Track, tickCorrection?: boolean) {
  return useLightningTimer(track?.card?.lightning_timer, tickCorrection);
}

export function useLightningTimer(timer?: LightningTimer, tickCorrection?: boolean) {
  const correction = tickCorrection ?? true;
  const { data: latency } = Api.useStreamLatencyMark();

  const [tick, setTick] = useState(dayjs());
  useEffect(() => {
    if (timer) {
      const updateTick = () => {
        const t = dayjs();
        if (timer.expires_at + 10 >= t.unix()) {
          setTick(t);
        }
      };
      updateTick();
      const id = setInterval(updateTick, 500);
      return () => clearInterval(id);
    } else {
      return () => null;
    }
  }, [timer]);

  if (!timer) return undefined;

  const correctedTick = correction ? tick.add((latency?.delta ?? 0) * -1, "ms") : tick;

  if (timer.expires_at <= correctedTick.unix()) return undefined;

  const remaining = Math.max(0, timer.ends_at - correctedTick.unix());
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;

  return {
    tick: correctedTick,
    remaining,
    m: `${m < 10 ? "0" : ""}${m}`,
    s: `${s < 10 ? "0" : ""}${s}`,
  };
}
