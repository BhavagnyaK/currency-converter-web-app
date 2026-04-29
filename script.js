const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const fromFlag = document.getElementById('from-flag');
const toFlag = document.getElementById('to-flag');
const convertBtn = document.getElementById('convert-btn');
const swapBtn = document.getElementById('swap-btn');
const result = document.getElementById('result');
const amountInput = document.getElementById('amount');

// put your key here 👇
const API_KEY = "f825eb7fb5ca22ca143c0fc2";  

function fmtNumber(n) {
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// populate dropdowns
function populateCurrencySelects() {
  const codes = Object.keys(country_list).sort();
  for (const code of codes) {
    const o1 = document.createElement('option');
    o1.value = code;
    o1.textContent = code;
    fromCurrency.appendChild(o1);

    const o2 = o1.cloneNode(true);
    toCurrency.appendChild(o2);
  }

  fromCurrency.value = "USD";
  toCurrency.value = "INR";
}

function updateFlag(selectEl, imgEl) {
  const cur = selectEl.value;
  const countryCode = country_list[cur];
  if (!countryCode) {
    imgEl.style.visibility = 'hidden';
    return;
  }
  imgEl.style.visibility = 'visible';
  imgEl.src = `https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png`;
  imgEl.alt = countryCode;
}

function swapCurrencies() {
  const a = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = a;
  updateFlag(fromCurrency, fromFlag);
  updateFlag(toCurrency, toFlag);
  getExchangeRate();
}

async function getExchangeRate() {
  let amount = Number(amountInput.value);
  if (!isFinite(amount) || amount <= 0) {
    amount = 1;
    amountInput.value = 1;
  }

  const from = fromCurrency.value;
  const to = toCurrency.value;

  result.textContent = 'Converting...';
  convertBtn.disabled = true;

  try {
    // exchangerate-api.com endpoint
    const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${from}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Network error: ${resp.status}`);

    const data = await resp.json();
    console.debug("API response:", data);

    if (!data.conversion_rates || typeof data.conversion_rates[to] !== 'number') {
      throw new Error("Invalid response from API");
    }

    const rate = data.conversion_rates[to];
    const converted = rate * amount;

    result.textContent = `${fmtNumber(amount)} ${from} = ${fmtNumber(converted)} ${to}`;

  } catch (err) {
    console.error("Conversion error:", err);
    result.textContent = `Conversion failed. ${err.message}`;
  } finally {
    convertBtn.disabled = false;
  }
}

// init
document.addEventListener('DOMContentLoaded', () => {
  populateCurrencySelects();
  updateFlag(fromCurrency, fromFlag);
  updateFlag(toCurrency, toFlag);
  getExchangeRate();
});

fromCurrency.addEventListener('change', () => updateFlag(fromCurrency, fromFlag));
toCurrency.addEventListener('change', () => updateFlag(toCurrency, toFlag));
convertBtn.addEventListener('click', getExchangeRate);
swapBtn.addEventListener('click', swapCurrencies);
amountInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') getExchangeRate();
});
