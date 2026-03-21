export type SpinState = {
  targetAngle: number;
  callback?: () => void;
};

export type SwayOptions = {
  amplitude?: number;
  period?: number;
};

export type WheelFortuneOptions = {
  rootSelector: string;
  wheelSelector: string;
  triggerSelector: string;
  rotationCount?: number;
  duration?: number;
  overshootDeg?: number;
  returnDuration?: number;
  swayOptions?: SwayOptions;
  spinStates?: SpinState[];
};
