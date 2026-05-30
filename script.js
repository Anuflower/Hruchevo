import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  updateDoc,
  deleteDoc,
  doc
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

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.expand();
}

const user = tg?.initDataUnsafe?.user;

const userId = user?.id;

const ADMINS = [
  940931806
];

const isAdmin = ADMINS.includes(userId);

const gallery = document.getElementById("gallery");
const filters = document.getElementById("filters");

const viewer = document.getElementById("viewer");
const viewerImage = document.getElementById("viewerImage");
const viewerDate = document.getElementById("viewerDate");
const viewerTags = document.getElementById("viewerTags");
const viewerDescription = document.getElementById("viewerDescription");
const viewerPost = document.getElementById("viewerPost");

const closeViewer = document.getElementById("closeViewer");

const adminToggle = document.getElementById("adminToggle");
const adminPanel = document.getElementById("adminPanel");

const closeAdmin = document.getElementById("closeAdmin");

const savePost = document.getElementById("savePost");

if (!isAdmin) {

  adminToggle.style.display = "none";

}

let allPosts = [];

let activeTags = [];

loadPosts();

async function loadPosts() {

  try {

    const q = query(
      collection(db, "posts")
    );

    const snapshot = await getDocs(q);

    allPosts = [];

    snapshot.forEach(doc => {

      allPosts.push({
        id: doc.id,
        ...doc.data()
      });

    });

    allPosts.reverse();

    renderFilters();

    showPosts(allPosts);

  } catch (error) {

    console.error(error);

  }
}

function renderFilters() {

  filters.innerHTML = "";

  const tags = [
    ...new Set(
      allPosts.flatMap(post => post.tags || [])
    )
  ];

  tags.forEach(tag => {

    const btn = document.createElement("button");

    btn.className = "filter-btn";

    btn.innerText = "#" + tag;

    if (activeTags.includes(tag)) {
      btn.classList.add("active");
    }

    btn.onclick = () => {

      if (activeTags.includes(tag)) {

        activeTags = activeTags.filter(
          t => t !== tag
        );

      } else {

        activeTags.push(tag);

      }

      renderFilters();

      filterPosts();
    };

    filters.appendChild(btn);
  });
}

function filterPosts() {

  if (activeTags.length === 0) {

    showPosts(allPosts);

    return;
  }

  const filtered = allPosts.filter(post => {

    return activeTags.every(tag =>
      post.tags?.includes(tag)
    );

  });

  showPosts(filtered);
}

function showPosts(posts) {

  gallery.innerHTML = "";

  posts.forEach(post => {

    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `
      <img src="${post.image}">
    `;

    card.onclick = () => {

      openViewer(post);

    };

    gallery.appendChild(card);
  });
}

function openViewer(post) {

  viewer.classList.remove("hidden");

  viewerImage.src = post.image || "";

  viewerDate.innerText = post.date || "";

  viewerDescription.innerText =
    post.description || "";

  viewerPost.href = post.post || "#";

  viewerTags.innerHTML = "";

  (post.tags || []).forEach(tag => {

    const tagEl = document.createElement("div");

    tagEl.className = "viewer-tag";

    tagEl.innerText = "#" + tag;

    viewerTags.appendChild(tagEl);

  });
}

closeViewer.onclick = () => {

  viewer.classList.add("hidden");

};

adminToggle.onclick = () => {

  adminPanel.classList.remove("hidden");

};

closeAdmin.onclick = () => {

  adminPanel.classList.add("hidden");

};

savePost.onclick = async () => {

  if (!isAdmin) return;

  const image = document
    .getElementById("adminImage")
    .value;

  const date = document
    .getElementById("adminDate")
    .value;

  const tags = document
    .getElementById("adminTags")
    .value
    .split(",")
    .map(tag => tag.trim());

  const description = document
    .getElementById("adminDescription")
    .value;

  const post = document
    .getElementById("adminPost")
    .value;

  const newPost = {
    image,
    date,
    tags,
    description,
    post,
    created: Date.now(),
    author: userId
  };

  try {

    await addDoc(
      collection(db, "posts"),
      newPost
    );

    adminPanel.classList.add("hidden");

    loadPosts();

  } catch (error) {

    console.error(error);

  }
};
