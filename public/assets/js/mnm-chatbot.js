/* =====================================================================
   MNM CONCIERGE — 100% Client-Side, Menu-Driven FAQ Chatbot
   Monks & Monkeys Travels · mnmtravels.com
   ---------------------------------------------------------------------
   A guided, Rufus-style assistant that runs entirely in the visitor's
   browser. No servers, no external APIs, no API keys, no tracking.

     1. MAIN MENU      — the bot greets and offers Quick Reply buttons.
     2. GUIDED FLOW    — menus drill into sub-topics; every answer is a
                         pre-baked entry from an embedded knowledge base.
     3. KEYWORD MATCH  — free-typed queries are tokenised and scored by
                         keyword overlap; >= 50% token coverage shows the
                         best pre-baked answer (after a short typing
                         indicator), otherwise the bot hands off.
     4. HUMAN HANDOFF  — any unknown query, or a "not helpful" tap,
                         instantly shows the concierge's phone, email and
                         WhatsApp click-to-chat buttons.

   Fully offline · $0 running cost · zero security surface.
   ===================================================================== */

(function () {
  'use strict';

  /* ================================================================
   * 1. CONFIGURATION
   * ================================================================ */

  const TYPING_DELAY_MS = 600; // "thinking" pause before answering a typed query
  const MATCH_THRESHOLD = 50;  // minimum % of query tokens an FAQ must cover
  const HISTORY_LIMIT = 200;   // in-memory message-history cap

  const GREETING = "Hello! I'm the MNM Concierge. How can I help you today?";

  /* ----------------------------------------------------------------
   * Direct-contact block — phone · email · WhatsApp.
   * Numbers are the ones published on the Contact page. WhatsApp uses
   * the click-to-chat API (wa.me) and always opens in a new tab.
   * ---------------------------------------------------------------- */
  const PHONE_PRIMARY = { display: '+91-11-35919499', tel: '+911135919499' };
  const PHONE_SECONDARY = { display: '+91-11-35537525', tel: '+911135537525' };
  const CONTACT_EMAIL = 'concierge@mnmtravels.com';

  const WHATSAPP_NUMBERS = [
    { display: '+91-11-35919499', link: 'https://wa.me/911135919499' },
    { display: '+91-11-35537525', link: 'https://wa.me/911135537525' }
  ];

  // Official WhatsApp glyph — Lucide ships no brand marks, so the icon is
  // inlined (inherits the button's colour via currentColor).
  const WHATSAPP_ICON =
    '<svg class="mnm-wa-icon" viewBox="0 0 24 24" width="15" height="15" ' +
    'aria-hidden="true" focusable="false" fill="currentColor">' +
    '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.347-.347.52-.52.174-.174.232-.298.347-.497.115-.198.057-.371-.058-.52-.116-.148-.694-1.67-.95-2.278-.25-.598-.503-.518-.69-.527l-.588-.01c-.204 0-.535.075-.815.372-.28.297-1.07 1.045-1.07 2.549 0 1.504 1.096 2.957 1.249 3.156.153.198 2.156 3.292 5.224 4.615.73.315 1.3.503 1.744.644.733.233 1.4.2 1.928.121.589-.088 1.814-.741 2.07-1.457.256-.716.256-1.33.18-1.458-.077-.128-.28-.204-.578-.353m-5.475 7.404h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>' +
    '</svg>';

  /** WhatsApp CTA buttons — one per published number. These live inside bot
   *  bubbles, so they are real anchors (new tab) rather than menu buttons. */
  function whatsappButtonsHtml() {
    return WHATSAPP_NUMBERS.map(function (number) {
      return (
        '<a class="mnm-wa-btn" href="' + number.link + '" target="_blank" ' +
        'rel="noopener noreferrer" ' +
        'aria-label="Chat on WhatsApp with MNM Travels at ' + number.display + '">' +
        WHATSAPP_ICON +
        '<span class="mnm-wa-label">Chat on WhatsApp</span>' +
        '<span class="mnm-wa-num">' + number.display + '</span>' +
        '</a>'
      );
    }).join('');
  }

  /** Phone + email + WhatsApp, shared by the handoff and WhatsApp replies. */
  function contactSectionHtml(intro) {
    return (
      intro + '<br><br>' +
      '📞 <a href="tel:' + PHONE_PRIMARY.tel + '">' + PHONE_PRIMARY.display + '</a>' +
      ' &middot; ' +
      '<a href="tel:' + PHONE_SECONDARY.tel + '">' + PHONE_SECONDARY.display + '</a><br>' +
      '✉️ <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a>' +
      '<div class="mnm-wa-row">' + whatsappButtonsHtml() + '</div>'
    );
  }

  const FALLBACK_HTML = contactSectionHtml(
    'I want to make sure you get the perfect itinerary! For personalized assistance, ' +
    'please reach out to our travel experts directly:'
  );

  const WHATSAPP_HTML =
    "Great choice — WhatsApp is the fastest way to reach our travel experts! 💬 " +
    "Tap a number below to start chatting. It opens WhatsApp in a new tab, " +
    "so your place on the site is kept:" +
    '<div class="mnm-wa-row">' + whatsappButtonsHtml() + '</div>';

  const THANKS_REPLY = "Wonderful! 🌟 I'm glad I could help. Is there anything else you'd like to explore?";

  const NO_TOKENS_REPLY = "Hi there! 👋 Here's a quick look at what I can help you with:";

  /* ================================================================
   * 2. KNOWLEDGE BASE — 12 pre-baked MNM Travels FAQs
   *    (facts grounded in the live site: mnmtravels.com)
   * ================================================================ */

  const KNOWLEDGE_BASE = [
    {
      id: 'destinations',
      category: 'destinations',
      question: 'Which destinations do you cover?',
      keywords: ['destination', 'destinations', 'where', 'place', 'places', 'india', 'nepal', 'bhutan', 'international', 'abroad', 'tour', 'tours', 'package', 'packages', 'trip', 'travel', 'visit', 'goa', 'rajasthan', 'himalayas', 'индия', 'непал', 'бутан'],
      answer: "We curate 100+ journeys across India and beyond: 🏰 Rajasthan's forts & palaces, 🌴 Kerala's backwaters, 🏔️ Kashmir & the Himalayas, 🛕 Ayodhya & the great temples, 🏖️ Goa & the Andamans — plus international escapes: Nepal (Kathmandu–Chitwan–Pokhara), Bhutan (Thimphu–Punakha–Paro) and the Buddhist Circuit. Which one calls to you?"
    },
    {
      id: 'kerala-honeymoon',
      category: 'destinations',
      question: 'Can you plan a Kerala honeymoon?',
      keywords: ['kerala', 'honeymoon', 'honeymoons', 'backwaters', 'backwater', 'munnar', 'alleppey', 'kovalam', 'houseboat', 'houseboats', 'romantic', 'couple', 'couples', 'marriage', 'wedding'],
      answer: "Kerala is one of our most-loved honeymoon destinations! 💑 A typical 6-day escape: Munnar's tea hills → a night on a private Alleppey houseboat → Kovalam's golden beaches, with candlelit dinners and couples' Ayurveda included. Available in all four tiers (Standard → Unique) and fully customizable. Shall our experts craft your romantic itinerary?"
    },
    {
      id: 'ladakh-permits',
      category: 'destinations',
      question: 'Do I need permits for Ladakh?',
      keywords: ['ladakh', 'leh', 'ladakhi', 'permit', 'permits', 'pangong', 'nubra', 'khardungla', 'moriri', 'inner', 'protected', 'adventure', 'bike', 'rafting'],
      answer: "Yes — certain Ladakh areas need permits: 📄 Indian nationals require an Inner Line Permit for Nubra Valley, Pangong Tso and Tso Moriri. 🌍 Foreign nationals additionally need a Protected Area Permit. Don't worry — we arrange every permit for you before the trip begins. Just carry a valid government photo ID (passport for foreign nationals)."
    },
    {
      id: 'bhutan-visa',
      category: 'destinations',
      question: 'What are Bhutan visa requirements?',
      keywords: ['bhutan', 'bhutanese', 'visa', 'visas', 'thimphu', 'paro', 'punakha', 'tigers', 'nest', 'taktsang', 'entry', 'passport', 'foreigner', 'foreigners', 'fee', 'sdf'],
      answer: "Bhutan entry is straightforward with us: 🇮🇳 Indian citizens need a valid passport or voter ID plus an entry permit — we arrange it. 🌍 Foreign nationals need a visa obtained through a licensed Bhutanese operator (that's us!) plus the Sustainable Development Fee. Your passport should have 6+ months validity. We handle all the paperwork — you enjoy the Tiger's Nest!"
    },
    {
      id: 'best-time',
      category: 'destinations',
      question: 'When is the best time to visit?',
      keywords: ['best', 'time', 'season', 'seasons', 'weather', 'month', 'months', 'when', 'winter', 'summer', 'monsoon', 'december', 'january', 'february', 'march', 'october', 'november', 'snow', 'climate', 'festival', 'festivals'],
      answer: "Here's a quick seasonal guide: 🗓️ Oct–Mar — perfect for Rajasthan, Kerala, Goa and the temple towns. ❄️ Dec–Feb — magical snow in Kashmir. ⛰️ Apr–Jun — ideal for Ladakh and the Himalayas. 🌸 Nepal & Bhutan shine in spring (Mar–May) and autumn (Sep–Nov). Tell us your month and we'll match the perfect destination!"
    },
    {
      id: 'budget-tiers',
      category: 'budget',
      question: 'What are your budget tiers?',
      keywords: ['budget', 'tier', 'tiers', 'standard', 'executive', 'premium', 'unique', 'luxury', 'luxurious', 'level', 'levels', 'category', 'categories', 'class', 'options', 'cheapest'],
      answer: "Every MNM journey comes in four comfortable tiers: 💼 Standard — value-for-money hotels and transport. ⭐ Executive — 4-star stays and private AC transport. 👑 Premium — 5-star and heritage properties with private guides. 💎 Unique — once-in-a-lifetime experiences: palace stays, private ceremonies, bespoke routes. Pick a tier and we'll design around it!"
    },
    {
      id: 'pricing',
      category: 'budget',
      question: 'How much do tours cost?',
      keywords: ['price', 'prices', 'pricing', 'cost', 'costs', 'money', 'expensive', 'cheap', 'affordable', 'quotation', 'quote', 'estimate', 'rate', 'rates', 'fee', 'rupees', 'inr'],
      answer: "Guideline pricing: 🇮🇳 Short domestic escapes start around ₹15,000 per person. 🌏 International journeys (Nepal, Bhutan and beyond) typically start around ₹45,000 per person. Every quote is customized to your dates, tier and group size — and it's always free, with no obligation!"
    },
    {
      id: 'booking-process',
      category: 'booking',
      question: 'How do I book a tour?',
      keywords: ['book', 'booking', 'bookings', 'reserve', 'reservation', 'enquiry', 'enquire', 'inquiry', 'plan', 'arrange', 'confirm', 'process', 'steps', 'start'],
      answer: "Booking with us is easy: 1️⃣ Browse journeys on our Destinations page. 2️⃣ Send an enquiry via the Get a Quote form, email or phone. 3️⃣ Receive a free customized itinerary — usually within one business day. 4️⃣ Confirm with a booking advance — and pack your bags! 🧳"
    },
    {
      id: 'payments-cancellation',
      category: 'booking',
      question: 'How do payments and cancellations work?',
      keywords: ['payment', 'payments', 'pay', 'advance', 'deposit', 'refund', 'refunds', 'cancellation', 'cancel', 'cancelled', 'policy', 'terms', 'invoice', 'instalment', 'installment', 'emi'],
      answer: "Payments are simple: a booking advance confirms your trip, and the balance follows the schedule shared in your confirmation. Every payment comes with a formal invoice and booking documentation. Cancellation terms vary by package and season — our experts will share the exact policy along with your quote."
    },
    {
      id: 'custom-itinerary',
      category: 'booking',
      question: 'Can you create a custom itinerary?',
      keywords: ['custom', 'customise', 'customize', 'customised', 'customized', 'bespoke', 'tailor', 'tailor-made', 'tailored', 'personalized', 'personalised', 'private', 'special', 'family', 'group', 'itinerary', 'flexible'],
      answer: "Absolutely — tailor-made journeys are our signature! ✨ Share your destinations, dates, budget tier and interests (honeymoon, family, pilgrimage, adventure, wildlife, Ayurveda & yoga), and our experts will craft a private itinerary just for you — adjustable until it feels perfect."
    },
    {
      id: 'russian-language',
      category: 'support',
      question: 'Do you offer Russian language tours?',
      keywords: ['russian', 'russia', 'language', 'languages', 'english', 'interpreter', 'guide', 'guides', 'translator', 'translate', 'speak', 'русский', 'язык', 'тур'],
      answer: "Да, конечно! 😊 We serve travellers in English and Russian — both on the website and on our tours. English- and Russian-speaking trip designers and guides are available for every journey. Просто укажите ваш язык при запросе!"
    },
    {
      id: 'contact',
      category: 'support',
      question: 'How can I contact a human expert?',
      keywords: ['contact', 'email', 'phone', 'call', 'number', 'whatsapp', 'human', 'agent', 'expert', 'person', 'talk', 'speak', 'support', 'concierge', 'office', 'address', 'delhi', 'reach'],
      answer: "Our travel experts are one message away: 📞 +91-11-35919499 or +91-11-35537525 · ✉️ concierge@mnmtravels.com. Based in Delhi, India, we typically reply within one business day. We'd love to plan your next adventure!"
    }
  ];

  /* ================================================================
   * 3. MENU STRUCTURE — main menu + per-category drill-downs
   * ================================================================ */

  function faqById(id) {
    for (let i = 0; i < KNOWLEDGE_BASE.length; i++) {
      if (KNOWLEDGE_BASE[i].id === id) return KNOWLEDGE_BASE[i];
    }
    return null;
  }

  function faqAnswer(id) {
    const faq = faqById(id);
    return faq ? faq.answer : '';
  }

  const MAIN_MENU_OPTIONS = [
    { label: '🌍 Popular Destinations', action: { type: 'category', id: 'destinations' } },
    { label: '💰 Budget & Pricing', action: { type: 'category', id: 'budget' } },
    { label: '📅 Booking & Payments', action: { type: 'category', id: 'booking' } },
    { label: '📞 Contact Support', action: { type: 'support' } },
    { label: '💬 Chat on WhatsApp', action: { type: 'whatsapp' } }
  ];

  const CATEGORY_MENUS = {
    destinations: {
      message: faqAnswer('destinations'),
      options: [
        { label: '🏖️ Kerala Honeymoon', action: { type: 'faq', id: 'kerala-honeymoon' } },
        { label: '🏔️ Ladakh Permits', action: { type: 'faq', id: 'ladakh-permits' } },
        { label: '🏯 Bhutan Visa', action: { type: 'faq', id: 'bhutan-visa' } },
        { label: '🗓️ Best Time to Visit', action: { type: 'faq', id: 'best-time' } },
        { label: '🔄 Back to Main Menu', action: { type: 'menu' } }
      ]
    },
    budget: {
      message: faqAnswer('budget-tiers'),
      options: [
        { label: '🏷️ Starting Prices', action: { type: 'faq', id: 'pricing' } },
        { label: '🔄 Back to Main Menu', action: { type: 'menu' } }
      ]
    },
    booking: {
      message: faqAnswer('booking-process'),
      options: [
        { label: '💳 Payments & Cancellation', action: { type: 'faq', id: 'payments-cancellation' } },
        { label: '✨ Custom Itineraries', action: { type: 'faq', id: 'custom-itinerary' } },
        { label: '🔄 Back to Main Menu', action: { type: 'menu' } }
      ]
    }
  };

  /* ================================================================
   * 4. KEYWORD MATCHING ENGINE
   *    Score = % of meaningful query tokens covered by an FAQ's
   *    keywords (weight 2) or question words (weight 1).
   * ================================================================ */

  const STOPWORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when',
    'at', 'by', 'for', 'with', 'about', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'once', 'here',
    'there', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now',
    'i', 'me', 'my', 'we', 'our', 'ours', 'you', 'your', 'yours', 'he',
    'she', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who',
    'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was',
    'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do',
    'does', 'did', 'doing', 'would', 'could', 'ought', 'of', 'as',
    'also', 'please', 'tell', 'give', 'let', 'us', 'get', 'got', 'me',
    'much', 'many', 'thing', 'things', 'something', 'anything', 'way',
    'want', 'wants', 'need', 'needs', 'like', 'know', 'help', 'hi',
    'hello', 'hey', 'thanks', 'thank', 'ok', 'okay', 'sir', 'madam',
    'hey', 'yo', 'namaste', 'please', 'yes', 'nope', 'yeah'
  ]);

  /** Lowercase, strip punctuation, split, drop stopwords. */
  function tokenize(text) {
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\u0400-\u04FF\s'-]/g, ' ')
      .split(/\s+/)
      .map(function (t) { return t.replace(/^['-]+|['-]+$/g, ''); })
      .filter(function (t) { return t.length > 1 && !STOPWORDS.has(t); });
  }

  /** Cheap singularisation so 'permits' matches 'permit', etc. */
  function singularize(token) {
    if (token.length > 3) {
      if (/ies$/.test(token)) return token.slice(0, -3) + 'y';
      if (/(ses|xes|zes|ches|shes)$/.test(token)) return token.slice(0, -2);
      if (/s$/.test(token) && !/(ss|us|is)$/.test(token)) return token.slice(0, -1);
    }
    return token;
  }

  /** Exact, singularised or prefix match (prefixes >= 3 chars). */
  function tokenMatches(token, keyword) {
    if (token === keyword) return true;
    const st = singularize(token);
    const sk = singularize(keyword);
    if (st === sk) return true;
    if (sk.length >= 3 && sk.length <= st.length && st.indexOf(sk) === 0) return true;
    if (st.length >= 3 && st.length <= sk.length && sk.indexOf(st) === 0) return true;
    return false;
  }

  /** Pre-computed search terms per FAQ: keywords (w2) + question words (w1). */
  const FAQ_INDEX = KNOWLEDGE_BASE.map(function (faq) {
    const terms = [];
    const seen = Object.create(null);

    function addTerm(token, weight) {
      if (!token || seen[token]) return;
      seen[token] = true;
      terms.push({ t: token, w: weight });
    }

    faq.keywords.forEach(function (kw) {
      tokenize(kw).forEach(function (t) { addTerm(t, 2); });
    });
    tokenize(faq.question).forEach(function (t) { addTerm(t, 1); });

    return { faq: faq, terms: terms };
  });

  /**
   * Score every FAQ against the query and return the best match, but
   * only when its coverage reaches MATCH_THRESHOLD (% of query tokens).
   * Ties are broken by total matched weight (keywords > question words).
   */
  function findBestMatch(query) {
    const tokens = tokenize(query);
    if (tokens.length === 0) return null;

    let best = null;
    FAQ_INDEX.forEach(function (entry) {
      let covered = 0;
      let weight = 0;

      tokens.forEach(function (token) {
        let bestHit = 0;
        for (let i = 0; i < entry.terms.length; i++) {
          if (tokenMatches(token, entry.terms[i].t)) {
            bestHit = Math.max(bestHit, entry.terms[i].w);
            if (bestHit === 2) break;
          }
        }
        if (bestHit > 0) {
          covered += 1;
          weight += bestHit;
        }
      });

      const score = Math.round((covered / tokens.length) * 100);
      if (covered > 0 && (!best || score > best.score || (score === best.score && weight > best.weight))) {
        best = { faq: entry.faq, score: score, weight: weight };
      }
    });

    return best && best.score >= MATCH_THRESHOLD ? best : null;
  }

  /* ================================================================
   * 5. STATE
   * ================================================================ */

  const state = {
    open: false,        // panel visibility
    busy: false,        // true while the 600ms typing indicator is showing
    initialized: false, // main menu shown at least once
    view: null,         // 'main' | <category id> | 'faq:<id>' | 'fallback'
    history: []         // lightweight log of the conversation
  };

  function pushHistory(entry) {
    state.history.push(entry);
    if (state.history.length > HISTORY_LIMIT) state.history.shift();
  }

  /* ================================================================
   * 6. DOM & RENDERING
   * ================================================================ */

  const ICON_CHAT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  const ICON_CLOSE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  const ICON_SEND = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

  const WIDGET_TEMPLATE =
    '<button class="mnm-launcher" type="button" aria-label="Chat with the MNM Concierge" aria-expanded="false">' +
      ICON_CHAT +
      '<span class="mnm-launcher-badge">1</span>' +
    '</button>' +
    '<section class="mnm-panel" role="dialog" aria-label="MNM Concierge chat assistant">' +
      '<header class="mnm-header">' +
        '<div class="mnm-header-avatar" aria-hidden="true">M</div>' +
        '<div class="mnm-header-text">' +
          '<div class="mnm-header-title">MNM Concierge</div>' +
          '<div class="mnm-header-sub"><span class="mnm-online-dot"></span>Online &middot; replies instantly</div>' +
        '</div>' +
        '<button class="mnm-close" type="button" aria-label="Close chat">' + ICON_CLOSE + '</button>' +
      '</header>' +
      '<div class="mnm-messages" aria-live="polite"></div>' +
      '<form class="mnm-input-row">' +
        '<input class="mnm-input" type="text" placeholder="Type your question…" maxlength="500" autocomplete="off" aria-label="Type your message" />' +
        '<button class="mnm-send" type="submit" aria-label="Send message">' + ICON_SEND + '</button>' +
      '</form>' +
      '<div class="mnm-footer">For bookings &amp; personalised quotes &rarr; <a href="mailto:concierge@mnmtravels.com">concierge@mnmtravels.com</a></div>' +
    '</section>';

  let rootEl = null;
  let launcherEl = null;
  let messagesEl = null;
  let inputEl = null;
  let sendEl = null;

  function scrollMessagesToEnd() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function currentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Append a bot message. `html` is always a hardcoded, trusted string
   * from this file (FAQ answers, fallback text) — never user input —
   * so rendering it as HTML is safe and enables the <br> line breaks.
   */
  function addBotText(html) {
    const msg = document.createElement('div');
    msg.className = 'mnm-msg mnm-msg-bot';

    const avatar = document.createElement('div');
    avatar.className = 'mnm-msg-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = 'M';

    const bubble = document.createElement('div');
    bubble.className = 'mnm-msg-bubble';

    const textNode = document.createElement('div');
    textNode.className = 'mnm-msg-text';
    textNode.innerHTML = html; // trusted: static strings from this script only

    const time = document.createElement('div');
    time.className = 'mnm-msg-time';
    time.textContent = currentTime();

    bubble.appendChild(textNode);
    bubble.appendChild(time);
    msg.appendChild(avatar);
    msg.appendChild(bubble);
    messagesEl.appendChild(msg);

    pushHistory({ role: 'bot', text: html });
    scrollMessagesToEnd();
  }

  /** Append a user message. Always textContent — never HTML (XSS-safe). */
  function addUserText(text) {
    const msg = document.createElement('div');
    msg.className = 'mnm-msg mnm-msg-user';

    const bubble = document.createElement('div');
    bubble.className = 'mnm-msg-bubble';

    const textNode = document.createElement('div');
    textNode.className = 'mnm-msg-text';
    textNode.textContent = text;

    const time = document.createElement('div');
    time.className = 'mnm-msg-time';
    time.textContent = currentTime();

    bubble.appendChild(textNode);
    bubble.appendChild(time);
    msg.appendChild(bubble);
    messagesEl.appendChild(msg);

    pushHistory({ role: 'user', text: text });
    scrollMessagesToEnd();
  }

  /** Render a wrapped row of clickable Quick Reply pills. */
  function addQuickReplies(options) {
    const row = document.createElement('div');
    row.className = 'mnm-quick-replies';

    options.forEach(function (option) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mnm-quick-reply';
      btn.textContent = option.label;
      btn.addEventListener('click', function () {
        handleAction(option.action, option.label);
      });
      row.appendChild(btn);
    });

    messagesEl.appendChild(row);
    pushHistory({ role: 'options', buttons: options.map(function (o) { return o.label; }) });
    scrollMessagesToEnd();
  }

  /** Render the "✅ Got it" / "❌ Not helpful" feedback pair under an answer. */
  function addFeedbackButtons() {
    const row = document.createElement('div');
    row.className = 'mnm-actions';

    const positive = document.createElement('button');
    positive.type = 'button';
    positive.className = 'mnm-action-btn mnm-action-yes';
    positive.textContent = '✅ Got it, thanks!';
    positive.addEventListener('click', function () {
      handleAction({ type: 'positive' }, '✅ Got it, thanks!');
    });

    const negative = document.createElement('button');
    negative.type = 'button';
    negative.className = 'mnm-action-btn mnm-action-no';
    negative.textContent = '❌ Not helpful, contact support';
    negative.addEventListener('click', function () {
      handleAction({ type: 'support' }, '❌ Not helpful, contact support');
    });

    row.appendChild(positive);
    row.appendChild(negative);
    messagesEl.appendChild(row);
    scrollMessagesToEnd();
  }

  /** Fade out and lock every still-active button group. */
  function disableActiveButtonGroups() {
    const groups = messagesEl.querySelectorAll('.mnm-quick-replies:not(.mnm-used), .mnm-actions:not(.mnm-used)');
    for (let i = 0; i < groups.length; i++) groups[i].classList.add('mnm-used');
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'mnm-msg mnm-msg-bot mnm-typing';
    typing.setAttribute('aria-label', 'MNM Concierge is typing');
    typing.innerHTML =
      '<div class="mnm-msg-avatar" aria-hidden="true">M</div>' +
      '<div class="mnm-msg-bubble">' +
        '<span class="mnm-dot"></span>' +
        '<span class="mnm-dot"></span>' +
        '<span class="mnm-dot"></span>' +
      '</div>';
    messagesEl.appendChild(typing);
    scrollMessagesToEnd();
  }

  function hideTyping() {
    const typing = messagesEl.querySelector('.mnm-typing');
    if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
  }

  /* ================================================================
   * 7. CONVERSATION FLOWS
   * ================================================================ */

  /** Main menu: greeting + top-level Quick Replies. */
  function showMainMenu() {
    state.view = 'main';
    addBotText(GREETING);
    addQuickReplies(MAIN_MENU_OPTIONS);
  }

  /** Category drill-down: overview answer + sub-topic buttons. */
  function showCategory(categoryId) {
    const menu = CATEGORY_MENUS[categoryId];
    if (!menu) return showFallback();
    state.view = categoryId;
    addBotText(menu.message);
    addQuickReplies(menu.options);
  }

  /** Pre-baked FAQ answer + feedback pair. */
  function showFaqAnswer(faq) {
    state.view = 'faq:' + faq.id;
    addBotText(faq.answer);
    addFeedbackButtons();
  }

  /** Human handoff: exact fallback message + Back to Main Menu. */
  function showFallback() {
    state.view = 'fallback';
    addBotText(FALLBACK_HTML);
    addQuickReplies([
      { label: '💬 Chat on WhatsApp', action: { type: 'whatsapp' } },
      { label: '🔄 Back to Main Menu', action: { type: 'menu' } }
    ]);
  }

  /** WhatsApp path: both click-to-chat buttons, then easy ways back. */
  function showWhatsApp() {
    state.view = 'whatsapp';
    addBotText(WHATSAPP_HTML);
    addQuickReplies([
      { label: '📞 Contact Support', action: { type: 'support' } },
      { label: '🔄 Back to Main Menu', action: { type: 'menu' } }
    ]);
  }

  /** Positive feedback → cheerful close + fresh main menu. */
  function showPositive() {
    state.view = 'main';
    addBotText(THANKS_REPLY);
    addQuickReplies(MAIN_MENU_OPTIONS);
  }

  /**
   * Central dispatcher for every Quick Reply / feedback button.
   * 'menu' is navigation meta-action (no user bubble); everything else
   * echoes the button label as the user's choice first.
   */
  function handleAction(action, label) {
    if (!action || state.busy) return;
    disableActiveButtonGroups();

    if (action.type === 'menu') {
      showMainMenu();
      return;
    }

    if (label) addUserText(label);

    switch (action.type) {
      case 'category':
        showCategory(action.id);
        break;
      case 'faq': {
        const faq = action.id ? faqById(action.id) : null;
        if (faq) showFaqAnswer(faq);
        else showFallback();
        break;
      }
      case 'support':
        showFallback();
        break;
      case 'whatsapp':
        showWhatsApp();
        break;
      case 'positive':
        showPositive();
        break;
      default:
        showFallback();
    }
  }

  /**
   * Free-typed query flow: typing indicator (600ms) → keyword match →
   * pre-baked answer, or the human-handoff fallback below threshold.
   */
  function handleUserText(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed || state.busy) return;

    state.busy = true;
    disableActiveButtonGroups();
    addUserText(trimmed);
    inputEl.value = '';
    showTyping();

    setTimeout(function () {
      hideTyping();

      const tokens = tokenize(trimmed);
      if (tokens.length === 0) {
        // Greetings / small talk with no keywords: re-offer the menu.
        addBotText(NO_TOKENS_REPLY);
        addQuickReplies(MAIN_MENU_OPTIONS);
      } else {
        const match = findBestMatch(trimmed);
        if (match) showFaqAnswer(match.faq);
        else showFallback();
      }

      state.busy = false;
    }, TYPING_DELAY_MS);
  }

  /* ================================================================
   * 8. PANEL OPEN / CLOSE
   * ================================================================ */

  function openChat() {
    state.open = true;
    rootEl.classList.add('mnm-open');
    rootEl.classList.add('mnm-seen'); // stops the pulse ring + unread badge
    launcherEl.setAttribute('aria-expanded', 'true');

    if (!state.initialized) {
      state.initialized = true;
      showMainMenu();
    }
    // Wait for the open transition before stealing focus.
    setTimeout(function () {
      try { inputEl.focus(); } catch (e) { /* focus not critical */ }
    }, 300);
  }

  function closeChat() {
    state.open = false;
    rootEl.classList.remove('mnm-open');
    launcherEl.setAttribute('aria-expanded', 'false');
  }

  function toggleChat() {
    if (state.open) closeChat();
    else openChat();
  }

  /* ================================================================
   * 9. ROUTE AWARENESS — stay out of the /admin panel (SPA)
   * ================================================================ */

  function isAdminRoute() {
    return window.location.pathname.indexOf('/admin') === 0;
  }

  function syncAdminVisibility() {
    rootEl.classList.toggle('mnm-hidden', isAdminRoute());
  }

  function watchRouteChanges() {
    ['pushState', 'replaceState'].forEach(function (methodName) {
      const original = window.history[methodName].bind(window.history);
      window.history[methodName] = function () {
        const result = original.apply(window.history, arguments);
        syncAdminVisibility();
        return result;
      };
    });
    window.addEventListener('popstate', syncAdminVisibility);
    syncAdminVisibility();
  }

  /* ================================================================
   * 10. INITIALISATION
   * ================================================================ */

  function initWidget() {
    if (document.getElementById('mnm-chatbot-root')) return; // never double-mount

    rootEl = document.createElement('div');
    rootEl.id = 'mnm-chatbot-root';
    rootEl.innerHTML = WIDGET_TEMPLATE; // static markup only — safe
    document.body.appendChild(rootEl);

    launcherEl = rootEl.querySelector('.mnm-launcher');
    messagesEl = rootEl.querySelector('.mnm-messages');
    inputEl = rootEl.querySelector('.mnm-input');
    sendEl = rootEl.querySelector('.mnm-send');

    launcherEl.addEventListener('click', toggleChat);
    rootEl.querySelector('.mnm-close').addEventListener('click', closeChat);

    rootEl.querySelector('.mnm-input-row').addEventListener('submit', function (event) {
      event.preventDefault();
      handleUserText(inputEl.value);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && state.open) closeChat();
    });

    watchRouteChanges();

    // Public API, e.g. window.MNMChatbot.open() from anywhere on the site.
    window.MNMChatbot = {
      open: openChat,
      close: closeChat,
      toggle: toggleChat,
      history: function () { return state.history.slice(); }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
