import React, { useState } from 'react';

const ManagerDashboard = () => {
    const [products, setProducts] = useState(initialProducts);
    const totalBalance = mockBarbers.reduce((sum, barber) => sum + barber.balance, 0);
    // ... resto do código ...
};

export default ManagerDashboard;
