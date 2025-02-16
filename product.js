//=============================================================
//クリックされた商品のデータを取得する処理
//=============================================================
document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search); //? 以降のクエリパラメータを取得する
  const productId = urlParams.get("id"); //クリックされた商品のIDを取得

  if (!productId) {
    document.getElementById("product-container").innerHTML =
      "<p>商品が見つかりませんでした。</p>";
    return;
  }

  try {
    const response = await fetch(`https://ec-site-bo78.onrender.com/products/${productId}`); 
    const product = await response.json(); //jsonを変換して代入
    //=============================================================
    //取得したデータをHTMLに埋め込んで表示するエリアここから
    //=============================================================
    if (!product || Object.keys(product).length === 0) {
      document.getElementById("product-container").innerHTML =
        "<p>商品が見つかりませんでした。</p>";
      return;
    }

    document.getElementById("product-container").innerHTML = `
      <div class="product-container">
          <div class="product-info">
              <h2>${product.name}</h2>
              <img src="${product.image}" alt="${
      product.name
    }" class="product-image">
              <p>${product.description || "この商品の説明はありません。"}</p>
              <p class="product-price">価格: ¥${product.price}</p>
              <button id="add-to-cart" class="add-to-cart" 
                data-id="${product._id}" 
                data-name="${product.name}" 
                data-price="${product.price}">
                カートに追加
              </button>
          </div>
      </div>
    `;

    // ✅ 1. まずレビュー機能をセットアップ
    setupReviewFeature(product._id);

    // ✅ 2. おすすめ商品を表示
    displayRecommendedProducts(product._id);
    //=============================================================
    //取得したデータをHTMLに埋め込んで表示するエリアここまで　// ✅ 3. カートに追加するボタンの処理
    //=============================================================

    const addToCartBtn = document.getElementById("add-to-cart");
    addToCartBtn.addEventListener("click", function () {
      let cart = JSON.parse(localStorage.getItem("cart")) || []; //ローカルストレージの中身をcartに代入
      const item = {
        //クリックされた商品をitemのオブジェクトにまとめる
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
      };

      cart.push(item);
      localStorage.setItem("cart", JSON.stringify(cart)); //カートに追加

      addToCartBtn.textContent = "追加済み ✔";
      addToCartBtn.classList.add("added");
      setTimeout(() => {
        addToCartBtn.textContent = "カートに追加";
        addToCartBtn.classList.remove("added");
      }, 1000); //ボタンのエフェクトの処理
    });
  } catch (error) {
    console.error("⚠️ 商品データの取得に失敗:", error);
    document.getElementById("product-container").innerHTML =
      "<p>商品データの取得に失敗しました。</p>";
  }
});

//===========================================================
//レビューを投稿する関数ここから
//===========================================================
function setupReviewFeature(productId) {
  document
    .getElementById("submit-review")
    .addEventListener("click", function () {
      const reviewText = document.getElementById("review-text").value;
      const reviewRating = document.getElementById("review-rating").value;

      if (reviewText.trim() === "") {
        alert("レビューを入力してください！");
        return;
      }

      let reviews =
        JSON.parse(localStorage.getItem(`reviews-${productId}`)) || [];
      reviews.push({ text: reviewText, rating: reviewRating });
      localStorage.setItem(`reviews-${productId}`, JSON.stringify(reviews));

      displayReviews(productId);
    });

  displayReviews(productId);
}
//===========================================================
//レビューを投稿する関数ここまで
//===========================================================

