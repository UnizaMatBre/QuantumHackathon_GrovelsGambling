# NOTE: 'backend' is pre-created as a global variable

from qiskit import QuantumCircuit
from qiskit.providers.jobstatus import JobStatus
import time

def grover(answers:list[int] = 0, num_of_qubits:int = 4, num_of_iterations:int = 4):
    circuit = QuantumCircuit(num_of_qubits, num_of_qubits)
    
    #make super position
    for q in range(num_of_qubits):
        circuit.h(q)
    
    for i in range(num_of_iterations):
        for answer in answers:
            ans = [b=="1" for b in bin(answer)[-num_of_qubits:].rjust(num_of_qubits, "0")]
            for q in range(num_of_qubits): #flip 0
                if not ans[q]:
                    circuit.x(q)
            circuit.h(num_of_qubits-1)
            circuit.mcx(list(range(num_of_qubits-1)), num_of_qubits-1)
            circuit.h(num_of_qubits-1)
            for q in range(num_of_qubits): #unflip 0
                if not ans[q]:
                    circuit.x(q)
        for q in range(num_of_qubits):
            circuit.h(q)
            circuit.x(q)
        circuit.h(num_of_qubits-1)
        circuit.mcx(list(range(num_of_qubits-1)), num_of_qubits-1)
        circuit.h(num_of_qubits-1)
        for q in range(num_of_qubits):
            circuit.x(q)
            circuit.h(q)
    circuit.measure(list(range(num_of_qubits)), list(range(num_of_qubits)))
    
    job = backend.run(circuit.decompose(), shots=1)

    # Poll for status till the job is done
    while True:
        status = job.status()
        print(f"Job status is {status}")
        match status:
            case JobStatus.DONE:
                break
            case JobStatus.ERROR:
                raise Exception(job.result())
        time.sleep(10)

    # Get values to probabilities map
    counts = job.result().get_counts()
    job.result().get_counts().keys()[0]
    return(circuit)


def main():
    # Submit the job for execution

    circuit = grover([9, 13], 4, 2)
    print(circuit)
    print(circuit.decompose())
    job = backend.run(circuit.decompose(), shots=1)

    # Poll for status till the job is done
    while True:
        status = job.status()
        print(f"Job status is {status}")
        match status:
            case JobStatus.DONE:
                break
            case JobStatus.ERROR:
                raise Exception(job.result())
        time.sleep(10)

    # Get values to probabilities map
    counts = job.result().get_counts()
    print(job.result())
