// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract Blogger {
    uint internal postCount = 0;
    uint internal num_writers = 0;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Post {
        address payable owner;
        string author;
        string image;
        string title;
        string content;
        uint like;
        uint dislike;
    }
    mapping (uint => Post) internal posts;

    struct Writer {
        address payable owner;
        string name;
        string email;
        string phoneNumber;
        string dp;
        uint fee;
        string intro;
    }
    mapping (uint => Writer) internal writers;

    function createPost(
        string memory _author,
        string memory _image,
        string memory _title,
        string memory _content
    ) public {
            uint _like = 0;
            uint _dislike = 0;
        posts[postCount] = Post(
            payable(msg.sender),
            _author,
            _image,
            _title,
            _content,
            _like,
            _dislike
        );
        postCount++;
        }

    function displayPost(uint _index) public view returns (
        address payable,
        string memory,
        string memory,
        string memory,
        string memory,
        uint,
        uint
    ) {
        return (
            posts[_index].owner,
            posts[_index].author,
            posts[_index].image,
            posts[_index].title,
            posts[_index].content,
            posts[_index].like,
            posts[_index].dislike
        );
    }

    function registerWriter(
        string memory _name,
        string memory _email,
        string memory _phoneNumber,
        string memory _dp,
        uint _fee,
        string memory _intro)
    public {
        writers[num_writers] = Writer(payable(msg.sender), _name, _email, _phoneNumber, _dp, _fee, _intro);
        num_writers++;
    }

    function displayWriter(uint _index) public view returns (
        address payable, string memory, string memory, string memory, string memory, uint, string memory
        ) {
        return (
            writers[_index].owner,
            writers[_index].name,
            writers[_index].email,
            writers[_index].phoneNumber,
            writers[_index].dp,
            writers[_index].fee,
            writers[_index].intro
            );
    }

    function makeDonation(uint _index, uint _donation) public payable  {
        require(
          IERC20Token(cUsdTokenAddress).transferFrom(
            msg.sender,
            posts[_index].owner,
            _donation
          ),
          "Transfer failed."
        );
    }

    function makePayment(uint _index) public payable  {
        require(
          IERC20Token(cUsdTokenAddress).transferFrom(
            msg.sender,
            writers[_index].owner,
            writers[_index].fee
          ),
          "Transfer failed."
        );
    }

    function getNumWriters() public view returns(uint){
        return (num_writers);
    }

    function getPostCount() public view returns (uint) {
        return (postCount);
    }

}
