//=====================================================================
//サーバー設定セットアップ
//=====================================================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); //環境変数を使うための設定

const app = express();
app.use(cors());
app.use(express.json()); //JSONデータを受け取れるようにする

//MONGODBに接続
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//APIテスト用のエンドポイント
app.get("/", (req, res) => {
  res.send("🚀 サーバーが動いてるよ！");
});

// 📌 サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 サーバー起動！ http://localhost:${PORT}`);
});

//MongoDBの設定=======================================================
//商品スキーマを作成(MongoDBに保存するデータの構造を定義)
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String, //商品画像のURLも保存
  description: String, // 🆕 説明を追加！
});

//MongoDBのproductsコレクションと接続
const Product = mongoose.model("Product", productSchema); //modelを作成したら勝手に空の配列的なのが作成されるMONGOに
//mongooseの仕様でProductは定義した時点でproductsになる
//MongoDBの設定ここまで=================================================

//フロントから/productsにリクエストがきたら.商品情報のデータfindで全部だす
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find(); //MongoDBから商品一覧を取得
    res.json(products); //JSON形式でフロントに返す
  } catch (err) {
    res.status(500).json({ error: "データ取得エラー" });
  }
});

// 📌 特定の商品を取得する API エンドポイント
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "商品が見つかりません" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "⚠️ 商品データ取得エラー" });
  }
});

// 📌 商品を削除する API エンドポイント
app.delete("/products/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "⚠️ 商品が見つかりません" });
    }

    res.json({ message: "🗑️ 商品が削除されました！", product: deletedProduct });
  } catch (err) {
    console.error("⚠️ 商品削除エラー:", err);
    res.status(500).json({ error: "⚠️ サーバーエラーが発生しました" });
  }
});

// 📌 新しい商品を追加する API エンドポイント
app.post("/products", async (req, res) => {
  try {
    const { name, price, image, description } = req.body;

    // 🔥 バリデーション（必須チェック）
    if (!name || !price || !image) {
      return res.status(400).json({ error: "⚠️ 必須項目が不足しています" });
    }

    const newProduct = new Product({ name, price, image, description });
    await newProduct.save();

    res
      .status(201)
      .json({ message: "✅ 商品が登録されました！", product: newProduct });
  } catch (err) {
    console.error("⚠️ 商品登録エラー:", err);
    res.status(500).json({ error: "⚠️ サーバーエラーが発生しました" });
  }
});

//画像追加の処理ここから=======================================
const multer = require("multer");
const path = require("path");

// 画像アップロードの設定（multer）
const storage = multer.diskStorage({
  destination: "uploads/", // 画像を保存するフォルダ
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ユニークなファイル名を生成
  },
});

const upload = multer({ storage });

// 📌 画像をアップロードする API エンドポイント
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ error: "⚠️ 画像がアップロードされていません。" });
  }

  // 画像のURLを作成（Render上でもアクセスできるようにする）
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;

  res.json({ imageUrl });
});

// 📌 `uploads` フォルダを公開（画像をURLでアクセスできるようにする）
app.use("/uploads", express.static("uploads"));
//画像追加の処理ここまで=======================================
