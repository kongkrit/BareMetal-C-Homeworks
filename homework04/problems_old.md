## Problems:

- Before doing the problems, make sure to do GitHub Fetch and Pull.

### Problem 1: Decimal Display

Take a look at `BareMetal-C/code/homeworks/homework04_1/hw4_1.c`

Compile the code and load it onto `BareMetal-C/sim/hw4.sim1`.

Now inspect the code:

It writes to the 7-segment display at address `0xE800`. The value that will be shown on the display is the *hexadecimal* value that is written to that address.

In the code, you can see that writing:
> - `0x93` to `0xE800` makes the display show `93`
> - `0x45` to `0xE800` makes the display show `45`
> - `0x26` to `0xE800` makes the display show `26`

And then, writing the *decimal* values `93`, `45`, `26` to `0xE800` makes the display show `5d`, `2d`, `1A` respectively.

This is not surprising, as `93` in decimal is `5D` in hexadecimal, `45` in decimal is `2D` in hexadecimal, and `26` in decimal is `1A` in hexadecimal.

We can see that the display shows the *hexadecimal* value of the value that is written to it.

We do not want this. We want the display to show the *decimal* value of the value that is written to it.

So, we need to write a function that converts a decimal value to a hexadecimal value and then writes it to the display.

Modify function `view_update` in `hw4_1.c` to display the decimal value of the value that is written to it.

If the value is greater than 99, display `EE`.

Right now, the code is obviously incorrect.

Submit the finished `hw4_1.c` file.

---

### Problem 2: Blinking light with controllable delay

**WARNING:** This problem requires what you have learned in the previous problem.

Take a look at `BareMetal-C/code/homeworks/homework04_2/hw4_2.c`

We want a blinking light at `0xE000`. We want the rate of blinking to be controllable by the user.

We control the *period* of blinking by clicking `-` (address `0xD006`) and `+` (address `0xD007`) buttons. **Lower number means faster blinking.**

At start, we want this period to be `35`. Clicking `-` decreases the period by 5, and clicking `+` increases the period by 5.

The minimum value for the period is `5`, and the maximum value is `95`. Clicking `-` when the period is `5` does nothing, and clicking `+` when the period is `95` does nothing.

Do not use `baremetal-delay` function for this problem. Use the `count` parameter in the MODEL.

> If we used `baremetal-delay`, the UI will not be responsive, because there is not enough opportunity for the UI to update.

#### PLAY WITH IT FIRST:

Load up `hw4.sim1` and play with it for a while. Get a feel of how the program works. Its ROM already contains the correct implementation.

#### MODEL

Take a look at the `.c` file, we already define the states of the model for you:

```c
// MODEL
typedef struct {
    bool light;
    uint8_t period;
    uint8_t count;
} model_t;
```

> Explanation:
> - `light` is the current status of the light (`true` (ON) or `false` (OFF))
> - `period` is the period value
> - `count` is the counter that counts up until it reaches `period` and then reset itself back to `0`.

We also define `enum` for the keypress:

```c
typedef enum {
    NONE, PLUS, MINUS
} command;
```

`NONE` means no key was pressed since the key was last checked, `PLUS` means `+` was pressed, and `MINUS` means `-` was pressed since you last read the keypad address.

> Remember: this `enum` does *NOT* have anything to do with the I/O. It is just a variable that you can use to store the state of the model.

The `model_t` struct is also not related to the I/O. It is just a variable that you can use to store the state of the model.

You are to implement the `model_init` and `model_update` functions.

#### VIEW

Show the blinking light at `0xE000`.

Show the current value of `period` in *decimal*at `0xE800`.

Do the above in the `view_update` function.

#### CONTROLLER

The keypad addresses are `0xD006` and `0xD007` for `-` and `+` respectively.

Remember that these addresses are *read-to-clear*. It returns `true` if the button is pressed, and `false` otherwise. Once you read it, subsequent reads will return `false` until the button is pressed again.

Fix the `controller_read` function to return the correct `command` enum value based on the keypad inputs.

#### WHAT YOU NEED TO FIX:

- `model_init`
- `model_update`
- `view_update`
- `controller_read`

Do *NOT* modify the function prototypes or the `main` function.

Submit the finished `hw4_2.c` file.

---

### Bonus Problem: Make the light movable.

**WARNING:** Do this only after you finish problem 2.

We have 4 lights, mapped to `0xE000`, `0xE001`, `0xE002`, and `0xE003`. So far, we only use one light at `0xE000`.

Did you notice `<` and `>` buttons on the keypad? Use them to move the light left and right.

I also want a *wrap-around* effect: When the light reaches the end of the display, it should wrap around to the other end. Meaning, when the light is at its leftmost position, hitting `<` makes it move to the rightmost position. Same *wrap-around* behavior applies for the `>` button.

Submit the finished `hw4_2_bonus.c` file.

#### HINTS

- You definitely need to modify the MODEL's state.
- You need to modify the VIEW to show the correct light.
- You need to modify the CONTROLLER to handle the `<` and `>` buttons.

---
