import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = id => document.getElementById(id);
$("year").textContent = new Date().getFullYear();
const configured = firebaseConfig.apiKey !== "PASTE_YOUR_FIREBASE_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID" && firebaseConfig.appId !== "PASTE_YOUR_APP_ID";
let auth = null, db = null, currentUser = null, allPosts = [];
const demoPosts = [{author:"Youth Team",text:"Welcome to Youth — a fresh place for your thoughts, stories, and community. ✨",date:"Pinned · Demo",uid:"demo"}];

function toast(message){const t=$("toast");t.textContent=message;t.classList.remove("hidden");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.add("hidden"),2800)}
function setMessage(message,error=false){$("message").textContent=message;$("message").style.color=error?"#ff9ab2":"#8ef0bd"}
function authMessage(message,error=false){$("auth-message").textContent=message;$("auth-message").style.color=error?"#ff9ab2":"#8ef0bd"}
function escapeRender(posts){
 const list=$("feed-list");list.replaceChildren();
 if(!posts.length){const e=document.createElement("article");e.className="post-card glass";e.textContent="No posts found. Be the first to share a moment.";list.append(e);return}
 for(const p of posts){
  const card=document.createElement("article");card.className="post-card glass";
  const head=document.createElement("div");head.className="post-author-row";
  const avatar=document.createElement("div");avatar.className="avatar avatar-gradient";avatar.textContent=(p.author||"Y").trim().charAt(0).toUpperCase();
  const meta=document.createElement("div");const name=document.createElement("strong");name.textContent=p.author||"Youth user";const date=document.createElement("span");date.textContent=p.date||(p.createdAt?.toDate?p.createdAt.toDate().toLocaleString():"Just now");meta.append(name,date);
  const menu=document.createElement("span");menu.className="post-menu";menu.textContent="•••";head.append(avatar,meta,menu);
  const body=document.createElement("p");body.textContent=p.text||"";
  const actions=document.createElement("div");actions.className="post-actions";
  for(const label of ["♡ Like","◯ Comment","↗ Share"]){const b=document.createElement("button");b.textContent=label;b.disabled=true;b.title="This feature will be connected in a later build";actions.append(b)}
  card.append(head,body,actions);list.append(card)
 }
}
function refreshFeed(){
 const q=$("search-input").value.trim().toLowerCase(), mine=document.querySelector('.filter.active')?.dataset.filter==="mine";
 let filtered=allPosts.filter(p=>(!q||(`${p.author||""} ${p.text||""}`).toLowerCase().includes(q))&&(!mine||(currentUser&&p.uid===currentUser.uid)));
 escapeRender(filtered)
}
function setAuth(user){
 currentUser=user;
 $("sidebar-name").textContent=user?(user.email?.split("@")[0]||"Youth member"):"Welcome to Youth";
 $("sidebar-email").textContent=user?user.email:"Your people. Your world.";
 $("composer-avatar").textContent=user?(user.email?.[0]||"Y").toUpperCase():"Y";
 $("profile-info").textContent=user?`Signed in as ${user.email}. Profile editing will be added in a future version.`:"Sign in to show your account details here.";
 $("logout-btn").classList.toggle("hidden",!user);
 refreshFeed()
}
if(configured){
 const app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);
 onAuthStateChanged(auth,setAuth);
 const q=query(collection(db,"posts"),orderBy("createdAt","desc"),limit(80));
 onSnapshot(q,s=>{allPosts=s.docs.map(d=>({id:d.id,...d.data()}));refreshFeed()},e=>{console.error(e);setMessage("Couldn't load posts. Check Firestore setup and rules.",true)});
 $("auth-form").addEventListener("submit",async e=>{e.preventDefault();try{await createUserWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);authMessage("Account created.");toast("Welcome to Youth!")}catch(err){authMessage(err.message,true)}});
 $("login-btn").addEventListener("click",async()=>{try{await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);authMessage("Logged in successfully.");toast("Welcome back!")}catch(err){authMessage(err.message,true)}});
 $("logout-btn").addEventListener("click",async()=>{try{await signOut(auth);authMessage("Logged out.")}catch(err){authMessage(err.message,true)}});
 $("post-form").addEventListener("submit",async e=>{e.preventDefault();const text=$("post-text").value.trim();if(!currentUser){setMessage("Open My Profile and sign in before posting.",true);return}if(!text)return;try{await addDoc(collection(db,"posts"),{text,author:currentUser.email?.split("@")[0]||"Youth member",uid:currentUser.uid,createdAt:serverTimestamp()});$("post-text").value="";setMessage("Your moment is live.");}catch(err){console.error(err);setMessage("Post failed. Check Firestore Rules.",true)}});
}else{
 allPosts=demoPosts;escapeRender(allPosts);setAuth(null);
 $("auth-message").textContent="Add Firebase settings to enable real accounts.";
 $("auth-message").style.color="#ff9ab2";
 $("post-form").addEventListener("submit",e=>{e.preventDefault();toast("Connect Firebase to publish live posts.")});
 $("login-btn").addEventListener("click",()=>toast("Add Firebase config to enable login."));
 $("logout-btn").addEventListener("click",()=>{});
}
$("search-input").addEventListener("input",refreshFeed);
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));refreshFeed()}));

