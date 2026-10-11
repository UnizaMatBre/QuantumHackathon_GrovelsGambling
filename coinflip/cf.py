from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
import math
import time

EDGE = 0.97
MAX_MULT = 100.0
START_ZOSTATOK = 100.0


def nacitaj_stranu():
    while True:
        s = input("Choose side (0 or 1, q = quit): ").strip().lower()
        if s in ("0", "1"):
            return int(s)
        if s == "q":
            return None
        print("Enter 0, 1 or q.")


def nacitaj_stavku(zostatok):
    while True:
        s = input(f"Bet (max {zostatok:.2f}, Enter = 1): ").strip().replace(",", ".")
        if s == "":
            return min(1.0, zostatok)
        try:
            v = float(s)
        except ValueError:
            print("Enter a number.")
            continue
        if 0 < v <= zostatok:
            return v
        print("Invalid bet.")


def zmeraj_cas():
    input("Enter = START measurement...")
    start = time.perf_counter()
    input("Enter = STOP!")
    return time.perf_counter() - start


def kvantove_kolo(backend, uhol):
    qc = QuantumCircuit(1, 1)
    qc.ry(uhol, 0)
    qc.measure(0, 0)
    counts = backend.run(transpile(qc, backend), shots=1).result().get_counts()
    return int(next(iter(counts)))


def zahraj_kolo(backend, cas, strana):
    """Play one round with the Qiskit simulator (reference implementation)."""
    t = cas % 2.0
    uhol = t * math.pi
    p0 = math.cos(uhol / 2) ** 2
    p_moja = p0 if strana == 0 else 1 - p0
    mult = max(1.0, min(round(EDGE / max(p_moja, 1e-9), 2), MAX_MULT))
    padlo = kvantove_kolo(backend, uhol)
    return {"padlo": padlo, "vyhral": padlo == strana, "mult": mult,
            "p_moja": p_moja, "t": t}


def main():
    backend = AerSimulator()
    zostatok = START_ZOSTATOK
    print(f"Welcome! Balance: {zostatok:.2f}")
    print("Time is taken modulo 2 s: 0 s and 2 s -> |0>, 1 s -> |1>.\n")

    try:
        while zostatok > 0.01:
            strana = nacitaj_stranu()
            if strana is None:
                break
            stavka = nacitaj_stavku(zostatok)

            cas = zmeraj_cas()
            v = zahraj_kolo(backend, cas, strana)

            print(f"\nTime: {cas:.3f} s (modulo 2: {v['t']:.3f} s)")
            print(f"Chance for your side ({strana}): {v['p_moja'] * 100:.1f}%")
            print(f"Multiplier: {v['mult']}x")
            print(f"Quantum measurement: {v['padlo']}")

            if v["vyhral"]:
                zisk = stavka * (v["mult"] - 1)
                zostatok += zisk
                print(f"You won! +{zisk:.2f}")
            else:
                zostatok -= stavka
                print(f"You lost -{stavka:.2f}")
            print(f"Balance: {zostatok:.2f}\n")
    except (KeyboardInterrupt, EOFError):
        print()

    print(f"Game over. Final balance: {zostatok:.2f}")


if __name__ == "__main__":
    main()