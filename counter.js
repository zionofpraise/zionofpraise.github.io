let counterData = {};

async function loadData() {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch (error) {
    console.error('Error loading data:', error);
    alert('Failed to load data from server');
    return {};
  }
}

async function initialize() {
  counterData = await loadData();
  render();
}

initialize();

function render() {
  const list = document.getElementById("counterList");
  list.innerHTML = "";

  let total = 0;

  Object.keys(counterData).forEach((name) => {
    const value = counterData[name];
    total += value;

    const li = document.createElement("li");
    li.className = "counter-item";
    li.innerHTML = `
      <div class="counter-name">${name}</div>
      <div class="counter-value">${value}</div>
      <div class="counter-buttons">
        <button class="counter-btn btn-minus" onclick="decrement('${name}')">−</button>
        <button class="counter-btn btn-plus" onclick="increment('${name}')">+</button>
      </div>
    `;
    list.appendChild(li);
  });

  document.getElementById("totalValue").textContent = total;
}

async function increment(name) {
  try {
    const response = await fetch('/api/increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const result = await response.json();
    if (result.success) {
      counterData[name] = result.value;
      render();
    }
  } catch (error) {
    console.error('Error incrementing:', error);
    alert('Failed to update counter');
  }
}

async function decrement(name) {
  try {
    const response = await fetch('/api/decrement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const result = await response.json();
    if (result.success) {
      counterData[name] = result.value;
      render();
    }
  } catch (error) {
    console.error('Error decrementing:', error);
    alert('Failed to update counter');
  }
}

function exportData() {
  const blob = new Blob([JSON.stringify(counterData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'counter-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imported)
      });
      const result = await response.json();
      if (result.success) {
        counterData = result.data;
        render();
        alert("Data imported successfully!");
      }
    } catch (error) {
      alert("Error importing data: " + error.message);
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}
