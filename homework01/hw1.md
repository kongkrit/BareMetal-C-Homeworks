# BareMetal-C Homework Assignment #1
**Due Date:** 19 January 2026, before 11:59 (morning)

## Logic Notation
Recall that, in class, when we talked about logic:
* **0** = FALSE
* **1** = TRUE
* **AND**: signified by dot (`·`) or nothing.
* **OR**: signified by `+`.
* **Inversion**: signified by postfix `'` or `_`, or prefix `~` / `!`.

### Operator Precedence (Highest to Lowest)
1.  `( )`
2.  Inversion (prefix `~` `/` `!`, or postfix `'` `_`)
3.  AND
4.  OR

**Example:**
`a + bc'` = `a + ( b ( c' ) )` (invert first, AND next, OR last)

---

## Part 1: Boolean Proofs
Suppose `a`, `b`, `c`, and `d` are binary variables (0 or 1). Prove the following:

1.  `a · 0 = 0`
2.  `a + 1 = 1`
3.  `a · 1 = a`
4.  `a + 0 = a`
5.  `a · a = a`
6.  `a + a = a`
7.  `a · a' = 0`
8.  `a + a' = 1`
9.  `(a')' = a`
10. `a ^ 0 = a`
11. `a ^ 1 = a'`
12. `a · (b + c) = ab + ac` (Distribution)
13. `a + (bc) = (a+b)(a+c)` (Distribution of `+` into `·`)

### How to prove them?
Remember: each variable can either be 0 or 1. We can iterate the left hand side (LHS) and the right hand side (RHS) of the equation through all possible combinations. If LHS is equal to RHS on every possible combination, the theorem must be true.

**Example Proof:** `a + ab = a`

| a | b | LHS (`a + ab`) | RHS (`a`) |
| :---: | :---: | :--- | :---: |
| 0 | 0 | `0 + 0 · 0` = `0 + 0` = **0** | **0** |
| 0 | 1 | `0 + 0 · 1` = `0 + 0` = **0** | **0** |
| 1 | 0 | `1 + 1 · 0` = `1 + 0` = **1** | **1** |
| 1 | 1 | `1 + 1 · 1` = `1 + 1` = **1** | **1** |

You can see that LHS = RHS for *every possible combination* of a, b, therefore `a + ab = a`.

---

## Part 2: XOR Operations
XOR (`^`) is an interesting operation.

**2.1** Prove that `(a ^ b) ^ c = a ^ (b ^ c)`.
*If this is true, we can remove parentheses and write `a ^ b ^ c`.*

**2.2** Solve: `1 ^ 0 ^ 0 ^ 1 ^ ... ^ 1`
*That expression contains 400 zeros and 175 ones.*

**2.3** From 2.2, instead of 400 and 175, what would the answer be with **M** zeros and **N** ones?
