from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
import math
import time

EDGE = 0.97  
MAX_MULT = 100.0
START_ZOSTATOK = 100.0


def nacitaj_stranu():
    while True:
        s = input("Zvoľ stranu (0 alebo 1, q = koniec): ").strip().lower()
        if s in ("0", "1"):
            return int(s)
        if s == "q":
            return None
        print("Zadaj 0, 1 alebo q.")


def nacitaj_stavku(zostatok):
    while True:
        s = input(f"Stávka (1 - {zostatok:.2f}, Enter = 1): ").strip().replace(",", ".")
        if s == "":
            return 1.0
        try:
            v = float(s)
        except ValueError:
            print("Zadaj číslo.")
            continue
        if 0 < v <= zostatok:
            return v
        print("Neplatná stávka.")


def zmeraj_cas():
    input("Enter = ŠTART merania...")
    start = time.perf_counter()
    input("Enter = STOP!")
    return time.perf_counter() - start


def kvantove_kolo(backend, uhol):
    qc = QuantumCircuit(1, 1)
    qc.ry(uhol, 0)
    qc.measure(0, 0)
    counts = backend.run(transpile(qc, backend), shots=1).result().get_counts()
    return int(next(iter(counts)))


def main():
    backend = AerSimulator()
    zostatok = START_ZOSTATOK
    print(f"Vitaj! Zostatok: {zostatok:.2f}")
    print("Čas sa berie modulo 2 s: 0 s a 2 s -> |0>, 1 s -> |1>.\n")

    try:
        while zostatok > 0.01:
            strana = nacitaj_stranu()
            if strana is None:
                break
            stavka = nacitaj_stavku(zostatok)

            cas = zmeraj_cas()
            t = cas % 2.0
            uhol = t * math.pi

            p0 = math.cos(uhol / 2) ** 2
            p_moja = p0 if strana == 0 else 1 - p0
            mult = min(round(EDGE / max(p_moja, 1e-9), 2), MAX_MULT)

            print(f"\nČas: {cas:.3f} s (modulo 2: {t:.3f} s)")
            print(f"Šanca na tvoju stranu ({strana}): {p_moja * 100:.1f}%")
            print(f"Násobiteľ: {mult}x")

            padlo = kvantove_kolo(backend, uhol)
            print(f"Kvantové meranie: {padlo}")

            if padlo == strana:
                zisk = stavka * (mult - 1)
                zostatok += zisk
                print(f"Vyhral si! +{zisk:.2f}")
            else:
                zostatok -= stavka
                print(f"Prehral si -{stavka:.2f}")
            print(f"Zostatok: {zostatok:.2f}\n")
    except (KeyboardInterrupt, EOFError):
        print()

    print(f"Koniec. Finálny zostatok: {zostatok:.2f}")


if __name__ == "__main__":
    main()