import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import bloggerAbi from "../contract/blogger.abi.json"
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18
const BloggerContractAddress = "0xebb98e3e81d576b740E4797A0e1e38b1fE3316a1"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let posts = []
let writers = []

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(bloggerAbi, BloggerContractAddress)

    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function approve(_amount) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(BloggerContractAddress, _amount)
    .send({ from: kit.defaultAccount })
  return result
}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

// Get and Display Posts
const getPosts = async function() {
  const _postCount = await contract.methods.getPostCount().call()
  const _posts = []

for (let i = 0; i < _postCount; i++) {
    let _post = new Promise(async (resolve, reject) => {
      let p = await contract.methods.displayPost(i).call()
      resolve({
        index: i,
        owner: p[0],
        author: p[1],
        image: p[2],
        title: p[3],
        content: p[4],
        like: p[6],
        dislike: p[7]
      })
    })
    _posts.push(_post)
  }
  posts = await Promise.all(_posts)
  renderPosts()
}

// Create Post
document
  .querySelector("#newPostBtn")
  .addEventListener("click", async (e) => {
    const params = [
      document.getElementById("newBlogAuthor").value,
      document.getElementById("newBlogImage").value,
      document.getElementById("newBlogTitle").value,
      document.getElementById("newBlogContent").value,
    ]
    notification(`⌛ Adding "${params[0]}"...`)


  try {
    const result = await contract.methods
      .createPost(...params)
      .send({ from: kit.defaultAccount })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
  notification(`🎉 You successfully added "${params[0]}".`)
  getPosts()
  })

window.addEventListener('load', async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getPosts()
  await getWriters()
  notificationOff()
});

// Display Posts
function renderPosts() {
  document.getElementById("myblog").innerHTML = ""
  posts.forEach((_post) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-lg-4 col-md-12 mb-4 py-3"
    newDiv.innerHTML = productTemplate(_post)
    document.getElementById("myblog").appendChild(newDiv)
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
      <div class="post-category">
        ${identiconTemplate(_post.owner)}
        </div>
      <h5 class="card-title">${_post.title}</h5>
      <p class="card-text">
        ${_post.author}
      </p>
      <a class="btn btn-primary m-2" data-toggle="modal" data-target="#read-${_post.index}">Read</a>
    </div>
  </div>


  <!-- Modal -->
  <div class="modal fade" id="read-${_post.index}" tabindex="-1" role="dialog" aria-labelledby="readLabel" aria-hidden="true">
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
          <input name="donationAmt" type="text" class="form-control" id="donationAmt" placeholder="Amount" style="width: 20%; height: min-content;">&nbsp;cUSD &nbsp;
          <button type="button" class="btn btn-primary donate" id=${_post.index}>Donate</button>
        </div>
      </div>
    </div>
  </div>
`
}

// var clickse = 4;
//
// document.querySelector("#clicks").textContent = clickse;

// $('.like-counter').click(function() {
//   clicks += 1;
//   document.getElementById("clicks").innerHTML = clicks;
//   $('.like-counter').addClass("liked");
// });

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
  renderWriters()
  notificationOff()
})


//Make Donation

// document.querySelector("#donationAmt").addEventListener("click", async(e) =>)
document.querySelector("#myblog").addEventListener("click", async (e) => {

  if (e.target.className.includes("donate")){
    const index = e.target.id
    // console.log(index);
    // var amount = document.getElementById("donationAmt").value
    let amount = new BigNumber(document.getElementById("donationAmt").value).shiftedBy(ERC20_DECIMALS)
    // console.log(amount)
    notification("⌛ Waiting for transaction approval...")
    try {
      await approve(amount)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting donation`)
    try {
      const result = await contract.methods
        .makeDonation(index, amount)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You have successfully completed your donation.`)
      getBalance()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
}
})

// Display Writers
const getWriters = async function() {
  const _numWriters = await contract.methods.getNumWriters().call()
  const _writers = []

for (let i = 0; i < _numWriters; i++) {
    let _writer = new Promise(async (resolve, reject) => {
      let w = await contract.methods.displayWriter(i).call()
      resolve({
        index: i,
        owner: w[0],
        name: w[1],
        email: w[2],
        phoneNumber: w[3],
        dp: w[4],
        fee: w[5],
        intro: w[6]
      })
    })
    _writers.push(_writer)
  }
  writers = await Promise.all(_writers)
  renderWriters()
}

// Register Writers
document
  .querySelector("#newWriterBtn")
  .addEventListener("click", async (e) => {
    const params_ = [
      document.getElementById("writerName").value,
      document.getElementById("writerEmail").value,
      document.getElementById("writerPhone").value,
      document.getElementById("writerDp").value,
      document.getElementById("writerFee").value,
      document.getElementById("writerStack").value,
    ]
    notification(`⌛ Adding "${params_[0]}"...`)


  try {
    const result = await contract.methods
      .registerWriter(...params_)
      .send({ from: kit.defaultAccount })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
  notification(`🎉 You successfully added "${params_[0]}".`)
  getWriters()
  })

  // Writer Template
  function renderWriters() {
    document.getElementById("indwriter").innerHTML = ""
    writers.forEach((_writer) => {
      const newDiv = document.createElement("div")
      newDiv.className = "col-md-6 col-lg-4 py-3 wow zoomIn"
      newDiv.innerHTML = writerTemplate(_writer)
      document.getElementById("indwriter").appendChild(newDiv)
    })
  }

  function writerTemplate(_writer) {
    return `
    <div class="card-doctor">
          <div class="header">
              <img src="${_writer.dp}" alt="">
                  <div class="meta">
                    <a href="mailto:${_writer.email}"><span class="mai-mail"></span></a>
                    <a href="https://wa.me/${_writer.phoneNumber}"><span class="mai-logo-whatsapp"></span></a>
                  </div>
                </div>
                <div class="body">
                <div class="post-category">
                  ${identiconTemplate(_writer.owner)}
                  </div>
                  <p class="text-xl mb-0">${_writer.name}</p>
                  <span class="text-sm text-grey">Stack: ${_writer.intro}</span><br>
                  <span class="text-sm text-grey"> Fee: ${_writer.fee} cUSD
                  <a class="btn btn-sm btn-outline-dark text-sm text-grey hireBtn" style="float: right" id=${_writer.index}>Hire</a></span>
                </div>
        </div>
    `
  }

  // Hire Writer
  document.querySelector("#writer").addEventListener("click", async (e) => {
  if (e.target.className.includes("hireBtn")) {
    const index = e.target.id
    notification("⌛ Waiting for payment approval...")
    try {
      await approve(writers[index].fee)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting payment to hire "${writers[index].name}"...`)
    try {
      const result = await contract.methods
        .makePayment(index)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You successfully hired "${writers[index].name}".`)
      getBalance()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  }
})

// tooltip
$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});
