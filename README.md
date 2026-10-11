# Quantum Casino

> The world's first casino where the house edge is quantum mechanics.

## Summary
- Idea: while absobing preliminary lessons before hackaton, we got an idea of implementing Grover's algorhitm in a fun way - that it have a very "gambler-friendly" property in first ever existing quantum casino - idea by us - which functionality is defined more detailed in following steps.
- Solution: we use Grover's algorhitm to bring the gambling into the enviroment. Firstly, user does not bet on exact number, he bets on number of iterations, in which he thinks algorhitm can get the correct number. That way he can be more and more sure in hitting correct number, but by buying more iterations, his prize will be lower so he will have to place bigger bet. And secondly, Grover's can be overcooked, so when he will hit that point, his chances of winning will instantly drop to zero without him noticing, which is second gamble thing in our casino. To understand it deeper, please, see the "Logic & quantum computing" part.
- Result: casino earns money from people, who can not tell stop to themselves, because by increasing iterations they can be more sure, but also lose everything.


## Technologies
| Part | Technology | Purpose |
|---|---|---|
| Quantum logic | Python, Qiskit | Reference implementation of Grover's algorithm |
| Circuit design | [Quirk](https://algassert.com/quirk) | Visual circuit used to verify and demonstrate the algorithm |
| Math model | GeoGebra | Probability curve and pricing model |
| Game engine | JavaScript | Game logic, bets, payouts, Grover emulation |
| Frontend | HTML, CSS, JavaScript | User interface |


## Logic & quantum computing

### 1. Grover's algorithm in one minute
 
Grover's algorithm searches for `M` marked items among `N = 2ⁿ` possibilities (`n` = number of qubits).
A classical computer needs about `N/2` guesses on average. Grover's algorithm needs only about `√N` steps.
 
1. **Superposition:** a Hadamard gate on every qubit puts all possible answers into an equal superposition.
2. **Repeat `k` times:**
   - **Oracle:** flips the sign of the correct answer(s), which "marks" them.
   - **Diffuser:** reflects all amplitudes around their average, which increases the amplitude of the marked answer.
3. **Measurement:** we measure **once** (1 shot). The result is random, weighted by probability. This single measurement is the "roll of the dice".
**Live circuit (Quirk):** [open in Quirk](https://algassert.com/quirk#circuit=%7B%22cols%22:[[%22~j44k%22,1,1,%22H%22,%22H%22],[%22X%22,1,1,%22X%22,%22X%22],[1,1,1,1,%22H%22],[%22%E2%80%A2%22,%22%E2%80%A2%22,%22%E2%80%A2%22,%22%E2%80%A2%22,%22X%22],[1,1,1,1,%22H%22],[%22X%22,1,1,%22X%22,%22X%22],[%22~j44k%22,1,1,%22H%22,%22H%22],[%22X%22,%22X%22,%22X%22,%22X%22,%22X%22],[1,1,1,1,%22H%22],[%22%E2%80%A2%22,%22%E2%80%A2%22,%22%E2%80%A2%22,%22%E2%80%A2%22,%22X%22],[1,1,1,1,%22H%22],[%22X%22,%22X%22,%22X%22,%22X%22,%22X%22],[%22~j44k%22,1,1,%22H%22,%22H%22],[%22~7odu%22],[%22~7odu%22],[%22~7odu%22],[%22~7odu%22],[%22~7odu%22],[%22~7odu%22],[%22Chance5%22],[%22Amps5%22]],%22gates%22:[%7B%22id%22:%22~j44k%22,%22name%22:%22h%22,%22circuit%22:%7B%22cols%22:[[%22H%22,%22H%22,%22H%22]]%7D%7D,%7B%22id%22:%22~7odu%22,%22circuit%22:%7B%22cols%22:[[%22X%22,1,1,%22X%22,%22X%22],[1,1,1,1,%22H%22],[%22%E2%80%A2%22,%22%E2%80%A2%22,%22%E2%80%A2%22,%22%E2%80%A2%22,%22X%22],[1,1,1,1,%22H%22],[%22X%22,1,1,%22X%22,%22X%22],[%22~j44k%22,1,1,%22H%22,%22H%22],[%22X%22,%22X%22,%22X%22,%22X%22,%22X%22],[1,1,1,1,%22H%22],[%22%E2%80%A2%22,%22%E2%80%A2%22,%22%E2%80%A2%22,%22%E2%80%A2%22,%22X%22],[1,1,1,1,%22H%22],[%22X%22,%22X%22,%22X%22,%22X%22,%22X%22],[%22~j44k%22,1,1,%22H%22,%22H%22]]%7D%7D]%7D)
 
> Note: the link above is shortened to the gates needed for the demo. If it does not load, use the full Quirk link stored in `docs/` or the screenshot below.
 
![Quirk circuit](docs/quirk_circuit.png)
 
*The example circuit uses 5 qubits and 7 iterations. That is deliberately past the optimum (4 iterations), so it shows an "overcooked" Grover run.*

### 2. Probability of winning
 
```
θ    = arcsin( √(M / N) )
P(k) = sin²( (2k + 1) · θ )
```
 
- `k` = number of iterations, `N = 2ⁿ` = number of possible answers, `M` = number of correct answers (in the game `M = 1`).
- Optimal number of iterations: `k_opt ≈ (π/4) · √(N / M)`.
- After the optimum, the probability falls again and reaches almost zero at about `k ≈ (π/2) · √(N / M)`.

**Examples:**
 
- **2 qubits** (N = 4): optimal k = 1, win chance 100 %. Overcooked: k = 2 gives 25 %.
- **3 qubits** (N = 8): optimal k = 2, win chance ~94.5 %. Overcooked: k = 3 gives ~33 %.
- **4 qubits** (N = 16): optimal k = 3, win chance ~96 %. Overcooked: k = 6 gives ~2 %.
- **5 qubits** (N = 32): optimal k = 4, win chance ~99.9 %. Overcooked: k = 7 gives ~21 %.


 
![GeoGebra probability graph](docs/geogebra_probability.png)
 
*The GeoGebra model has sliders for the number of qubits `q` and the number of correct answers `M`. The curve rises, peaks, and falls again.*
 
### 3. Repetitions
 
Instead of one long run, a player can run the algorithm `r` times. The chance of at least one win is:
 
```
P_total = 1 − (1 − P(k))^r
```
 
### 4. Pricing model
 
The player picks a target win chance `p`. The model finds the cheapest combination of iterations `k` and repetitions `r`:
 
```
r    = log(1 − p) / log(1 − P(k))
cost = k + r
```
 
Example (`N = 256`, `M = 1`, target `p = 61 %`): the cheapest mix is about **4.4 iterations** with about **2.3 repetitions** (theoretical minimum cost ≈ 6.7). With whole repetitions this becomes 3 repetitions. A single run then has a win chance of about 34 %.
 
The payout is meant to follow the odds. A fair payout is roughly `(1 − P) / P × bet`, and the casino keeps a margin on top.
 
### 5. Implementation
 
The reference implementation is written in Python with Qiskit (`grover.py`). It builds the circuit from the oracle and the diffuser, runs it with `shots=1`, and returns the measured value:
 
```python
def grover(answers, num_of_qubits, num_of_iterations):
    circuit = QuantumCircuit(num_of_qubits, num_of_qubits)
 
    for q in range(num_of_qubits):          # equal superposition
        circuit.h(q)
 
    for _ in range(num_of_iterations):
        # Oracle: marks every correct answer (multi-controlled Z)
        # Diffuser: reflection around the average amplitude
        ...
 
    circuit.measure(range(num_of_qubits), range(num_of_qubits))
    job = backend.run(circuit.decompose(), shots=1)
    return list(job.result().get_counts().keys())[0]
```
 
The web game runs the same probability model in JavaScript (`grover_emulation.js`), so the page responds instantly without a quantum backend. The emulation uses the formula `P(k) = sin²((2k + 1) · θ)` from section 2, which is exactly what the Qiskit circuit produces.

## Game rules
 
1. Every round the game picks a random hidden number. The number of qubits (and so the size of the search space) is random between 5 and 10, and the player does not see it.
2. The player chooses a **token bet** (minimum 500 tokens) and the **number of iterations** (1 to 26).
3. Press **Spin**. The reels run while the algorithm is "computing", then show the number that Grover's algorithm found.
4. If it matches the hidden number, the player **wins**. Otherwise the player **loses** the bet.
**What the player should know:**
- More iterations means a higher chance of winning, but a lower payout.
- There is a sweet spot. Beyond it, buying more iterations makes the chance of winning *smaller*, and the game does not warn the player.


## User Interface

