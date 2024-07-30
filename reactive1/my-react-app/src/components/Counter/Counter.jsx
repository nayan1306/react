import { useState } from "react";

function Counter() {
    const [count, setCount] = useState(0);

    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);

    return (
        <div style={{ textAlign: 'center', margin: '20px' }}>
            <h1>Counter</h1>
            <p style={{ fontSize: '24px', margin: '10px' }}>Count: {count}</p>
            <button onClick={increment} style={{ margin: '5px', padding: '10px', fontSize: '16px' }}>Increment</button>
            <button onClick={decrement} style={{ margin: '5px', padding: '10px', fontSize: '16px' }}>Decrement</button>
        </div>
    );
}

export default Counter;
