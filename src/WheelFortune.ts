import type { SpinState, WheelFortuneOptions } from './types';

export class WheelFortune {
  private rootElement: HTMLElement | null = null;
  private wheelElement: HTMLElement | null = null;
  private triggerElement: HTMLElement | null = null;

  private swayAnimation: Animation | null = null;
  private swayingElement: HTMLElement | null = null;
  private finalRotation: WeakMap<HTMLElement, number> = new WeakMap();

  private readonly rotationCount: number;
  private readonly duration: number;
  private readonly overshootDeg: number;
  private readonly returnDuration: number;
  private readonly swayAmplitude: number;
  private readonly swayPeriod: number;
  private readonly rootClassName: string;
  private readonly spinStates: SpinState[];

  private currentSpinIndex = 0;
  private hasSpun = false;
  private warmedUp = false;

  private readonly onClick = (): void => {
    void this.runSpin();
  };

  constructor(private readonly options: Readonly<WheelFortuneOptions>) {
    this.rotationCount = options.rotationCount ?? 6;
    this.duration = options.duration ?? 5000;
    this.overshootDeg = options.overshootDeg ?? 15;
    this.returnDuration = options.returnDuration ?? 1350;
    this.swayAmplitude = options.swayOptions?.amplitude ?? 6;
    this.swayPeriod = options.swayOptions?.period ?? 1500;
    this.spinStates = [...(options.spinStates ?? [])];

    const selector = options.rootSelector.trim();

    this.rootClassName = selector.startsWith('.') ? selector.slice(1) : selector;
  }

  public init(): void {
    const root = document.querySelector<HTMLElement>(this.options.rootSelector);
    const wheel = root?.querySelector<HTMLElement>(this.options.wheelSelector);
    const trigger = root?.querySelector<HTMLElement>(this.options.triggerSelector);

    if (!root || !wheel || !trigger) return;

    if (this.triggerElement) {
      this.triggerElement.removeEventListener('click', this.onClick);
    }

    this.rootElement = root;
    this.wheelElement = wheel;
    this.triggerElement = trigger;

    this.warmUp();
    this.triggerElement.addEventListener('click', this.onClick);
    this.startSway(this.wheelElement);
  }

  public destroy(): void {
    this.stopSway();

    if (this.wheelElement) {
      this.cancelAnimations(this.wheelElement);
    }

    if (this.triggerElement) {
      this.triggerElement.removeEventListener('click', this.onClick);
    }

    this.finalRotation = new WeakMap();
  }

  public reset(): void {
    if (!this.rootElement || !this.wheelElement || !this.triggerElement) {
      this.init();
      return;
    }

    this.destroy();

    this.wheelElement.style.transform = '';
    this.rootElement.classList.remove(
      `${this.rootClassName}--spinning`,
      `${this.rootClassName}--completed`,
      `${this.rootClassName}--first-done`,
      `${this.rootClassName}--final-done`,
    );

    this.currentSpinIndex = 0;
    this.hasSpun = false;
    this.warmedUp = false;

    this.warmUp();
    this.triggerElement.addEventListener('click', this.onClick);
    this.startSway(this.wheelElement);
  }

  private warmUp(): void {
    if (this.warmedUp || !this.wheelElement) return;

    const warm = this.wheelElement.animate(
      [{ filter: 'blur(0)' }, { filter: 'blur(0.4px)', offset: 0.5 }, { filter: 'blur(0)' }],
      { duration: 64, fill: 'forwards' },
    );

    this.wheelElement.getBoundingClientRect();

    warm.onfinish = (): void => {
      warm.commitStyles?.();
      warm.cancel();
    };

    this.decodeImages(this.wheelElement);

    this.warmedUp = true;
  }

  private decodeImages(root: HTMLElement): void {
    root.querySelectorAll('img').forEach((img) => {
      img.decode?.().catch(() => {});
    });
  }

