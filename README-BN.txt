YOUTH — 3D GLASS + AI STARTER
==============================

এই ZIP-এ আছে:
- Responsive dark glassmorphism UI, 3D floating cube/orbit, mobile layout
- Home feed, create-post UI, search, My Posts filter
- Email/password Firebase Auth এবং Firestore text posts (config করলে)
- Youth AI chat UI
- Cloudflare Worker backend template, Gemini API key server-side secret হিসেবে রাখার জন্য
- Android APK বানানোর পরবর্তী ধাপের নির্দেশনা

গুরুত্বপূর্ণ: এটা সম্পূর্ণ production social network নয়। Video upload, phone OTP, likes/comments, direct chat,
follow system, profile editing, notifications এবং admin moderation এখনও পূর্ণভাবে তৈরি হয়নি।
AI-ও deploy/config না করা পর্যন্ত কাজ করবে না। Starter-এ কোনো APK তৈরি করা নেই।

1. Firebase সেটআপ
------------------
1) https://console.firebase.google.com/ এ project তৈরি করো।
2) Project settings > Your apps > Web app যোগ করে config কপি করো।
3) firebase-config.js-এ নিজের apiKey, authDomain, projectId, appId বসাও।
4) Authentication > Sign-in method > Email/Password enable করো।
5) Firestore Database তৈরি করো।
6) firestore.rules-এর rules publish করো।
7) index.html file সরাসরি file:// দিয়ে না খুলে local server/hosting দিয়ে চালাও।

2. Website hosting
------------------
Firebase Hosting:
- Node.js LTS install
- npm install -g firebase-tools
- firebase login
- firebase init hosting
- index.html থাকা folder-কে public directory হিসেবে নির্বাচন করো
- firebase deploy --only hosting

Firebase Spark plan-এর free quotas আছে; service/usage limits বদলাতে পারে। Firebase Console-এ বর্তমান quota দেখো।

3. Youth AI চালু করা
--------------------
AI-র জন্য Cloudflare Worker deploy করতে হবে এবং Gemini API key তৈরি করতে হবে।
কোনো API key কখনো app.js বা HTML-এ রেখো না।

A) Cloudflare dashboard: https://dash.cloudflare.com/
B) Workers & Pages > Create > Worker; cloudflare-worker/worker.js-এর code বসাও।
C) Worker Settings > Variables and Secrets-এ GEMINI_API_KEY নামে secret যোগ করো।
   Value হিসেবে Google AI Studio থেকে পাওয়া API key দাও।
D) ALLOWED_ORIGIN variable-এ তোমার deployed site origin দাও, যেমন https://your-site.pages.dev
   Local test করলে সাময়িকভাবে * ব্যবহার করা যায়; public launch-এ নির্দিষ্ট origin ব্যবহার করো।
E) Deploy করার পর Worker URL হবে, উদাহরণ: https://your-worker.workers.dev/api/chat
F) app.js-এ এই লাইন খুঁজে:
   const endpoint=window.YOUTH_AI_ENDPOINT||"";
   এর বদলে Worker URL বসাও:
   const endpoint="https://YOUR-WORKER.workers.dev/api/chat";
   Save করে website redeploy করো।

AI provider-এ free quota/availability বদলাতে পারে; API key ও quota সেটিংস নিজে যাচাই করো।
Worker-এ rate limiting/authentication যোগ না করে public launch করো না, কারণ অন্যরা endpoint ব্যবহার করে quota শেষ করতে পারে।

4. Android APK
---------------
প্রথমে website deploy ও test করো। APK তৈরির জন্য computer-এ Node.js, Android Studio ও Android SDK লাগতে পারে।
Capacitor official guide: https://capacitorjs.com/docs/getting-started
Official guide অনুযায়ী project-এ Capacitor setup, Android platform add, sync করে Android Studio-তে APK build করো।
এই ZIP-এ prebuilt APK নেই।

5. Production safety checklist
------------------------------
- Strong Firestore security rules; user ownership checks and validation
- AI Worker rate limiting and abuse protection
- User reporting/blocking/moderation, account deletion, privacy policy
- Secure image/video storage and upload limits
- Do not collect or expose private personal information
- Test on Android and multiple screen sizes before public launch


6. মোবাইল দিয়ে APK করার সহজ পথ (PWA Builder)
--------------------------------------------
এই ZIP-এ manifest.webmanifest, service-worker.js ও 192/512 PNG icon যোগ করা হয়েছে।
তবুও আগে HTTPS-এ website deploy করতে হবে; PWABuilder local ZIP থেকে সরাসরি APK বানায় না।

A) GitHub-এ sign in করে নতুন public repository তৈরি করো (যেমন youth-social).
B) ZIP extract করে ভেতরের Youth_3D_Glass_AI ফোল্ডারের সব ফাইল repository root-এ upload করো।
   index.html অবশ্যই repository root-এ থাকবে; cloudflare-worker/ এবং icons/ folder-ও upload করো।
C) Repository Settings > Pages > Build and deployment-এ Deploy from a branch নির্বাচন করো।
   Branch main, folder /(root) নির্বাচন করে Save করো।
D) GitHub Pages URL তৈরি হলে Chrome-এ খোলো; HTTPS কাজ করছে এবং page ঠিক দেখাচ্ছে নিশ্চিত করো।
E) https://www.pwabuilder.com/ খোলো, website URL দাও, তারপর Package for stores > Android > Generate Package।
F) Testing-এর জন্য APK পাওয়া গেলে ডাউনলোড করে Android-এ ইনস্টল করো। Android-এ unknown apps install prompt এলে
   শুধু নিজের তৈরি/বিশ্বাসযোগ্য ফাইলের জন্যই অনুমতি দেবে।
G) PWABuilder-এর build result-এ যদি manifest/service worker/HTTPS সংক্রান্ত warning থাকে, আগে ঠিক করো।

মনে রেখো: PWABuilder-এর Android packaging-এর জন্য valid PWA ও HTTPS site লাগে।
APK তৈরি হওয়া মানেই Firebase/AI configured বা production-ready হওয়া নয়।
