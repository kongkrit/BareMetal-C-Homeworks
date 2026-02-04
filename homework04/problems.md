## Problems

**Note:** Before starting, perform a **GitHub Fetch and Pull** to ensure you have the latest files.

---

### Problem 1: Decimal Display

**File:** `BareMetal-C/code/homeworks/homework04_1/hw4_1.c`  
**Simulation:** `BareMetal-C/sim/hw4.sim1`

Compile the code and load it into the simulator. Inspect the behavior of the 7-segment display at address `0xE800`.

**Current Behavior:**
The display renders the **hexadecimal** representation of the byte written to it.

In the code, you can see that writing:
- `0x93` to `0xE800` makes the display show `93`.
- `0x45` to `0xE800` makes the display show `45`.
- `0x26` to `0xE800` makes the display show `26`.

However, if you write the *decimal* values `93`, `45`, and `26` to `0xE800`, the display shows `5d`, `2d`, and `1A` respectively.

**Explanation:**
- `93` (decimal) = `0x5D` (hex) → Display shows `5d`.
- `45` (decimal) = `0x2D` (hex) → Display shows `2d`.
- `26` (decimal) = `0x1A` (hex) → Display shows `1A`.

**Goal:**
We want the display to visually match the **decimal** value stored in our variable.

**Task:**
Modify the `view_update` function in `hw4_1.c`. You must convert the incoming decimal value into a format that results in the correct visual output on the hex display. This format is called *BCD* (Binary Coded Decimal).

* **Constraint:** If the value is greater than 99, display `EE`.
* **Submission:** Submit the corrected `hw4_1.c`.

---

### Problem 2: Blinking Light with Controllable Delay

**Prerequisite:** This problem requires the decimal display logic from Problem 1.

**File:** `BareMetal-C/code/homeworks/homework04_2/hw4_2.c`

**Goal:**
Create a blinking light at `0xE000` where the blinking speed is controlled by the user.

**Specifications:**
1.  **Controls:**
    * `-` button (`0xD006`): Decrease period (faster blink).
    * `+` button (`0xD007`): Increase period (slower blink).
2.  **Period Logic:**
    * Start value: `35`.
    * Step size: `5`.
    * Minimum: `5` (If `5`, clicking `-` does nothing).
    * Maximum: `95` (If `95`, clicking `+` does nothing).
    * **Note:** Lower period number = Faster blinking.
3.  **Timing:**
    * **Do not** use `baremetal-delay`. This blocks execution and freezes the UI.
    * Instead, use the `count` parameter in the `MODEL` struct to track iterations.

#### 1. Play with the Simulation

Restart simulide. Load `hw4.sim1`. The ROM is pre-loaded with a working implementation. Test the buttons to understand the expected behavior.

#### 2. The MODEL
The state is defined in the `model_t` struct:

```c
typedef struct {
    bool light;     // Current light status: true (ON) or false (OFF)
    uint8_t period; // Target threshold for the blink speed
    uint8_t count;  // Counter: increments until it reaches 'period', then resets
} model_t;
```

We use an `enum` to abstract key presses:

```c
typedef enum {
    NONE, PLUS, MINUS
} command;
```

- `NONE`: No new key press.
- `PLUS`: `+` was pressed.
- `MINUS`: `-` was pressed.

**Note:** `model_t` and `command` are purely software constructs. They do not interact directly with I/O.

#### 3. The VIEW
Modify `view_update` to:

1. Render the blinking light at `0xE000`.
2. Display the current `period` value in decimal at `0xE800`.

#### 4. The CONTROLLER

The keypad addresses are:

- `-`: `0xD006`
- `+`: `0xD007`

**Important:** These addresses are *read-to-clear*.

- They return `true` only once per press.
- Once read, subsequent reads return `false` until the button is released and pressed again.

**Task:** Implement the logic for:

1. `model_init`: Initialize the struct.
2. `model_update`: Handle counting, toggling light, and processing commands.
3. `view_update`: Output state to hardware.
4. `controller_read`: Read hardware addresses and return the correct `command` enum.

**Constraints:**

- Do **NOT** modify function prototypes or `main`.
- **Submission:** Submit the finished `hw4_2.c`.

---

### Bonus Problem: Movable Light

**Requirement:** Complete Problem 2 first.

**Goal:** We have 4 lights mapped to `0xE000`, `0xE001`, `0xE002`, and `0xE003`. Currently, we only use `0xE000`. Update the program to allow the user to move the active blinking light left and right using the keypad.

**Controls:**

- `<`: Move light left.

- `>`: Move light right.

**Wrap-Around Behavior:**

- If the light is at the far left (`0xE000`) and `<` is pressed, it must jump to the far right (`0xE003`).
- If the light is at the far right (`0xE003`) and `>` is pressed, it must jump to the far left (`0xE000`).

**Task:**

1. Modify **MODEL** to track which light is active.
2. Modify **VIEW** to render the correct light.
3. Modify **CONTROLLER** to handle `<` and `>` inputs.

**Submission:** Submit the finished `hw4_2_bonus.c`.
