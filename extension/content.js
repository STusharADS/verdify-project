
const ICONS = {
    verdifyLogo: `<img src="${chrome.runtime.getURL('leaflogo.jpg')}" class="verdify-icon" alt="Verdify Logo">`,
    positive: `<svg class="verdify-icon" style="color: #008700;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    negative: `<svg class="verdify-icon" style="color: #c40000;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>`
};

async function analyzeProductWithGemini() {
  const productTitleElement = document.querySelector("#productTitle");
  if (!productTitleElement) return;

  const productName = productTitleElement.innerText.trim();
  
  const oldCard = document.querySelector(".verdify-card");
  if (oldCard) oldCard.remove();
  
  const card = document.createElement("div");
  card.className = "verdify-card";
  
  const videoURL = chrome.runtime.getURL('loader.mp4');
  card.innerHTML = `
    <div class="verdify-title">${ICONS.verdifyLogo} VERDIFY ANALYSIS</div>
    <div class="verdify-loader">
        <video src="${videoURL}" autoplay loop muted playsinline></video>
    </div>
  `;
  productTitleElement.insertAdjacentElement("afterend", card);

  try {
    const serverUrl = 'http://localhost:3000/analyze';
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName })
    });
    if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
    const data = await response.json();
    updateCard(data);
  } catch (error) {
    console.error("Verdify Error:", error);
    card.innerHTML = `<div class="verdify-title">${ICONS.verdifyLogo} ERROR</div><p>Could not connect to the analysis server :( Please try again later </p>`;
  }
}

function updateCard(data) {
  const card = document.querySelector(".verdify-card");
  if (!card) return;

  const productImage = document.querySelector('#landingImage, #imgTagWrapperId img, #main-image-container img, .imgTagWrapper img');
  if (productImage) {
    productImage.classList.remove("verdify-aura-green", "verdify-aura-red");
    if (data.sustainabilityScore >= 70) productImage.classList.add("verdify-aura-green");
    else if (data.sustainabilityScore <= 40) productImage.classList.add("verdify-aura-red");
  }
  
  const keyPointsHTML = data.keyPoints.map(p => `<li class="verdify-list-item">${ICONS[p.type]}<span>${p.text}</span></li>`).join('');
  const palsHTML = `
    <div class="verdify-pals-container">
      <div class="verdify-pal leafy">
        <div class="pot"></div><div class="stem"></div><div class="leaf left"></div><div class="leaf right"></div>
        <div class="eye"><div class="pupil"></div></div><div class="eye right"><div class="pupil"></div></div>
        <div class="mouth"></div><div class="tear tear-left"></div><div class="tear tear-right"></div>
      </div>
      <div class="verdify-pal cactus">
        <div class="pot"></div><div class="body"><div class="arm left"></div><div class="arm right"></div></div>
        <div class="eye"><div class="pupil"></div></div><div class="mouth"></div><div class="tear"></div>
      </div>
    </div>
  `;

  let cardHTML = `
    <div class="verdify-header">
      <div class="verdify-title">${ICONS.verdifyLogo} VERDIFY ANALYSIS</div>
      <div class="verdify-scores-pals-wrapper">
        ${palsHTML}
        <div class="verdify-scores">
          <div class="verdify-score">${data.sustainabilityScore}/100</div>
          <div class="verdify-confidence">Confidence: ${data.confidenceScore}/100</div>
        </div>
      </div>
    </div>
    <ul class="verdify-list">${keyPointsHTML}</ul>
  `;

  if (data.sustainabilityScore < 50 && data.smarterSwap?.searchLink) {
    cardHTML += `<div class="verdify-section verdify-swap-section"><h4 class="verdify-section-title">SMARTER SWAP SUGGESTED</h4><a href="${data.smarterSwap.searchLink}" target="_blank" class="verdify-swap-link">Search for: ${data.smarterSwap.name}</a></div>`;
  }

  if (data.sustainabilityScore >= 70) {
    cardHTML += `<div class="verdify-section verdify-impact-tracker"><h4 class="verdify-section-title">TRACK YOUR POSITIVE IMPACT</h4><button id="trackChoiceBtn" class="verdify-track-button">I'm choosing this sustainable option!</button></div>`;
  }
  
  card.innerHTML = cardHTML;

  const defaultMood = data.sustainabilityScore;
  setVerdiPalMood(defaultMood, card);
  setupEyeTracking();
  setupButtonHoverListeners(defaultMood, card);

  const trackButton = document.getElementById("trackChoiceBtn");
  if (trackButton) {
    trackButton.addEventListener("click", () => {
      chrome.storage.local.get({ impactData: {} }, (result) => {
        let impactData = result.impactData;
        const category = data.impactCategory;
        impactData[category] = (impactData[category] || 0) + 1;
        chrome.storage.local.set({ impactData }, () => {
          trackButton.innerText = `Great choice! Impact tracked.`;
          trackButton.disabled = true;
          trackButton.classList.add("tracked");
        });
      });
    }, { once: true });
  }
}

function setVerdiPalMood(score, cardElement) {
  const pals = cardElement.querySelectorAll('.verdify-pal');
  pals.forEach(pal => {
    const mouth = pal.querySelector('.mouth');
    mouth.classList.remove('happy', 'sad', 'neutral');
    pal.classList.remove('happy-bouncing', 'sad-crying');

    if (score >= 70) {
      mouth.classList.add('happy');
      pal.classList.add('happy-bouncing');
    } else if (score <= 40) {
      mouth.classList.add('sad');
      pal.classList.add('sad-crying');
    } else {
      mouth.classList.add('neutral');
    }
  });
}

function setupEyeTracking() {
  document.addEventListener('mousemove', (e) => {
    const pupils = document.querySelectorAll('.verdify-pal .pupil');
    if (pupils.length === 0) return;

    pupils.forEach(pupil => {
      const eye = pupil.parentElement;
      const rect = eye.getBoundingClientRect();
      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
      const pupilMoveX = Math.cos(angle) * (eye.offsetWidth / 4);
      const pupilMoveY = Math.sin(angle) * (eye.offsetHeight / 4);
      pupil.style.transform = `translate(${pupilMoveX}px, ${pupilMoveY}px)`;
    });
  });
}

function setupButtonHoverListeners(defaultScore, cardElement) {
  const purchaseButtons = document.querySelectorAll('#addToCart_feature_div, #buy-now-button, #add-to-cart-button');
  const swapLink = cardElement.querySelector('.verdify-swap-link');

  const setTemporaryMood = (moodScore) => setVerdiPalMood(moodScore, cardElement);
  
  purchaseButtons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      if (defaultScore < 50) setTemporaryMood(0);
      else if (defaultScore >= 70) setTemporaryMood(100);
    });
    button.addEventListener('mouseleave', () => {
      setTemporaryMood(defaultScore);
    });
  });

  if (swapLink) {
    swapLink.addEventListener('mouseenter', () => {
      setTemporaryMood(100);
    });
    swapLink.addEventListener('mouseleave', () => {
      setTemporaryMood(defaultScore);
    });
  }
}

analyzeProductWithGemini();