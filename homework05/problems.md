# Problem 1: Catch the Golden Coins!

**Note:** Before starting, perform a **GitHub Fetch and Pull** to ensure you have the latest files.

## 1. Objective

Extend the **MVC** pattern learned in class to create a real-time interactive game. You will transition from a static tool (Dot Painter) to a dynamic system where the MODEL evolves over **time**.

In mathematical notation, the MODEL updates its internal state as:

  > `NewState = f(CurrentState, Input)`

Crucially, **time** is now considered an intrinsic part of the **state**. We represent this using a variable called `tick` (as in the tick-tock of a clock) stored *inside* the Model `struct`. This allows the Model to track the passage of time and trigger automatic updates (like gravity) even when there is no user Input.

## 2. Hardware Map

* **VIEW (Game World):**
    * **8x16 LED Matrix:** `0xE020` (Left) to `0xE02F` (Right).
        * *Data:* 8 bits per column. LSB (Bit 0) is the bottom pixel; MSB (Bit 7) is the top pixel.
    * **Score Display:** `0xE800` (Hex Display).

* **SIDE-CHANNEL VIEW (Debug/Info):**
    * **`random` Display:** `0xE808` (Hex Display).

* **CONTROLLER:**
    * **4x4 Keypad:** `0xD010` (Read-to-Clear).

## 3. Game Specifications

You are to build a game called **"Coin Catcher"**.

### The Rules

1.  **The Player:**
    * Represented as a **single pixel** on the **bottom row** (Row 0).
    * Starts at a random column.
    * Can move **Left** or **Right** using the Keypad.
    * Movement is clamped to the screen edges (Column 0 to 15).

2.  **The Coins:**
    * Represented as a **single pixel** spawning at the **top row** (Row 7).
    * Falls down automatically (Row 7 → 6 → ... → 0) at a fixed speed determined by `MAX_TICK`.
    * Falls in a straight vertical line (fixed column).

3.  **The Goal:**
    * **Catch:** If the coin is on the bottom row (Row 0) and the Player is in the **same column**, the score increases by **+3**.
    * **Miss:** If the coin "falls through" the bottom row (waits on Row 0 until the next movement tick) and the Player is **NOT** there, the score decreases by **-1**.
    * **Spawn:** Immediately after a Catch or a Miss, a new coin spawns at Row 7 in a new random column.

4.  **Display:**
    * The Matrix must show both the Player and the Coin simultaneously.
    * The Score Display must show the current score in Decimal (00-99).
    * *Constraint:* Score cannot go below 0 or above 99.

5.  **Side Channel:**
    * Display the running `random` counter on the second Hex display.

---

## 4. Implementation Steps (MVC Guide)

### Concept: Tick

The game loop runs very fast. If the coin moved every loop iteration, it would be unplayable. We use `tick` to manage this:

-  **Tick (`tick`):** A counter *inside* the **Model**. It increments every time `model_update` is called.
    * When `tick` reaches `MAX_TICK`, the coin moves.
    * `tick` then resets to 0.

### Concept: Randomness

-  **Random (`random`):** A randomizer that changes every single loop iteration. Its change depends on the input.

   - Since it is nearly impossible for humans to have the same input sequence at every single loop count, we achieve *pseudo-randomness* this way.

### Part A: The Model (`model_t`)

Create a `struct` to hold the game state.

```c
typedef struct {
    uint8_t player_col; // Player is always Row 0
    uint8_t coin_row;
    uint8_t coin_col;
    uint8_t score;      // Range 0-99
    uint8_t tick;       // Speed control (Time State)
    // Think whether you need 'matrix[16]' in the model
    // if you calculate positions during View Update
} model_t;
```

**Required Prototypes:**
* `void model_init(model_t *mp, uint8_t random);`
* `void model_update(model_t *mp, uint8_t random, command c);`

### Part B: The Controller

The controller reads the keypad and converts specific keys into abstract commands.

**Enum definition:**
```c
typedef enum {
    NONE, LEFT, RIGHT
} command;
```

**Required Prototype:**
* `command controller_read(void);`

### Part C: Model Update Logic

