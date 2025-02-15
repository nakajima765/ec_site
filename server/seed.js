//===============================================================
//初回セットアップ用のsc終わったら消してもいいらしい。productに最初のデータを入れておく
//===============================================================
const mongoose = require("mongoose");

// 📌 MongoDB に接続
mongoose
  .connect("mongodb://127.0.0.1:27017/ecsite")
  .then(() => console.log("🚀 MongoDB に接続成功！"))
  .catch((err) => console.error("⚠️ MongoDB 接続エラー:", err));

// 📌 商品スキーマを作成
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  description: String,
});

// 📌 MongoDB の `products` コレクションと接続
const Product = mongoose.model("Product", productSchema);

// 📌 商品データを登録する関数
const seedProducts = async () => {
  await Product.deleteMany({}); // 🔥 既存データ削除（リセット）

  await Product.insertMany([
    {
      name: "初音ミクの使い方",
      price: 1000,
      image: "img/img2.jpg",
      description: "初音ミクの使い方を解説した本です。",
    },
    {
      name: "春に揺蕩う陽炎",
      price: 2000,
      image: "img/img3.jpg",
      description: "春にぴったりの小説",
    },
    {
      name: "惑星飛行",
      price: 1200,
      image: "img/img5.jpg",
      description: "想いは時を超え数多の星をまたいでゆく…",
    },
    {
      name: "限りなく君に近い青",
      price: 1500,
      image: "img/img6.jpg",
      description: "この青色に花を添えて",
    },
    {
      name: "電子の海から",
      price: 900,
      image: "img/img7.jpg",
      description: "天才プログラマにより産み落とされた電脳少女…",
    },
  ]);

  console.log("✅ 商品データを初期化しました！");
  mongoose.connection.close();
};

// 📌 関数を実行
seedProducts();
