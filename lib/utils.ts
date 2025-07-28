// Simulate network delay
const API_LATENCY = 300; 

export const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getData = async <T>(data: T): Promise<T> => {
    await simulateDelay(API_LATENCY);
    return JSON.parse(JSON.stringify(data)); // Deep copy to prevent mutation
};
