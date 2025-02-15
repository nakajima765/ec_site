//HTMLが全部読みこまれたら指定の処理を実行
document.addEventListener("DOMContentLoaded", async function () {
  // 商品リストを取得するコンテナ
  const productList = document.querySelector(".product-list");

  try {
    // 🚀 API から商品データを取得
    const response = await fetch("http://localhost:3000/products"); //fetchでサーバーのproductsにGETリクエストを送る
    const products = await response.json(); //サーバーから受け取ったデータ(JSON)をJSのオブジェクトに変換

    // 🔄 取得したデータを HTML に追加
    productList.innerHTML = ""; // 既存の HTML をクリア
    products.forEach((product) => {
      const productItem = document.createElement("div"); //divを作るだけ、
      productItem.classList.add("product"); //divにクラスを付与するだけ

      productItem.innerHTML = `
        <a href="product.html?id=${product._id}">
          <img src="${product.image}" alt="${product.name}" />
          <h2>${product.name}</h2>
        </a>
        <p>¥${product.price}</p>
        <button 
          class="add-to-cart"
          data-id="${product._id}"
          data-name="${product.name}"
          data-price="${product.price}"
        >
          カートに追加
        </button>
      `;
      productList.appendChild(productItem);
    });

    console.log("✅ 商品データを取得＆表示しました！");
  } catch (error) {
    console.error("⚠️ 商品データの取得に失敗:", error);
  }

  // カートの追加ボタンを取得
  const cartButtons = document.querySelectorAll(".add-to-cart");
  const cartList = document.querySelector(".cart-list");
  const cartContainer = document.querySelector("#cart-container");
  const cartButton = document.querySelector("#cart-button");
  const cartCount = document.querySelector("#cart-count");

  // カートの初期化（ローカルストレージから読み込み）
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  updateCartDisplay();

  function updateCartDisplay() {
    cartList.innerHTML = "";
    cart.forEach((item, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${item.name} - ¥${item.price}`;

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "削除";
      deleteButton.classList.add("delete-btn");
      deleteButton.dataset.index = index;

      deleteButton.addEventListener("click", function () {
        removeItemFromCart(this.dataset.index);
      });

      listItem.appendChild(deleteButton);
      cartList.appendChild(listItem);
    });
    updateCartCount();
  }

  function updateCartCount() {
    cartCount.textContent = cart.length;
  }

  function removeItemFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay();
  }

  cartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const name = this.dataset.name;
      const price = parseInt(this.dataset.price, 10);

      const product = { name, price };
      cart.push(product);
      localStorage.setItem("cart", JSON.stringify(cart));

      this.classList.add("added-to-cart");
      this.textContent = "追加済み ✔";

      setTimeout(() => {
        this.classList.remove("added-to-cart");
        this.textContent = "カートに追加";
      }, 1000);

      updateCartDisplay();
    });
  });

  cartButton.addEventListener("click", function () {
    cartContainer.classList.toggle("show");
  });

  document.addEventListener("click", function (e) {
    const target = e.target;
    if (target.classList.contains("delete-btn")) {
      return;
    }
    if (
      cartContainer.classList.contains("show") &&
      !cartContainer.contains(target) &&
      target !== cartButton
    ) {
      cartContainer.classList.remove("show");
    }
  });

  // 🔍 検索機能
  const searchInput = document.querySelector("#search-input");
  const productItems = document.querySelectorAll(".product");

  searchInput.addEventListener("input", function () {
    const keyword = searchInput.value.toLowerCase();
    productItems.forEach((product) => {
      const productName = product.querySelector("h2").textContent.toLowerCase();
      product.style.display = productName.includes(keyword) ? "block" : "none";
    });
  });

  // 🛒 会計機能
  const checkoutButton = document.querySelector("#checkout-button");
  checkoutButton.addEventListener("click", function () {
    let total = cart.reduce((sum, item) => sum + item.price, 0);
    alert(`合計金額は ￥${total}です！`);
  });
});
