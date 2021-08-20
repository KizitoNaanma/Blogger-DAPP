const posts = [
  {
    author: "Tony Stark",
    title: "Giant BBQ",
    image: "https://mdbootstrap.com/img/new/standard/nature/184.jpg",
    content: `Grilled chicken, beef, fish, sausages, bacon,
      vegetables served with chips.`,
    owner: "0x32Be343B94f860124dC4fEe278FDCBD38C102D88",
    like: 3,
    dislike: 27,
    index: 0,
  },
  {
    author: "Chris Evans",
    title: "BBQ Chicken",
    image: "https://mdbootstrap.com/img/new/standard/nature/023.jpg",
    content: `French fries and grilled chicken served with gacumbari
      and avocados with cheese.`,
    owner: "0x3275B7F400cCdeBeDaf0D8A9a7C8C1aBE2d747Ea",
    like: 4,
    dislike: 12,
    index: 1,
  },
  {
    author: "Thanos",
    title: "Beef burrito",
    image: "https://mdbootstrap.com/img/new/standard/nature/024.jpg",
    content: `Homemade tortilla with your choice of filling, cheese,
      guacamole salsa with Mexican refried beans and rice.`,
    owner: "0x2EF48F32eB0AEB90778A2170a0558A941b72BFFb",
    like: 2,
    dislike: 35,
    index: 2,
  }
]

const getBalance = function () {
  document.querySelector("#balance").textContent = 21
}

function renderPosts() {
  document.getElementById("marketplace").innerHTML = ""
  posts.forEach((_post) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-lg-4 col-md-12 mb-4"
    newDiv.innerHTML = productTemplate(_post)
    document.getElementById("marketplace").appendChild(newDiv)
  })
}

function productTemplate(_post) {
  return `
  <div class="card">
    <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
      <img src="${_post.image}" class="img-fluid" />
      <a href="#!">
        <div class="mask" style="background-color: rgba(251, 251, 251, 0.15);"></div>
      </a>
    </div>
    <div class="card-body">
    <div class="translate-middle-y position-absolute top-0">
        ${identiconTemplate(_post.owner)}
        </div>
      <h5 class="card-title">${_post.author}</h5>
      <p class="card-text">
        ${_post.title}
      </p>
      <a class="btn btn-primary m-2" data-toggle="modal" data-target="#read">Read</a>
    </div>
  </div>


  <!-- Modal -->
  <div class="modal fade" id="read" tabindex="-1" role="dialog" aria-labelledby="readLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="readLabel">${_post.title}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          ${_post.content}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary">Save changes</button>
        </div>
      </div>
    </div>
  </div>
`
}
function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", () => {
  notification("⌛ Loading...")
  getBalance()
  renderPosts()
  notificationOff()
})
document
  .querySelector("#newPostBtn")
  .addEventListener("click", () => {
    const _post = {
      owner: "0x2EF48F32eB0AEB90778A2170a0558A941b72BFFb",
      title: document.getElementById("newBlogTitle").value,
      author: document.getElementById("newBlogAuthor").value,
      image: document.getElementById("newBlogImage").value,
      content: document.getElementById("newBlogContent").value,
      index: posts.length,
    }
    posts.push(_post)
    notification(`🎉 You successfully added "${_post.title}".`)
    renderPosts()
  })
