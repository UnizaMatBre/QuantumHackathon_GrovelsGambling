const sleepFor = (ms) => { 
    
    return new Promise(resolve => setTimeout(resolve, ms)); 
}


const run_grover = async (answers, qubits, operations) => {
    await sleepFor(5000);

    const successChance = (operations) / 26;

    
    if(Math.random() < successChance) {
        return answers[0];
    }
    
    return answers[0] - 1;

};

export { run_grover };