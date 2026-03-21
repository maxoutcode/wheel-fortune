<div align="center">
<br>

<h1>wheel-fortune</h1>

<p><sup>A lightweight, customizable spinning wheel component for web games and raffles</sup></p>

[![npm](https://img.shields.io/npm/v/wheel-fortune.svg?colorB=brightgreen)](https://www.npmjs.com/package/wheel-fortune)
[![GitHub package version](https://img.shields.io/github/package-json/v/ux-ui-pro/wheel-fortune.svg)](https://github.com/ux-ui-pro/wheel-fortune)
[![NPM Downloads](https://img.shields.io/npm/dm/wheel-fortune.svg?style=flat)](https://www.npmjs.org/package/wheel-fortune)

<sup>2kB gzipped</sup>

<a href="https://codepen.io/ux-ui/pen/NWJZNaP">Demo</a>

</div>
<br>

&#10148; **Install**
```bash
$ yarn add wheel-fortune
```
<br>

&#10148; **Import**
```javascript
import WheelFortune from 'wheel-fortune';
```
<br>

&#10148; **Usage**
```javascript
const wheelFortune = new WheelFortune({
  rootSelector: '.wheel-container',
  wheelSelector: '.wheel',
  triggerSelector: '.spin-button',
  spinStates: [
    {
      targetAngle: 90,
      callback: () => console.log('Landed on 90°!'),
    },
    {
      targetAngle: 225,
      callback: () => console.log('Landed on 225°!'),
    },
  ],
});

wheelFortune.init();
```
<br>

&#10148; **Options**

| Option            |     Type      | Default | Description                                                                               |
|:------------------|:-------------:|:-------:|:------------------------------------------------------------------------------------------|
| `rootSelector`    |   `string`    |   `–`   | Selector for the root container element.                                                  |
| `wheelSelector`   |   `string`    |   `–`   | Selector for the rotating wheel element.                                                  |
| `triggerSelector` |   `string`    |   `–`   | Selector for the spin trigger element (`button`, `div`, etc.).                            |
| `rotationCount`   |   `number`    |   `6`   | Number of full rotations before landing on the final target angle.                         |
| `duration`        |   `number`    | `5000`  | Main spin duration in milliseconds.                                                         |
| `overshootDeg`    |   `number`    |  `15`   | Overshoot angle in degrees before settling on the target.                                  |
| `returnDuration`  |   `number`    | `1350`  | Duration of the settle-back phase after overshoot.                                         |
| `swayOptions`     | `SwayOptions` |   `–`   | Optional idle sway config: `{ amplitude?: number; period?: number }`.                      |
| `spinStates`      | `SpinState[]` |   `[]`  | Array of spin results in sequence. Each includes `targetAngle` and optional `callback`.    |
<br>

&#10148; **API**

| Method      | Description                                |
|:------------|:-------------------------------------------|
| `init()`    | Initializes the wheel and event listeners. |
| `destroy()` | Cleans up animations and event listeners.  |
| `reset()`   | Resets the wheel to initial state.         |
<br>

&#10148; **CSS States**

The root element receives CSS class modifiers during runtime:

- `.{rootClassName}--spinning` — while the wheel is spinning.
- `.{rootClassName}--completed` — after spin is complete.
- `.{rootClassName}--first-done` — after the first spin.
- `.{rootClassName}--final-done` — after the final defined spin state.

You can use these classes to style the component based on its state.
<br><br>

&#10148; **License**

MIT
