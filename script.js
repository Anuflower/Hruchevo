import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQ4WyGIa7yMCnovQgtc7k5fgkSKj4QcdY",
  authDomain: "hruchevo.firebaseapp.com",
  projectId: "hruchevo",
  storageBucket: "hruchevo.firebasestorage.app",
  messagingSenderId: "897207979558",
  appId: "1:897207979558:web:f7fd4dde492e35bb5f60e7",
  measurementId: "G-RCGZDKWFB4"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const tg = window.Telegram.WebApp;

tg.expand();

const user = tg.initDataUnsafe.user;

const userId = user?.id;

const ADMINS = [
  ВСТАВЬ_СЮДА_СВОЙ_ID
];

const isAdmin = ADMINS.includes(userId);

const gallery = document.getElementById("gallery");
const filters = document.getElementById("filters");
const search = document.getElementById("search");

const viewer = document.getElementById("viewer");
const viewerImage = document.getElementById("viewerImage");
const viewerTitle = document.getElementById("viewerTitle");
const viewerPost = document.getElementById("viewerPost");

const closeViewer = document.getElementById("closeViewer");

const adminToggle = document.getElementById("adminToggle");
const adminPanel = document.getElementById("adminPanel");

const savePost = document.getElementById("savePost");

if (!isAdmin) {

  adminToggle.style.display = "none";

}

let allPosts = [];

loadPosts();

async function loadPosts() {

  const q = query(
    collection(db, "posts")
  );

  const snapshot = await getDocs(q);

  allPosts = [];

  snapshot.forEach(doc => {

    allPosts.push(doc.data());

  });

  allPosts.reverse();

  renderFilters(allPosts);

  showPosts(allPosts);
}

function renderFilters(posts) {

  filters.innerHTML = "";

  const tags = [
    ...new Set(
      posts.flatMap(post => post.tags)
    )
  ];

  const allBtn = document.createElement("button");

  allBtn.innerText = "Все";

  allBtn.onclick = () => {

    showPosts(allPosts);

  };

  filters.appendChild(allBtn);

  tags.forEach(tag => {

    const btn = document.createElement("button");

    btn.innerText = "#" + tag;

    btn.onclick = () => {

      const filtered = allPosts.filter(post =>
        post.tags.includes(tag)
      );

      showPosts(filtered);
    };

    filters.appendChild(btn);
  });
}

function showPosts(posts) {

  gallery.innerHTML = "";

  posts.forEach(post => {

    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `
      <img src="${post.image}">

      <div class="card-title">
        ${post.title}
      </div>
    `;

    card.onclick = () => {

      openViewer(post);

    };

    gallery.appendChild(card);
  });
}

function openViewer(post) {

  viewer.classList.remove("hidden");

  viewerImage.src = post.image;

  viewerTitle.innerText = post.title;

  viewerPost.href = post.post;
}

closeViewer.onclick = () => {

  viewer.classList.add("hidden");

};

search.addEventListener("input", e => {

  const value = e.target.value.toLowerCase();

  const filtered = allPosts.filter(post => {

    return (
      post.title.toLowerCase().includes(value) ||
      post.tags.join(" ").toLowerCase().includes(value)
    );

  });

  showPosts(filtered);
});

adminToggle.onclick = () => {

  adminPanel.classList.toggle("hidden");

};

savePost.onclick = async () => {

  if (!isAdmin) return;

  const title = document
    .getElementById("adminTitle")
    .value;

  const image = document
    .getElementById("adminImage")
    .value;

  const tags = document
    .getElementById("adminTags")
    .value
    .split(",")
    .map(tag => tag.trim());

  const post = document
    .getElementById("adminPost")
    .value;

  const newPost = {
    title,
    image,
    tags,
    post,
    created: Date.now(),
    author: userId
  };

  await addDoc(
    collection(db, "posts"),
    newPost
  );

  adminPanel.classList.add("hidden");

  loadPosts();
};
