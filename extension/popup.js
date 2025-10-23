document.addEventListener('DOMContentLoaded', () => {
  const impactListElement = document.getElementById('impact-list');
  const IMPACT_ICONS = {
    "Reduced Plastic Waste": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 7.756a4.5 4.5 0 100 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    "Lower Energy Use": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>`,
    "E-Waste Prevention": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>`,
    "Sustainable Materials": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>`,
    "General Eco-Choice": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.01 9.01 0 006.25-2.624m-1.39-4.876a4.502 4.502 0 00-8.72 0m10.11 4.876A9.01 9.01 0 0112 21a9.01 9.01 0 01-6.25-15.624m1.39 4.876a4.5 4.5 0 018.72 0z" /></svg>`
  };

  chrome.storage.local.get({ impactData: {} }, (result) => {
    const impactData = result.impactData;
    const keys = Object.keys(impactData);

    if (keys.length === 0) {
      impactListElement.innerHTML = `<li>Start making sustainable choices to see your impact grow!</li>`;
    } else {
      impactListElement.innerHTML = '';
      keys.forEach(key => {
        const value = impactData[key];
        const iconSVG = IMPACT_ICONS[key] || '<span>⭐</span>'; // Fallback
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span class="impact-value">${value}x</span> <span class="impact-icon">${iconSVG}</span> <span>${key}</span>`;
        impactListElement.appendChild(listItem);
      });
    }
  });
});