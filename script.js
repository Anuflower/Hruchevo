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

const closeViewer =
  document.getElementById("closeViewer");

const adminToggle =
  document.getElementById("adminToggle");

const adminPanel =
  document.getElementById("adminPanel");

const closeAdmin =
  document.getElementById("closeAdmin");

const savePost =
  document.getElementById("savePost");

const cancelEdit =
  document.getElementById("cancelEdit");

const adminTitle =
  document.getElementById("adminTitle");

const adminActions =
  document.getElementById("adminActions");

const editPostBtn =
  document.getElementById("editPost");

const deletePostBtn =
  document.getElementById("deletePost");

if (!isAdmin) {
  adminToggle.style.display = "none";
}

let allPosts = [];
let activeTags = [];

let currentPost = null;
let editingPostId = null;

loadPosts();

async function loadPosts() {

  try {

    const q = query(
      collection(db, "posts")
    );

    const snapshot = await getDocs(q);

    allPosts = [];

    snapshot.forEach(docSnap => {

      allPosts.push({
        id: docSnap.id,
        ...docSnap.data()
      });

    });

    allPosts.sort(
      (a, b) =>
        (b.created || 0) -
        (a.created || 0)
    );

    renderFilters();

    filterPosts();

  } catch (error) {

    console.error(error);

  }
}

function renderFilters() {

  filters.innerHTML = "";

  const tags = [
    ...new Set(
      allPosts.flatMap(
        post => post.tags || []
      )
    )
  ];

  tags.sort();

  tags.forEach(tag => {

    const btn =
      document.createElement("button");

    btn.className = "filter-btn";

    if (activeTags.includes(tag)) {
      btn.classList.add("active");
    }

    btn.innerText = "#" + tag;

    btn.onclick = () => {

      if (activeTags.includes(tag)) {

        activeTags =
          activeTags.filter(
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

  const filtered =
    allPosts.filter(post => {

      return activeTags.every(tag =>
        post.tags?.includes(tag)
      );

    });

  showPosts(filtered);
}

function showPosts(posts) {

  gallery.innerHTML = "";

  posts.forEach(post => {

    const card =
      document.createElement("div");

    card.className = "card";

    card.innerHTML = `
      <img src="${post.image}">
    `;

    card.onclick = () =>
      openViewer(post);

    gallery.appendChild(card);

  });
}

function openViewer(post) {

  currentPost = post;

  viewer.classList.remove("hidden");

  viewerImage.src =
    post.image || "";

  viewerDate.innerText =
    post.date || "";

  viewerDescription.innerText =
    post.description || "";

  viewerPost.href =
    post.post || "#";

  viewerTags.innerHTML = "";

  (post.tags || []).forEach(tag => {

    const tagEl =
      document.createElement("div");

    tagEl.className =
      "viewer-tag";

    tagEl.innerText =
      "#" + tag;

    viewerTags.appendChild(tagEl);

  });

  if (isAdmin) {

    adminActions.classList.remove(
      "hidden"
    );

  }
}

function clearForm() {

  document.getElementById(
    "adminImage"
  ).value = "";

  document.getElementById(
    "adminDate"
  ).value = "";

  document.getElementById(
    "adminTags"
  ).value = "";

  document.getElementById(
    "adminDescription"
  ).value = "";

  document.getElementById(
    "adminPost"
  ).value = "";

  editingPostId = null;

  adminTitle.innerText =
    "Добавить пост";
}

closeViewer.onclick = () => {

  viewer.classList.add("hidden");

};

adminToggle.onclick = () => {

  clearForm();

  adminPanel.classList.remove(
    "hidden"
  );

};

closeAdmin.onclick = () => {

  adminPanel.classList.add(
    "hidden"
  );

};

cancelEdit.onclick = () => {

  clearForm();

  adminPanel.classList.add(
    "hidden"
  );

};

savePost.onclick = async () => {

  if (!isAdmin) return;

  const image =
    document.getElementById(
      "adminImage"
    ).value.trim();

  const date =
    document.getElementById(
      "adminDate"
    ).value.trim();

  const tags =
    document.getElementById(
      "adminTags"
    ).value
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);

  const description =
    document.getElementById(
      "adminDescription"
    ).value.trim();

  const post =
    document.getElementById(
      "adminPost"
    ).value.trim();

  const data = {
    image,
    date,
    tags,
    description,
    post,
    author: userId,
    created: Date.now()
  };

  try {

    if (editingPostId) {

      await updateDoc(
        doc(
          db,
          "posts",
          editingPostId
        ),
        data
      );

    } else {

      await addDoc(
        collection(db, "posts"),
        data
      );

    }

    clearForm();

    adminPanel.classList.add(
      "hidden"
    );

    loadPosts();

  } catch (error) {

    console.error(error);

  }
};

editPostBtn.onclick = () => {

  if (!currentPost) return;

  editingPostId =
    currentPost.id;

  document.getElementById(
    "adminImage"
  ).value =
    currentPost.image || "";

  document.getElementById(
    "adminDate"
  ).value =
    currentPost.date || "";

  document.getElementById(
    "adminTags"
  ).value =
    (currentPost.tags || [])
      .join(", ");

  document.getElementById(
    "adminDescription"
  ).value =
    currentPost.description || "";

  document.getElementById(
    "adminPost"
  ).value =
    currentPost.post || "";

  adminTitle.innerText =
    "Редактировать пост";

  viewer.classList.add(
    "hidden"
  );

  adminPanel.classList.remove(
    "hidden"
  );
};

deletePostBtn.onclick =
async () => {

  if (!currentPost) return;

  const ok = confirm(
    "Удалить этот пост?"
  );

  if (!ok) return;

  try {

    await deleteDoc(
      doc(
        db,
        "posts",
        currentPost.id
      )
    );

    viewer.classList.add(
      "hidden"
    );

    loadPosts();

  } catch (error) {

    console.error(error);

  }
};
