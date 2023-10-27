import React, { Component } from "react";
import Web3 from "web3";
import { doc, getDoc, setDoc, collection, updateDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import {
  APP_ABI,
  APP_ADDRESS,
  BOOKFACTORY_ABI,
  BOOKFACTORY_ADDRESS,
} from "./config";
import "./App.css";
class App extends Component {
  componentWillMount() {
    this.loadBlockchainData();
  }

  async loadBlockchainData() {
    const web3 = new Web3("http://localhost:8545");
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const bookFactory = new web3.eth.Contract(
      BOOKFACTORY_ABI,
      BOOKFACTORY_ADDRESS
    );

    this.setState({ bookFactory });
    const numBooks = await bookFactory.methods.numBooks().call();
    console.log(numBooks)
    this.setState({ numBooks });
    for (var i = 0; i < numBooks; i++) {
      const book = await bookFactory.methods.books(i).call();
      const docRef = doc(db, "Books", String(i));
      const docSnap = await getDoc(docRef);
      const found = docSnap.data();
      if (docSnap.exists()) {
        this.setState({
          books: [
            ...this.state.books,
            {
              address: book,
              bookId: found.bookId,
              bookPrice: found.bookPrice,
              bookTitle: found.bookTitle,
              forSale: String(found.forSale),
              bookAuthor: found.bookAuthor,
              ownerAddress: found.ownerAddress,
              content: found.bookContent,
            },
          ],
        });
      }
    }
    const numBooksReadOnly = await bookFactory.methods
      .numBooksReadOnly()
      .call();
    this.setState({ numBooksReadOnly });
    for (i = 0; i < numBooksReadOnly; i++) {
      const book = await bookFactory.methods.booksReadOnly(i).call();
      const docRef = doc(db, "BooksReadOnly", String(i));
      const docSnap = await getDoc(docRef);
      const found = docSnap.data();
      if (docSnap.exists() && found.ownerAddress == this.state.account) {
        this.setState({
          booksReadOnly: [
            ...this.state.booksReadOnly,
            {
              address: book,
              bookId: found.bookId,
              bookTitle: found.bookTitle,
              bookAuthor: found.bookAuthor,
              ownerAddress: found.ownerAddress,
              content: found.content,
            },
          ],
        });
      }
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      numBooks: 0,
      numBooksReadOnly: 0,
      books: [],
      booksReadOnly: [],
    };
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/free-download"
            target="_blank"
          >
            IP5 | Frontend
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small>
                <a className="nav-link" href="#">
                  <span id="account"></span>
                </a>
              </small>
            </li>
          </ul>
        </nav>
        <div className="container">
          <div className="row">
            <main className="col-lg-12 d-flex ">
              <div id="loader" className="text-center"></div>
              <div id="content" className="container-fluid">
                <div class="row justify-content-center">
                  <form
                    class="col-xs-12"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const web3 = new Web3("http://localhost:8545");
                      const userApp = new web3.eth.Contract(
                        APP_ABI,
                        APP_ADDRESS
                      );
                      const booksRef = collection(db, "Books");
                      await setDoc(doc(booksRef, this.state.numBooks), {
                        bookId: this.state.numBooks,
                        bookTitle: e.target[0].value,
                        bookAuthor: e.target[1].value,
                        bookPrice: e.target[2].value,
                        forSale: false,
                        ownerAddress: this.state.account,
                        bookContent: e.target[3].value,
                      });
                      userApp.methods
                        .publishBook(
                          e.target[0].value,
                          e.target[1].value,
                          parseInt(e.target[2].value)
                        )
                        .send({ from: this.state.account, gasLimit: 3000000 })
                        .once("receipt", (receipt) => {
                          console.log("transacted");
                          window.location.reload(false);
                        });
                    }}
                  >
                    <h2>Publish a Book</h2>
                    <input
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="Book Title..."
                      required
                    />
                    <input
                      id="author"
                      type="text"
                      className="form-control"
                      placeholder="Book Author..."
                      required
                    />
                    <input
                      id="price"
                      type="text"
                      className="form-control"
                      placeholder="Book Price in szabo 1e12 wei.."
                      required
                    />
                    <input
                      id="content"
                      type="text"
                      className="form-control"
                      placeholder="Book Content In Hash or plain text..."
                      required
                    />
                    <input type="submit" hidden="" />
                  </form>
                  <form
                    class="col-xs-12"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const web3 = new Web3("http://localhost:8545");
                      const userApp = new web3.eth.Contract(
                        APP_ABI,
                        APP_ADDRESS
                      );
                      const booksRef = collection(db, "Books");
                      await updateDoc(doc(booksRef, e.target[1].value), {
                        forSale: false,
                      });
                      userApp.methods
                        .offMarket(e.target[0].value)
                        .send({ from: this.state.account, gasLimit: 3000000 })
                        .once("receipt", (receipt) => {
                          console.log("transacted");
                          window.location.reload(false);
                        });
                    }}
                  >
                    <h2>Take Book off Market</h2>
                    <input
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="Book Address..."
                      required
                    />
                    <input
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="Book Id in DB..."
                      required
                    />
                    <input type="submit" hidden="" />
                  </form>
                  <form
                    class="col-xs"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const web3 = new Web3("http://localhost:8545");
                      const userApp = new web3.eth.Contract(
                        APP_ABI,
                        APP_ADDRESS
                      );
                      const booksRef = collection(db, "Books");
                      await updateDoc(doc(booksRef, e.target[1].value), {
                        forSale: true,
                      });
                      userApp.methods
                        .sellBook(e.target[0].value)
                        .send({ from: this.state.account, gasLimit: 3000000 })
                        .once("receipt", (receipt) => {
                          console.log("transacted");
                          window.location.reload(false);
                        });
                    }}
                  >
                    <h2>Sell Book </h2>
                    <input
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="Book Address..."
                      required
                    />
                    <input
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="Book Id in DB..."
                      required
                    />
                    <input type="submit" hidden="" />
                  </form>
                  <form
                    class="col-xs-12 "
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log();
                      const web3 = new Web3("http://localhost:8545");
                      const userApp = new web3.eth.Contract(
                        APP_ABI,
                        APP_ADDRESS
                      );
                      const booksRef = collection(db, "Books");
                      const booksRef2 = collection(db, "BooksReadOnly");
                      console.log(this.state.books[e.target[1].value]);
                      userApp.methods
                        .buyBook(e.target[0].value)
                        .send({
                          from: this.state.account,
                          gasLimit: 3000000,
                          value: web3.utils.toWei(
                            this.state.books[e.target[1].value].bookPrice,
                            "ether"
                          ),
                        })
                        .once("receipt", async (receipt) => {
                          await updateDoc(doc(booksRef, e.target[1].value), {
                            forSale: false,
                          });
                          const booksList = this.state.books[e.target[1].value];
                          await setDoc(
                            doc(booksRef2, this.state.numBooksReadOnly),
                            {
                              bookId: this.state.numBooksReadOnly,
                              bookTitle: booksList.bookTitle,
                              bookAuthor: booksList.bookAuthor,
                              ownerAddress: this.state.account,
                              content: String(booksList.content),
                            }
                          );
                          console.log("transacted");
                          window.location.reload(false);
                        });
                    }}
                  >
                    <h2>Buy a Book</h2>
                    <input
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="Book address..."
                      required
                    />
                    <input
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="Book Id in DB..."
                      required
                    />
                    <input type="submit" hidden="" />
                  </form>
                </div>
              </div>
            </main>
            <main className="container-flow px-4">
              <div class="row gx-10">
                <div className="col">
                  <ul id="taskList" className="list-unstyled">
                    <h2>Book List</h2>
                    {this.state.books.map((book) => {
                      return (
                        <div>
                          <hr />
                          <div className="taskTemplate">
                            <label>
                              <span className="content">
                                Book Title: {book.bookTitle}
                              </span>
                            </label>
                          </div>
                          <div className="taskTemplate">
                            <label>
                              <span className="content">
                                Book Address: {book.address}
                              </span>
                            </label>
                          </div>
                          <div className="taskTemplate">
                            <label>
                              <span className="content">
                                Book Id: {book.bookId}
                              </span>
                            </label>
                            <div className="taskTemplate">
                              <label>
                                <span className="content">
                                  Book Author: {book.bookAuthor}
                                </span>
                              </label>
                            </div>
                            <div className="taskTemplate">
                              <label>
                                <span className="content">
                                  Book Price: {book.bookPrice}
                                </span>
                              </label>
                            </div>
                            <div className="taskTemplate">
                              <label>
                                <span className="content">
                                  For Sale? {book.forSale}
                                </span>
                              </label>
                            </div>
                            <div className="taskTemplate">
                              <label>
                                <span className="content">
                                  Book Owner Address: {book.ownerAddress}
                                </span>
                              </label>
                            </div>
                          </div>
                          <hr />
                        </div>
                      );
                    })}
                  </ul>
                </div>
                <div className="col">
                  <ul id="taskList" className="list-unstyled">
                    <h2>My Purchased Books</h2>
                    {this.state.booksReadOnly.map((book) => {
                      return (
                        <div>
                          <hr />
                          <div className="taskTemplate">
                            <label>
                              <span className="content">
                                Book Title: {book.bookTitle}
                              </span>
                            </label>
                          </div>
                          <div className="taskTemplate">
                            <label>
                              <span className="content">
                                Book Address: {book.address}
                              </span>
                            </label>
                          </div>
                          <div className="taskTemplate">
                            <label>
                              <span className="content">
                                Book Id: {book.bookId}
                              </span>
                            </label>
                            <div className="taskTemplate">
                              <label>
                                <span className="content">
                                  Book Author: {book.bookAuthor}
                                </span>
                              </label>
                            </div>
                            <div className="taskTemplate">
                              <label>
                                <span className="content">
                                  Book Owner Address: {book.ownerAddress}
                                </span>
                              </label>
                            </div>
                            <div className="taskTemplate">
                              <label>
                                <span className="content">
                                  Book Content: "{book.content}"
                                </span>
                              </label>
                            </div>
                          </div>
                          <hr />
                        </div>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