The prototype is: `void model_update(model_t *mp, uint8_t random, command c);`

This function handles two parts:
1.  **Input:** If `c` is `LEFT` or `RIGHT`, update `player_col`.
2.  **Time State:** Increment `tick`. If `tick` reaches `MAX_TICK`, update `coin_row` and resets `tick` to 0.

**Logic Table:**
Use this table to determine the outcome during an update.
*Legend: `0` = False, `1` = True, `X` = Don't Care.*

| Coin on Row 0? | Player touches Coin? | Tick Maxed Out? | **Outcome / Action** |
| :---: | :---: | :---: | :--- |
| `1` | `1` | `X` | **CATCH!** Score +3. Spawn new coin. Reset tick. |
| `1` | `0` | `0` | **IDLE.** Coin is sitting on bottom row. Player still has time to move to it. |
| `1` | `0` | `1` | **MISS!** Score -1. Spawn new coin. Reset tick. |
| `0` | `X` | `0` | **IDLE.** Coin is mid-air. Wait for tick. |
| `0` | `X` | `1` | **GRAVITY.** Coin moves down one row. Reset tick. |

### Part D: The View

Construct the visual frame based on the model state.

**Required Prototype:**
* `void view_update(const model_t *mp);`

**Steps:**
1.  Clear the matrix buffer (all 0).
2.  Set the bit for the **Player** at `(0, player_col)`.
3.  Set the bit for the **Coin** at `(coin_row, coin_col)`.
    * *Note:* Since the Player and Coin are independent, ensure that if they overlap, the pixel remains lit.
4.  Write `score` to the Hex Display `0xE800`.

---

## 5. Hints & Skeleton Code

**Randomness:**

To prevent the game from being predictable, use the provided helper function. Pass the current `random` from `main` into it.

```c
// Returns a random number between 0 and 15
uint8_t random4(uint8_t random);
```

**Speed Control:**

For the reference simulation, a tick value of 20 provides a good difficulty balance.

```c
#define MAX_TICK (20)
```

- **20** is just a starting suggestion. **You should adjust this number so the coins fall too quickly or too slowly.**

- C code has no relationship to real-world time. If your code runs slowly, you may need to *decrease* `MAX_TICK` if the coins fall *too slowly*.

- *Increase* `MAX_TICK` if the coins fall *too quickly*.

**Main Loop Structure:**

Your `main` function manages the integration of components and the raw `random` twister.

```c
void main(void){
    model_t m;
    model_t *mp = &m;
    command c;

     // random counter
    uint8_t random = 0;

    // init will always be the same
    model_init(mp, random);
    
    while (true){
        c = controller_read();
    
        // Update Model (Input + random)
        model_update(mp, random, c);

        // Render View
        view_update(mp);

        // Side Channel: view random
        *RANDOM_DISP = random;

        // move random based on 1 + input
        random = random + 1 + (uint8_t ) c;
    }
}
```

## 6. Deliverables

* **Test:** Verify your code works correctly in the simulator (`BareMetal-C/sim/hw5.sim1`).
* **Submit:** The completed `homework05.c` file. Start with `BareMetal-C/code/homeworks/homework05/homework05_skeleton.c`.

---

## 7. Enhancements

Is this homework too easy for you? Fear not! Here are the possible improvements. Add them and we will give you **bonus** points.

### Bonus 1: Add RESTART.

- Note that the prototype of `model_init` is:

  > `void model_init(model_t *mp, uint8_t random);`

**Feature to add:**

- If the user clicks `R` on the keypad (row 0, column 3), restart the game.

- Every time the game is restarted, `coin_col` and `player_col` should randomly vary.

**HINT:** `enum command` will change to:

```c
typedef enum {
    NONE, LEFT, RIGHT, RESET
} command;
```

### Bonus 2: Optimize VIEW

- Re-drawing the entire matrix display can be time-consuming.

- Change `view_update` to draw **only when necessary**.

- With this optimization, you may need to increase `MAX_TICK` significantly. (This is a good thing; it means the code runs efficiently.)

- **Reference:** after optimization. I set `MAX_TICK` is set to **60** to make the coin fall from top to bottom in about 3 seconds.
