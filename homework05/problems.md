## Problems

**Note:** Before starting, perform a **GitHub Fetch and Pull** to ensure you have the latest files.

---

### Problem 1: Catch the Golden Coins!

You have been blessed! Golden coins are falling from the sky. You go out and try to catch them.

#### 1. Objective:

Extend the **MVC** pattern learned in class to create a real-time interactive game. You will transition from a static tool (Dot Painter) to a dynamic system where the MODEL takes *time* as an input. So, in math (not C) notation, the MODEL update its internal state this way:

> `new_model_state = function(current_model_state, input, time)`

#### 2. Hardware Map (Recap)

- **VIEW:**

  - **8x16 LED Matrix:** `0xE020` (Left) to `0xE02F` (Right).
      - Data: 8 bits per column. LSB (Bit 0) is the bottom pixel; MSB (Bit 7) is the top pixel. This displays the "game world."
  
    - **Score Display:** `0xE800` to display score.

- **SIDE-CHANNEL VIEW:**

  *Side-Channel View* is a VIEW, but it is not a VIEW that's needed for the system to function. It mostly displays *debug* or other *information*. 

  - **Time Display:** `0xE808` to display *"time"*.

- **CONTROLLER:**

  - **4x4 Keypad (Controller):** `0xD010` (Read-to-Clear).
 
#### 3. Game Specifications:

You are to build a game called "Coin Catcher".

**The Rules:**

  1. **The Player:** represent the player as a **single pixel** on the **bottom row** (Row 0).

  - The player starts at a random column (more on random below).

  - The player can move **Left** or **Right** using the Keypad.

  - The player cannot move off the screen (clamp between Col 0 and Col 15).

  2. **The Coins:** represent a coin as a single pixel that spawns at the **top row** (Row 7).

  - The coin falls down automatically (Row 7 $\to$ 6 $\to$ ... $\to$ 0) at a fixed speed.

  - The coin falls in a fixed column until it hits the bottom.

  3. **The Goal:**

  - If the coin hits the bottom row (Row 0) and the **Player is in the same column**, the player "catches" it. Score +3.

  - If the coin hits the bottom row and the Player is **NOT** there, the coin is missed. Score -1.

  - Immediately spawn a new coin at the top (Row 7) at a new random column (see below) after the old one hits the bottom.

  4. **Display:**

  - The Matrix must show both the Player and the coin drop simultaneously.

  - The Score Display must show the current Score (in Decimal, 00-99).

  5. **Side Channel:**

  - Display `time` as well. (details about `time` below).

---

#### 4. Implementation Steps (MVC Guide):

**TIME:**

In `main`, we will have a `uint8_t time` variable:

- `time` ia a `uint8_t` data that starts out at `0`.
- `time` increments by 1 every time we reach the end of `while (true)` loop.
- When `time` reaches the maximum value, it *wraps around* back to 0. In C, `time` will *automatically wrap around* by doing:

    - `time = time + 1;`

- So, in `main`, we have this structure to support `time` (non-`time`-related code not shown):

  ```c
  void main(void){
      uint8_t time = 0;
      // code
      while (true) {
          // code
          time = time + 1;
      }
  }
  ```

**TICK:**

If we let the coin fall by one row every time in `while (true)`, the coin will fall down too quickly. We introduce the concept of `tick`. `tick` is a counter that starts from 0 and counts up by 1 inside every `model_update`. This is how `tick` is implemented:

- `tick` initializes to `0`.
- `tick` increments by `1` every time we do a `model_update`.
- once `tick` reaches `MAX_TICKS`, we move the `coin`, and set `tick` back to `0`.

So, the coin does not move at every `time` update, but it moves every "`MAX_TICKS` x `time`" update.

Your code may run slowly or quickly. For the reference code, I use:

> `#define MAX_TICK (20)`

**4-bit RANDOM:**

It will be very boring if every time the game is played, the coin drops in the same pattern. To achieve randomness, I have given you the following function:

  > `uint8_t random4(uint8_t time);`

You can use the return value of `random4` to be the column of the new gold drop. 

**MODEL-CONTROLLER API:**

The controller passes the information to the model in this `enum`

  ```c
  typedef enum {
      NONE, LEFT, RIGHT
  } command;
  ```

**Part A: The Model (`model_t`)**

Create a `struct` called `model_t` to hold the game state.

- *Think:* What data do you need to track? Wjat must be in the "savegame file".
- *Suggestion:*

  ```c
  typedef struct {
      uint8_t player_col; // Player is always Row 0
      uint8_t coin_row;
      uint8_t coin_col;
      uint8_t score;
      uint8_t tick;  // coin speed control
      // Think whether you need 'matrix[16]' in the model
      // if you calculate positions during View Update
  } model_t;
  ```
- Model related function prototypes that you must implement:

  - `void model_init(model_t *mp, uint8_t time);`
  - `void model_update(model_t *mp, uint8_t time, command c);`

**Part B: The Controller:**

- The controller to handle only Left and Right inputs.
- **Reminder:** `tick` is in the model. Controller should not use `tick` to make any decision at all.

The game must continue running even if the user *doesn't* press a key (so the coin can fall). Your controller logic inside the main loop must be non-blocking.Part C: The Model Update (model_update)This is the hardest part. You now have two types of updates:Input Driven: If the controller detected a keypress, update player_col.Time Driven: The rain must move down automatically.Implementation: Add a simple counter in your main loop. Every $X$ loop iterations, call a special function (e.g., model_tick(mp)) that moves rain_row down by 1.Collision Logic: Inside model_tick, check if rain_row has reached 0. Compare rain_col with player_col to determine if the score increases.Part D: The View (update_view)Construct the visual frame based on the model.Clear the matrix (set all columns to 0).Set the bit for the Player at (Row 0, player_col).Set the bit for the Rain at (current rain_row, current rain_col).Write the model->score to the Hex Displays. (Remember to convert the integer score to BCD or look-up table patterns if your hardware requires raw segment data, or just write the value if the hardware does the decoding). Note: Based on lecture slide 37, the Hex display takes raw Hex values (0x00-0xFF), so you might need to convert score 10 to 0x10 if you want it to look like "10" on the display.
