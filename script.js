document.addEventListener('DOMContentLoaded', function() {
    const nisabThreshold = 4000.00;
    const zakatRate = 0.025;
    const form = document.getElementById('assetForm');
    const totalAssetsElement = document.getElementById('total');
    const haulMonthsElement = document.getElementById('haulMonths');
    const zakatEligibilityElement = document.getElementById('zakatEligibility');
    const lowestTotalElement = document.getElementById('lowestTotal');
    const zakatAmountElement = document.getElementById('zakatAmount');
    const nisabElement = document.getElementById('nisab');
    const historyList = document.getElementById('historyList');
    const resetMessageElement = document.getElementById('resetMessage');
    const resetHaulButton = document.getElementById('resetHaulButton');

    nisabElement.textContent = nisabThreshold.toFixed(2);

    form.addEventListener('input', function() {
        const savings = parseFloat(document.getElementById('savings').value) || 0;
        const stocks = parseFloat(document.getElementById('stocks').value) || 0;
        const gold = parseFloat(document.getElementById('gold').value) || 0;

        const totalAssets = savings + stocks + gold;
        totalAssetsElement.value = totalAssets.toFixed(2);
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const date = document.getElementById('date').value;
        const savings = parseFloat(document.getElementById('savings').value) || 0;
        const stocks = parseFloat(document.getElementById('stocks').value) || 0;
        const gold = parseFloat(document.getElementById('gold').value) || 0;

        if (!date) {
            alert('Please select a date.');
            return;
        }

        let history = JSON.parse(localStorage.getItem('zakatHistory')) || [];

        if (history.some(entry => entry.date === date)) {
            alert('An entry for this month already exists.');
            return;
        }

        const totalAssets = savings + stocks + gold;

        updateHistory(date, savings, stocks, gold, totalAssets);
    });

    function updateHistory(date, savings, stocks, gold, totalAssets) {
        const historyEntry = {
            date: date,
            savings: savings,
            stocks: stocks,
            gold: gold,
            totalAssets: totalAssets
        };

        let history = JSON.parse(localStorage.getItem('zakatHistory')) || [];
        history.push(historyEntry);
        localStorage.setItem('zakatHistory', JSON.stringify(history));
        renderHistory();
        updateHaulStatus();
    }

    function renderHistory() {
        let history = JSON.parse(localStorage.getItem('zakatHistory')) || [];
        historyList.innerHTML = '';
        history.forEach((entry, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `Date: ${entry.date} | Savings: $${entry.savings.toFixed(2)} | Stocks: $${entry.stocks.toFixed(2)} | Gold: $${entry.gold.toFixed(2)} | Total Assets: $${entry.totalAssets.toFixed(2)} <button class="delete" data-index="${index}">Delete</button>`;
            historyList.appendChild(listItem);
        });

        document.querySelectorAll('button.delete').forEach(button => {
            button.addEventListener('click', deleteEntry);
        });
    }

    function deleteEntry(event) {
        const index = event.target.dataset.index;
        let history = JSON.parse(localStorage.getItem('zakatHistory')) || [];
        history.splice(index, 1);
        localStorage.setItem('zakatHistory', JSON.stringify(history));
        renderHistory();
        updateHaulStatus();
    }

    function updateHaulStatus() {
        let history = JSON.parse(localStorage.getItem('zakatHistory')) || [];
        const eligibleMonths = countEligibleMonths(history);
        haulMonthsElement.textContent = eligibleMonths;

        if (eligibleMonths >= 12) {
            zakatEligibilityElement.style.display = 'block';
            const lowestTotal = Math.min(...history.map(entry => entry.totalAssets));
            lowestTotalElement.textContent = lowestTotal.toFixed(2);
            const zakatAmount = lowestTotal * zakatRate;
            zakatAmountElement.textContent = zakatAmount.toFixed(2);
        } else {
            zakatEligibilityElement.style.display = 'none';
        }

        const belowNisab = history.some(entry => entry.totalAssets < nisabThreshold);
        if (belowNisab) {
            resetHaul();
            resetMessageElement.style.display = 'block';
        } else {
            resetMessageElement.style.display = 'none';
        }
    }

    function countEligibleMonths(history) {
        return history.filter(entry => entry.totalAssets >= nisabThreshold).length;
    }

    function resetHaul() {
        localStorage.removeItem('zakatHistory');
        renderHistory();
        updateHaulStatus();
    }

    resetHaulButton.addEventListener('click', function() {
        resetHaul();
        resetMessageElement.style.display = 'block';
    });

    renderHistory();
    updateHaulStatus();
});
