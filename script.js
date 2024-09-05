const nameInput = document.getElementById('name');
const howManyInput = document.getElementById('howMany');
const totalDigitsInput = document.getElementById('totalDigits');
const generateButton = document.getElementById('generateButton');
const newLotteryButton = document.getElementById('newLotteryButton');
const searchInput = document.getElementById('searchInput');
const numberList = document.getElementById('numberList');

let lotteryData = loadLotteryData();
updateButtonState();
displayLotteryData();

generateButton.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const howMany = parseInt(howManyInput.value);
    const totalDigits = parseInt(totalDigitsInput.value) || 3;

    if (name === "" || isNaN(howMany) || howMany <= 0 || isNaN(totalDigits) || totalDigits <= 0) {
        alert("Please enter valid input: a name, a positive number of sets, and a positive number of digits.");
        return;
    }

    addOrUpdateData(name, howMany, totalDigits);
});

newLotteryButton.addEventListener('click', () => {
    if (confirm("Are you sure you want to start a new lottery? This will erase all existing data.")) {
        localStorage.removeItem('lotteryData');
        lotteryData = { dateGenerated: new Date().toISOString(), data: [] };
        updateButtonState();
        displayLotteryData();
    }
});

searchInput.addEventListener('input', () => {
    displayLotteryData();
});

function generateNumbers(count, totalDigits, existingNumbers = new Set()) {
    const numbers = [];
    const maxPossibleNumbers = Math.pow(9, totalDigits);

    if (existingNumbers.size + count > maxPossibleNumbers) {
        const numberCanBeAdded = maxPossibleNumbers - existingNumbers.size;
        alert(`Exceeding all possible numbers for ${totalDigits} digits, can't add ${count} tickets to user ${nameInput.value}`);

        return numbers;
    }

    // ... (Original logic for when there are enough unique numbers)
    while (numbers.length < count) {
        let randomNumber;
        do {
            randomNumber = generateRandomNumber(totalDigits);
        } while (
            hasRepeatingDigits(randomNumber) ||
            existingNumbers.has(randomNumber) ||
            numbers.includes(randomNumber)
        );

        numbers.push(randomNumber);
        existingNumbers.add(randomNumber);
    }
    return numbers;
}

function generateRandomNumber(totalDigits) {
    const min = Math.pow(10, totalDigits - 1);
    const max = Math.pow(10, totalDigits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hasRepeatingDigits(number) {
    const digits = number.toString().split('');
    return new Set(digits).size !== digits.length;
}

function addOrUpdateData(name, howMany, totalDigits) {
    const allGeneratedNumbers = new Set(lotteryData.data.flatMap(entry => entry.number));
    const existingEntry = lotteryData.data.find(entry => entry.name === name);

    if (existingEntry) {
        const newNumbers = generateNumbers(howMany, totalDigits, allGeneratedNumbers);
        existingEntry.number = [...existingEntry.number, ...newNumbers];
    } else {
        const newNumbers = generateNumbers(howMany, totalDigits, allGeneratedNumbers);
        lotteryData.data.push({ name: name, number: newNumbers });
    }

    saveLotteryData();
    updateButtonState();
    displayLotteryData();
    clearInputs();
}

function loadLotteryData() {
    const data = localStorage.getItem('lotteryData');
    return data ? JSON.parse(data) : { dateGenerated: null, data: [] };
}

function saveLotteryData() {
    localStorage.setItem('lotteryData', JSON.stringify(lotteryData));
}

function updateButtonState() {
    generateButton.textContent = lotteryData.data.length > 0 ? "Add" : "Generate";
}

function displayLotteryData() {
    numberList.innerHTML = '';
    const searchTerm = searchInput.value.trim();

    lotteryData.data.forEach(entry => {
        const matchingNumbers = entry.number.filter(num =>
            searchTerm === "" || num.toString().includes(searchTerm) // Show all if search is empty
        );

        if (matchingNumbers.length > 0) {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<b class="nameDrawn">${entry.name}</b> (${entry.number.length} tickets):  <div class="numberDrawn">${matchingNumbers.join(', ')}</div>`;
            numberList.appendChild(listItem);
        }
    });
}

function clearInputs() {
    nameInput.value = '';
    howManyInput.value = '';
}