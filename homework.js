// ========================================
// 第六週作業：電商 API 資料串接練習
// 執行方式：node homework.js
// 環境需求：Node.js 18+（內建 fetch）
// ========================================

// 載入環境變數
require("dotenv").config({ path: ".env" });

// API 設定（從 .env 讀取）
const API_PATH = process.env.API_PATH;
const BASE_URL = "https://livejs-api.hexschool.io";
const ADMIN_TOKEN = process.env.API_KEY;

// ========================================
// 任務一：基礎 fetch 練習
// ========================================

/*NOTE
※async / await
async function 宣告後，函式回傳值會自動包成 Promise
await 只能在 async 函式內使用，讓非同步程式碼看起來像同步
不需要手動寫 new Promise()，async 函式就是 Promise

※fetch API（Node.js 18+ 內建）
fetch(url) 預設發送 GET 請求，回傳 Response 物件
Response 物件本身不是資料，需要呼叫 response.json() 解析
response.json() 也是非同步的，要加 await

※response.ok 與錯誤處理
fetch 遇到 4xx / 5xx 不會自動丟錯，只是 response.ok 為 false
真正會進 catch 的是：網路斷線、DNS 失敗、請求被封鎖等「連不到伺服器」的情況
正確做法：先用 response.ok 判斷 HTTP 層錯誤，再用 try/catch 捕捉網路層錯誤
*/

/**
 * 1. 取得產品列表
 * 使用 fetch 發送 GET 請求
 * @returns {Promise<Array>} - 回傳 products 陣列
 */
async function getProducts() {
	// 請實作此函式
	// 提示：
	// 1. 使用 fetch() 發送 GET 請求
	// 2. 使用 response.json() 解析回應
	// 3. 回傳 data.products
	const response = await fetch(
		`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/products`,
	);
	const data = await response.json();
	return data.products;
}

/**
 * 2. 取得購物車列表
 * @returns {Promise<Object>} - 回傳 { carts: [...], total: 數字, finalTotal: 數字 }
 */
async function getCart() {
	// 請實作此函式
	// 相似結構，products換成carts
	const response = await fetch(
		`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/carts`,
	);
	const data = await response.json();
	return {
		carts: data.carts,
		total: data.total,
		finalTotal: data.finalTotal,
	};
}

/**
 * 3. 錯誤處理：當 API 回傳錯誤時，回傳錯誤訊息
 * @returns {Promise<Object>} - 回傳 { success: boolean, data?: [...], error?: string }
 */
async function getProductsSafe() {
	// 請實作此函式
	// 提示：
	// 1. 加上 try-catch 處理錯誤
	// 2. 檢查 response.ok 判斷是否成功
	// 3. 成功回傳 { success: true, data: [...] }
	// 4. 失敗回傳 { success: false, error: '錯誤訊息' }
	try {
		const response = await fetch(
			`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/products`,
		);
		// HTTP 層錯誤 4XX、 5XX
		if (!response.ok) {
			return { success: false, error: "請求失敗" };
		}
		const data = await response.json();
		return { success: true, data: data.products };
	} catch (error) {
		// catch 捕捉網路層錯誤
		return { success: false, error: error.message };
	}
}

// ========================================
// 任務二：POST 請求 - 購物車操作
// ========================================

/* NOTE

※fetch 的選項物件（第二個參數）
method：HTTP 方法，預設為 "GET"。
headers：請求標頭，傳送 JSON 時必須加 "Content-Type": "application/json" 。
body：請求內容，只接受字串，物件需先用 JSON.stringify() 轉換。

※為什麼要 JSON.stringify()？
HTTP body 傳輸的是純文字（字串），JavaScript 物件必須序列化成 JSON 字串。
收到回應後用 response.json() 將 JSON 字串還原成 JS 物件（反序列化）。

※Content-Type: application/json 的作用
告訴伺服器「我送的 body 是 JSON 格式」，讓伺服器能正確解析。
忘記加這個 header，伺服器可能當成純文字處理而報錯。

※DELETE 的兩種用法
刪單筆：把 ID 放在 URL 路徑 → /carts/{id}（路徑參數 Path Parameter）。
刪全部：不帶 ID，直接打 /carts。
DELETE 通常不需要 body 和 Content-Type header。
*/

/**
 * 1. 加入商品到購物車
 * @param {string} productId - 產品 ID
 * @param {number} quantity - 數量
 * @returns {Promise<Object>} - 回傳更新後的購物車資料
 */
async function addToCart(productId, quantity) {
	// 請實作此函式
	// 提示：
	// 1. 發送 POST 請求
	// 2. body 格式：{ data: { productId: "xxx", quantity: 1 } }
	// 3. 記得設定 headers: { 'Content-Type': 'application/json' }
	// 4. body 要用 JSON.stringify() 轉換
	const response = await fetch(
		`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/carts`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ data: { productId, quantity } }),
		},
	);
	const data = await response.json();
	return data;
}

/**
 * 2. 編輯購物車商品數量
 * @param {string} cartId - 購物車項目 ID
 * @param {number} quantity - 新數量
 * @returns {Promise<Object>} - 回傳更新後的購物車資料
 */