  private async runSpin(): Promise<void> {
    if (!this.rootElement || !this.wheelElement) return;

    const spinState = this.spinStates[this.currentSpinIndex];

    if (!spinState) return;

    this.hasSpun = true;

    this.rootElement.classList.remove(`${this.rootClassName}--completed`);
    this.rootElement.classList.add(`${this.rootClassName}--spinning`);

    this.stopSway();

    await this.rotateWheelTo(this.wheelElement, spinState.targetAngle);

    this.rootElement.classList.remove(`${this.rootClassName}--spinning`);
    this.rootElement.classList.add(`${this.rootClassName}--completed`);

    if (this.currentSpinIndex === 0) {
      this.rootElement.classList.add(`${this.rootClassName}--first-done`);
    }

    if (this.currentSpinIndex === this.spinStates.length - 1) {
      this.rootElement.classList.add(`${this.rootClassName}--final-done`);
    }

    spinState.callback?.();

    this.currentSpinIndex++;
  }

  private async rotateWheelTo(el: HTMLElement, finalDeg: number): Promise<void> {
    const currentDeg = this.getCurrentRotation(el);
    const diffCW = (this.normalize(finalDeg) - this.normalize(currentDeg) + 360) % 360;
    const targetDeg = currentDeg + this.rotationCount * 360 + diffCW;
    const overshoot = targetDeg + this.overshootDeg;
    const total = this.duration + this.returnDuration;
    const overshootAt = this.duration / total;

    const spin = el.animate(
      [
        { transform: `rotate(${currentDeg}deg)`, easing: 'cubic-bezier(0.86,0,0.07,1)' },
        {
          offset: overshootAt,
          transform: `rotate(${overshoot}deg)`,
          easing: 'cubic-bezier(0.77,0,0.175,1)',
        },
        { transform: `rotate(${targetDeg}deg)` },
      ],
      { duration: total, fill: 'forwards' },
    );

    const blur = el.animate(
      [
        { filter: 'blur(0)' },
        { offset: 0.1, filter: 'blur(0.4px)' },
        { offset: 0.25, filter: 'blur(1px)' },
        { offset: 0.6, filter: 'blur(1px)' },
        { offset: 0.9, filter: 'blur(0.4px)' },
        { offset: 1, filter: 'blur(0)' },
      ],
      { duration: total, fill: 'forwards', easing: 'ease-in-out' },
    );

    await Promise.all([spin.finished, blur.finished]);

    this.finalRotation.set(el, this.normalize(targetDeg));
  }

  private startSway(el: HTMLElement): void {
    if (this.hasSpun) return;

    this.stopSway();
    this.swayingElement = el;

    const baseRaw = this.finalRotation.get(el) ?? this.getCurrentRotation(el);
    const base = this.normalize(baseRaw);

    this.swayAnimation = el.animate(
      [
        { transform: `rotate(${base - this.swayAmplitude}deg)` },
        { transform: `rotate(${base + this.swayAmplitude}deg)` },
      ],
      {
        duration: this.swayPeriod,
        direction: 'alternate',
        iterations: Number.POSITIVE_INFINITY,
        easing: 'ease-in-out',
        delay: -this.swayPeriod / 2,
      },
    );
  }

  private stopSway(): void {
    if (!this.swayAnimation || !this.swayingElement) return;

    const el = this.swayingElement;
    const snapshot = getComputedStyle(el).transform;

    this.swayAnimation.commitStyles?.();
    this.swayAnimation.cancel();

    el.style.transform = snapshot !== 'none' ? snapshot : '';

    this.swayAnimation = null;
    this.swayingElement = null;
  }

  private normalize(deg: number): number {
    return ((deg % 360) + 360) % 360;
  }

  private getCurrentRotation(el: HTMLElement): number {
    const transform = getComputedStyle(el).transform;
    if (!transform || transform === 'none') return 0;

    const { a, b } = new DOMMatrixReadOnly(transform);
    return (Math.atan2(b, a) * 180) / Math.PI;
  }

  private cancelAnimations(el: HTMLElement): void {
    el.getAnimations().forEach((animation) => {
      animation.cancel();
    });
  }
}