const viewSections={home:["hero","composer","feed-heading","feed-list"],shorts:["shorts-view"],explore:["explore-view"],messages:["messages-view"],profile:["profile-view"]};
function showView(view){
 for(const id of ["hero","composer","feed-heading","feed-list","shorts-view","explore-view","messages-view","profile-view"])$(id).classList.add("hidden");
 (viewSections[view]||viewSections.home).forEach(id=>$(id).classList.remove("hidden"));
 document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
 const titles={home:"The latest moments",shorts:"Youth Shorts",explore:"Explore Youth",messages:"Messages",profile:"My Profile"};
 $("view-title").innerHTML=(titles[view]||titles.home).replace("moments",'<span>moments</span>');
 if(view==="profile")document.querySelector(".main-column").scrollIntoView({behavior:"smooth",block:"start"});
}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
$("hero-post").addEventListener("click",()=>{$("composer").scrollIntoView({behavior:"smooth",block:"center"});$("post-text").focus()});

const modal=$("ai-modal"),log=$("chat-log");
function openAI(){modal.classList.remove("hidden");$("ai-input").focus()}
function closeAI(){modal.classList.add("hidden")}
["ai-open-top","ai-open-side","ai-open-card","hero-ai","mobile-ai"].forEach(id=>$(id).addEventListener("click",openAI));
$("ai-close").addEventListener("click",closeAI);$("ai-close-backdrop").addEventListener("click",closeAI);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAI()});
$("mobile-create").addEventListener("click",()=>{showView("home");$("composer").scrollIntoView({behavior:"smooth",block:"center"});$("post-text").focus()});
function addBubble(text,role){const b=document.createElement("div");b.className=`chat-bubble ${role}`;if(role==="assistant"){const label=document.createElement("span");label.className="bubble-label";label.textContent="YOUTH AI";b.append(label)}b.append(document.createTextNode(text));log.append(b);log.scrollTop=log.scrollHeight;return b}
async function askAI(message){
 addBubble(message,"user");const loading=addBubble("Thinking…","assistant");$("ai-input").value="";$("ai-input").disabled=true;
 try{
  const endpoint=window.YOUTH_AI_ENDPOINT||"";
  if(!endpoint){loading.textContent="AI backend isn't connected yet. To enable real AI, deploy the Cloudflare Worker in the ZIP and set YOUTH_AI_ENDPOINT in app.js to your Worker URL. For now, I can still help you plan prompts and features once the AI service is connected.";return}
  const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,history:[...log.querySelectorAll(".chat-bubble")].slice(-8).map(el=>({role:el.classList.contains("user")?"user":"assistant",text:el.innerText.replace(/^YOUTH AI\\s*/,"")}))})});
  if(!response.ok)throw new Error(`AI service returned ${response.status}`);
  const data=await response.json();loading.textContent=data.reply||"I couldn't generate a reply. Try again.";
 }catch(e){loading.textContent="I couldn't reach Youth AI. Check the Worker URL, internet connection, and AI API key.";console.error(e)}
 finally{$("ai-input").disabled=false;$("ai-input").focus();log.scrollTop=log.scrollHeight}
}
$("ai-form").addEventListener("submit",async e=>{e.preventDefault();const m=$("ai-input").value.trim();if(m)await askAI(m)});
document.querySelectorAll(".ai-suggestions button").forEach(b=>b.addEventListener("click",()=>{$("ai-input").value=({ "Write a caption":"Write a cool, original social media caption about", "Give me ideas":"Give me 5 creative ideas for a social media post about", "Explain something":"Explain this in simple words:"})[b.textContent]||b.textContent;$("ai-input").focus()}));
