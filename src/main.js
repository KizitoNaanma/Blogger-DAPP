import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import bloggerAbi from "../contract/blogger.abi.json"
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18
const BloggerContractAddress = "0xF4D8ab92115F716D11Df36f56De33b9665387d67"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let posts = []

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

document
  .querySelector("#newPostBtn")
  .addEventListener("click", async (e) => {
    const params = [
      document.getElementById("newBlogTitle").value,
      document.getElementById("newBlogImage").value,
      document.getElementById("newBlogAuthor").value,
      document.getElementById("newBlogContent").value,
      // new BigNumber(document.getElementById("newPrice").value)
      // .shiftedBy(ERC20_DECIMALS)
      // .toString()
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
  notificationOff()
});


function renderPosts() {
  document.getElementById("myblog").innerHTML = ""
  posts.forEach((_post) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-lg-4 col-md-12 mb-4"
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
    <div class="translate-middle-y position-absolute top-0">
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
          <input type="text" class="form-control" id="donationAmt" placeholder="Amount" style="width: 20%; height: min-content;">&nbsp;cUSD &nbsp;
          <button type="button" class="btn btn-primary donate">Donate</button>
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


// document.querySelector("#myblog").addEventListener("click", (e) => {
//   if(e.target.className.includes("donate")) {
//     const index = e.target.id
//     products[index].sold++
//     notification(`🎉 You successfully bought "${products[index].name}".`)
//     renderProducts()
//   }
// })
// document.querySelector("#donationAmt").addEventListener("click", async(e) =>)
document.querySelector("#myblog").addEventListener("click", async (e) => {

  if (e.target.className.includes("donate")){
    const index = e.target.id
    console.log(index);

    amount = new BigNumber(document.getElementById("donationAmt").value).shiftedBy(ERC20_DECIMALS)
    notification("⌛ Waiting for transaction approval...")
    try {
      await approve(amount)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting donation for "${events.eventTitle}"...`)
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
