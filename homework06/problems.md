## Practice Problem 1: Fan Controller

You are designing a controller for a cooling fan connected to a memory-mapped I/O port at address `0xEEF0`. The hardware supports both **read and write** operations.

The bit fields for the port are defined as follows:

| bit 7 (MSB) | bit 6 | bit 5 | bit 4 | bit 3 | bit 2 | bit 1 | bit 0 (LSB) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Fault** | **Mode** | **Speed (High Bit)** | **Speed** | **Speed** | **Speed (Low Bit)** | **Brake** | **Run** |

* **Bit 0: Run** (1 = Spin, 0 = Stop)

* **Bit 1: Brake** (1 = Active, 0 = Inactive)

* **Bits 2-5: Speed** (Value 0-15)

* **Bit 6: Mode** (1 = Turbo, 0 = Eco)

* **Bit 7: Fault** (Read-only: 1 = Error detected)

---

### Task
Write **C99 statements** (not full functions)  to perform the following actions using the pointer `fan_p` defined below:

> `uint8_t *fan_p = (volatile uint8_t * const)0xEEF0U;` 

**Do not alter other bits unless necessary**.

1.  Set the fan to **Run** without changing speed, mode, or brake status.

2.  Set the **Mode** to **Eco** (0).

3.  Set the **Speed** to level **10** (binary `1010`), keeping all other control bits (0, 1, and 6) as they are.

4.  Check if a **Fault** is currently detected. Return the result in:
    `bool is_faulty;` 

---

## Practice Problem 2: Pointer Arithmetic and Dereferencing

  After running the following code:

  ```c
  // Data in memory address 0x4000-0x4007 is at "time 0"
  uint16_t *p1 = ((volatile uint16_t *)0x4000U);
  uint8_t  *p2 = ((volatile uint8_t  *)0x4001U);
  *p1 = 0x1234U;
  *p2 = 0x56U;
  // write "Data @time 1" when code reaches this line

  p1 = p1 + 1;
   p2 = p2 + 1;
  *p1 = 0xABCDU;
  *p2 = 0x78U;
  // write "Data @time 2" when code reaches this line

  p1 = p1 + 2;
   p2 = p2 + 3;
  *p1 = 0x09EFU;
  *p2 = 0x33U;
  // write "Data @time 3" when code reaches this line
  ```

Write the content of memory address from `0x4000` to `0x4007`

| **Address** | Data @time 0 | Data @time 1 | Data @time 2 | Data @time 3 |
|:---:|:---:|:---:|:---:|:---:|
|`0x4000`|`0xAA`||||
|`0x4001`|`0x55`||||
|`0x4002`|`0xCC`||||
|`0x4003`|`0x33`||||
|`0x4004`|`0x11`||||
|`0x4005`|`0x88`||||
|`0x4006`|`0x99`||||
|`0x4007`|`0x66`||||

---

## Practice Problem 3: Phonetic Alphabet

**COMING SOON**.
