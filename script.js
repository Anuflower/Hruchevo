const gallery = document.getElementById("gallery");
const filters = document.getElementById("filters");

fetch("posts.json")
  .then(res => res.json())
  .then(posts => {

    showPosts(posts);

    const tags = [...new Set(posts.flatMap(post => post.tags))];

    const allBtn = document.createElement("button");
    allBtn.innerText = "Все";
    allBtn.onclick = () => showPosts(posts);
    filters.appendChild(allBtn);

    tags.forEach(tag => {
      const btn = document.createElement("button");
      btn.innerText = "#" + tag;

      btn.onclick = () => {
        const filtered = posts.filter(post =>
          post.tags.includes(tag)
        );

        showPosts(filtered);
      };

      filters.appendChild(btn);
    });

  });

function showPosts(posts) {

  gallery.innerHTML = "";

  posts.forEach(post => {

    gallery.innerHTML += `
      <div class="card">

        <a href="${post.post}" target="_blank">

          <img src="${post.image}">

          <div class="card-title">
            ${post.title}
          </div>

        </a>

      </div>
    `;
  });

}