async function updateCartItem(cartId, quantity) {
	// 請實作此函式
	// 提示：
	// 1. 發送 PATCH 請求
	// 2. body 格式：{ data: { id: "購物車ID", quantity: 數量 } }
	// 相似格式
	const response = await fetch(
		`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/carts`,
		{
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			// PATCH body 使用id 識別需要更改哪一筆 (不是productId)
			body: JSON.stringify({ data: { id: cartId, quantity } }),
		},
	);
	const data = await response.json();
	return data;
}

/**
 * 3. 刪除購物車特定商品
 * @param {string} cartId - 購物車項目 ID
 * @returns {Promise<Object>} - 回傳更新後的購物車資料
 */
async function removeCartItem(cartId) {
	// 請實作此函式
	// 提示：發送 DELETE 請求到 /carts/{id}
	const response = await fetch(
		// cardId 放在 URL 路徑末端(Path Parameter)，告訴伺服器刪哪一筆
		`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/carts/${cartId}`,
		{ method: "DELETE" },
	);
	const data = await response.json();
	return data;
}

/**
 * 4. 清空購物車
 * @returns {Promise<Object>} - 回傳清空後的購物車資料
 */
async function clearCart() {
	// 請實作此函式
	// 提示：發送 DELETE 請求到 /carts
	const response = await fetch(
		// 不帶 cardId ， 對整個/carts 發送 DELETE 即代表清空購物車。
		`${BASE_URL}/api/livejs/v1/customer/${API_PATH}/carts/`,
		{ method: "DELETE" },
	);
	const data = await response.json();
	return data;
}

// ========================================
// HTTP 知識測驗 (額外練習)
// ========================================

/*
請回答以下問題（可以寫在這裡或另外繳交）：

1. HTTP 狀態碼的分類（1xx, 2xx, 3xx, 4xx, 5xx 各代表什麼）
   答：
   1xx 資訊：請求已收到，處理中（少見，如 100 Continue）
   2xx 成功：請求成功處理
     - 200 OK：最常見，請求成功
     - 201 Created：POST 新增資料成功
     - 204 No Content：成功但沒有回傳內容（常見於 DELETE）
   3xx 重新導向：資源位置已變更，瀏覽器會自動跳轉
     - 301 Moved Permanently：永久移到新 URL
     - 302 Found：暫時移到新 URL
   4xx 客戶端錯誤：請求本身有問題
     - 400 Bad Request：請求格式錯誤
     - 401 Unauthorized：未登入或 token 無效
     - 403 Forbidden：已登入但沒有權限
     - 404 Not Found：找不到資源
     - 422 Unprocessable Entity：格式正確但資料驗證失敗
    5xx 伺服器錯誤：伺服器本身出問題
     - 500 Internal Server Error：伺服器程式錯誤
     - 503 Service Unavailable：伺服器暫時無法服務


2. GET、POST、PATCH、PUT、DELETE 的差異
   答：
   GET：讀取資料，不改變伺服器狀態；參數放在 URL query string。
   POST：新增資料；資料放在 request body。
   PATCH：部分更新，只改指定欄位（本作業的修改購物車數量）。
   PUT：整筆覆蓋，替換整個資源（未提供的欄位會被清空）。
   DELETE：刪除資料。

3. 什麼是 RESTful API？
   答：
   REST（Representational State Transfer）是一種 API 設計風格，核心概念：
   - 以「資源」為中心設計 URL，如 /products、/carts、/carts/{id}
   - 用 HTTP 方法表達操作意圖（GET 讀、POST 增、PATCH/PUT 改、DELETE 刪）
   - 無狀態（Stateless）：每次請求都包含所有必要資訊，伺服器不記憶上一次請求
*/

// ========================================
// 匯出函式供測試使用
// ========================================
module.exports = {
	API_PATH,
	BASE_URL,
	ADMIN_TOKEN,
	getProducts,
	getCart,
	getProductsSafe,
	addToCart,
	updateCartItem,
	removeCartItem,
	clearCart,
};

// ========================================
// 直接執行測試
// ========================================
if (require.main === module) {
	async function runTests() {
		console.log("=== 第六週作業測試 ===\n");
		console.log("API_PATH:", API_PATH);
		console.log("");

		if (!API_PATH) {
			console.log("請先在 .env 檔案中設定 API_PATH！");
			return;
		}

		// 任務一測試
		console.log("--- 任務一：基礎 fetch ---");
		try {
			const products = await getProducts();
			console.log(
				"getProducts:",
				products ? `成功取得 ${products.length} 筆產品` : "回傳 undefined",
			);
		} catch (error) {
			console.log("getProducts 錯誤:", error.message);
		}

		try {
			const cart = await getCart();
			console.log(
				"getCart:",
				cart ? `購物車有 ${cart.carts?.length || 0} 筆商品` : "回傳 undefined",
			);
		} catch (error) {
			console.log("getCart 錯誤:", error.message);
		}

		try {
			const result = await getProductsSafe();
			console.log(
				"getProductsSafe:",
				result?.success ? "成功" : result?.error || "回傳 undefined",
			);
		} catch (error) {
			console.log("getProductsSafe 錯誤:", error.message);
		}

		console.log("\n=== 測試結束 ===");
		console.log("\n提示：執行 node test.js 進行完整驗證");
	}

	runTests();
}
