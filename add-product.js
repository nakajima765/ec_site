document
  .getElementById("add-product-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
  });

//入力されたデータを取得
const name = document.getElementById("name").value;
const price = document.getElementById("price").value;
const image = document.getElementById("image").value;
const description = document.getElementById("description").value;

const newProduct = { name, price, image, description };

document
  .getElementById("add-product-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // フォーム送信を防ぐ

    // 入力されたデータを取得
    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const image = document.getElementById("image").value;
    const description = document.getElementById("description").value;

    const newProduct = { name, price, image, description }; //入力されたvalueを一つの配列に

    try {
      // 🚀 API に `POST` リクエストを送る
      const response = await fetch("https://ec-site-bo78.onrender.com/products", {
        method: "POST", //postはデータを登録する
        headers: { "Content-Type": "application/json" }, //送るデータを指定
        body: JSON.stringify(newProduct),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ 本が登録されました！");
        window.location.href = "index.html"; // 登録後、商品一覧ページへ移動
      } else {
        alert("⚠️ 本の登録に失敗しました: " + data.error);
      }
    } catch (error) {
      console.error("⚠️ 本の登録エラー:", error);
      alert("⚠️ エラーが発生しました！");
    }
  });

document.getElementById("image").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("imagePreview").src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

document
  .getElementById("uploadButton")
  .addEventListener("click", async function () {
    const fileInput = document.getElementById("imageInput").value;
    if (!fileInput) {
      alert("画像を選択してください！");
      return;
    }

    const formData = new FormData();
    formData.append("image", fileInput);

    try {
      const response = await fetch("https://ec-site-bo78.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert("✅ 画像アップロード成功！");
        console.log("画像URL:", data.imageUrl);
        // 商品登録時にこの URL を使って保存できる！
      } else {
        alert("⚠️ アップロードに失敗しました: " + data.error);
      }
    } catch (error) {
      console.error("⚠️ アップロードエラー:", error);
      alert("⚠️ サーバーエラーが発生しました！");
    }
  });
