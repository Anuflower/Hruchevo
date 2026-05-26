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

let allPosts = [];

fetch("posts.json")
  .then(res => res.json())
  .then(posts => {

    const localPosts = JSON.parse(
      localStorage.getItem("customPosts") || "[]"
    );

    allPosts = [...localPosts, ...posts];

    renderFilters(allPosts);
    showPosts(allPosts);
  });

function renderFilters(posts) {

  filters.innerHTML = "";

  const tags = [...new Set(posts.flatMap(post => post.tags))];

  const allBtn = document.createElement("button");

  allBtn.innerText = "Все";

  allBtn.onclick = () => showPosts(allPosts);
  
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

    card.onclick = () => openViewer(post);

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

savePost.onclick = () => {

  const title = document.getElementById("adminTitle").value;

  const image = document.getElementById("adminImage").value;

  const tags = document
    .getElementById("adminTags")
    .value
    .split(",")
    .map(tag => tag.trim());

  const post = document.getElementById("adminPost").value;

  const newPost = {
    title,
    image,
    tags,
    post
  };

  const localPosts = JSON.parse(
    localStorage.getItem("customPosts") || "[]"
  );

  localPosts.unshift(newPost);

  localStorage.setItem(
    "customPosts",
    JSON.stringify(localPosts)
  );
  
  allPosts.unshift(newPost);

  renderFilters(allPosts);
  showPosts(allPosts);

  adminPanel.classList.add("hidden");
};