//===========================================================
//レビューを表示する関数ここから
//===========================================================
function displayReviews(productId) {
  const reviewList = document.getElementById("review-list");
  reviewList.innerHTML = "";

  let reviews = JSON.parse(localStorage.getItem(`reviews-${productId}`)) || [];
  for (const review of reviews) {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<strong>${"★".repeat(
      parseInt(review.rating, 10)
    )}</strong> ${review.text}`;
    reviewList.appendChild(listItem);
  }
}
//===========================================================
//レビューを表示する関数ここまで
//===========================================================

//===========================================================
//おすすめ商品の関数ここから
//===========================================================
async function displayRecommendedProducts(productId) {
  const recommendedContainer = document.querySelector(".recommended-list");

  if (!recommendedContainer) {
    console.error("おすすめ商品を表示する要素が見つかりません！");
    return;
  }

  try {
    const response = await fetch(`https://ec-site-bo78.onrender.com/products/${productId}`);
    const products = await response.json();

    const relatedProducts = products.filter((p) => p._id !== productId);
    if (relatedProducts.length === 0) {
      console.warn("おすすめに表示できる商品がありません！");
      return;
    }

    const shuffled = relatedProducts
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    recommendedContainer.innerHTML = "";

    for (const product of shuffled) {
      const productElement = document.createElement("div");
      productElement.classList.add("recommended-item");

      productElement.innerHTML = `
        <a href="product.html?id=${product._id}" class="recommended-link">
            <img src="${product.image}" alt="${product.name}" class="recommended-image">
            <p class="recommended-name">${product.name}</p>
            <p class="recommended-price">¥${product.price}</p>
        </a>
      `;

      recommendedContainer.appendChild(productElement);
    }
  } catch (error) {
    console.error("⚠️ おすすめ商品の取得に失敗:", error);
  }
}
//===========================================================
//おすすめ商品の関数ここまで
//===========================================================

//===========================================================
//商品削除の処理ここから
//===========================================================
document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    document.getElementById("product-container").innerHTML =
      "<p>商品が見つかりませんでした。</p>";
    return;
  }

  try {
    // 🚀 API から商品データを取得
    const response = await fetch(`https://ec-site-bo78.onrender.com/products/${productId}`);
    const product = await response.json();

    if (!product || Object.keys(product).length === 0) {
      document.getElementById("product-container").innerHTML =
        "<p>商品が見つかりませんでした。</p>";
      return;
    }

    // 🖼️ 商品情報を HTML に埋め込む
    document.getElementById("product-container").innerHTML = `
      <div class="product-container">
          <div class="product-info">
              <h2>${product.name}</h2>
              <img src="${product.image}" alt="${
      product.name
    }" class="product-image">
              <p>${product.description || "この商品の説明はありません。"}</p>
              <p class="product-price">価格: ¥${product.price}</p>
              <button id="add-to-cart" class="add-to-cart" 
                data-id="${product._id}" 
                data-name="${product.name}" 
                data-price="${product.price}">
                カートに追加
              </button>
          </div>
      </div>
    `;

    const header = document.querySelector(".button-container"); // ヘッダーを取得
    if (header) {
      header.innerHTML += `<button id="delete-product" class="delete-product">🗑 削除</button>`;

      // 新しく追加されたボタンを取得
      setTimeout(() => {
        const deleteBtn = document.getElementById("delete-product");
        if (deleteBtn) {
          deleteBtn.classList.add("custom-delete-btn"); // カスタムクラスを追加！
        }
      }, 10); // ちょっと待ってから取得
    }

    // 🔥 削除ボタンの処理
    document
      .getElementById("delete-product")
      .addEventListener("click", async function () {
        if (!confirm("本当に削除しますか？")) return;

        try {
          const response = await fetch(
            `https://ec-site-bo78.onrender.com/products/${productId}`,
            {
              method: "DELETE",
            }
          );

          const data = await response.json();
          if (response.ok) {
            alert("✅ 商品を削除しました！");
            window.location.href = "index.html"; // 商品一覧ページにリダイレクト
          } else {
            alert("⚠️ エラーが発生しました: " + data.error);
          }
        } catch (error) {
          console.error("⚠️ 削除エラー:", error);
          alert("⚠️ サーバーエラーが発生しました！");
        }
      });
  } catch (error) {
    console.error("⚠️ 商品データ取得エラー:", error);
  }
});
//===========================================================
//商品削除の処理ここまで
//===========================================================
