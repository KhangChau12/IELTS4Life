Plan: Tích hợp SePay vào hệ thống thanh toán IELTS4Life
Context
Hiện tại hệ thống phân loại tier (Free/Pro) chỉ dựa vào email domain (@ptnk.edu.vn = Pro). Cần tích hợp SePay để nhận thanh toán thực từ ngân hàng SHB, tự động nâng cấp user lên Pro trong 30 ngày khi phát hiện giao dịch hợp lệ. Model: trả theo tháng (~3$/tháng ≈ ~75,000 VNĐ).

Pipeline tổng quan:

User click "Nâng cấp" 
→ Tạo order code (PRO-{userId}-{timestamp}) 
→ Hiển thị QR SHB + nội dung chuyển khoản bắt buộc
→ User chuyển khoản qua app ngân hàng
→ SePay đọc giao dịch SHB → POST đến webhook của ta
→ Webhook verify API key + match order code trong content
→ Cập nhật profiles: subscription_status='active', subscription_end_date = now+30days
→ User tự động lên Pro
Files cần chỉnh sửa / tạo mới
1. Database Migration (tạo mới)
File: supabase/migrations/034_add_subscription_fields.sql

Thêm vào bảng profiles:

subscription_status TEXT DEFAULT 'free' — 'free' | 'active' | 'expired'
subscription_end_date TIMESTAMPTZ NULL — ngày hết hạn Pro
subscription_order_code TEXT NULL — order code đang pending (để match webhook)
Tạo bảng mới payment_transactions:

id UUID PK
user_id UUID FK profiles
order_code TEXT UNIQUE — định danh thanh toán (PRO-userId-timestamp)
amount INTEGER — số tiền (VNĐ)
status TEXT — 'pending' | 'completed' | 'failed'
sepay_transaction_id INTEGER NULL — id từ SePay webhook (dùng idempotency check)
transaction_content TEXT NULL — nội dung chuyển khoản gốc
created_at TIMESTAMPTZ
completed_at TIMESTAMPTZ NULL
2. Types Database
File: types/database.ts

Thêm type cho payment_transactions table và update profiles row với 3 fields mới.

3. Quota Logic — thêm DB-based check
File: lib/user/quota.ts

Thêm function getSubscriptionStatus(profile) kiểm tra:

Nếu subscription_status === 'active' AND subscription_end_date > now() → Pro
Giữ nguyên email-based check cho @ptnk.edu.vn (không cần trả tiền)
Cập nhật getUserTier() để ưu tiên DB status trước email
4. API: Tạo đơn hàng
File (mới): app/api/payment/create-order/route.ts

POST /api/payment/create-order

Auth check (phải đăng nhập)
Sinh orderCode = PRO-{userId.slice(0,8)}-{Date.now()}
Insert vào payment_transactions (status='pending')
Update profiles.subscription_order_code = orderCode
Trả về: { orderCode, amount: 75000, accountNumber: "...", bankName: "SHB" }
5. API: SePay Webhook
File (mới): app/api/webhooks/sepay/route.ts

POST /api/webhooks/sepay

Verify header Authorization: Apikey {SEPAY_WEBHOOK_API_KEY}
Parse body: { id, content, transferAmount, transferType, ... }
Kiểm tra transferType === 'in' và transferAmount >= 75000
Tìm order code trong content (regex match PRO-[a-f0-9]{8}-\d+)
Idempotency: check sepay_transaction_id chưa tồn tại trong DB
Tìm user qua profiles.subscription_order_code = orderCode
Update payment_transactions: status='completed', sepay_transaction_id, completed_at
Update profiles: subscription_status='active', subscription_end_date = now+30days, subscription_order_code=NULL
Trả về { "success": true } với HTTP 200
6. Subscription Page UI
File: app/(dashboard)/subscription/page.tsx

Thay thế phần "Coming soon" + Zalo button bằng:

Nếu user đang là Pro (DB-based): hiện ngày hết hạn + badge "Đang hoạt động"
Nếu Free: nút "Nâng cấp Pro — 75,000đ/tháng" → gọi POST /api/payment/create-order → hiện modal QR + hướng dẫn
Modal chứa: QR code SHB (VietQR format), số tài khoản, tên chủ TK, nội dung chuyển khoản bắt buộc (order code), số tiền
Giữ nguyên phần SHB donation QR hiện tại cho @ptnk.edu.vn
7. Environment Variables
File: .env.local và .env.example

Thêm:

SEPAY_WEBHOOK_API_KEY=   # API Key đặt trong SePay webhook config
SHB_ACCOUNT_NUMBER=      # Số tài khoản SHB nhận tiền
SHB_ACCOUNT_NAME=        # Tên chủ tài khoản
PRO_PRICE_VND=75000      # Giá Pro (VNĐ)
QR Code Strategy
Dùng VietQR standard (không cần gọi API SePay để gen QR):

URL pattern: https://img.vietqr.io/image/{BANK_BIN}-{ACCOUNT_NUMBER}-compact.png?amount={AMOUNT}&addInfo={ORDER_CODE}&accountName={ACCOUNT_NAME}
Bank BIN của SHB: 970443
Render trực tiếp bằng <img> tag — không cần thư viện
Điều chỉnh Quota Check trong Essay Submit
File: app/api/essays/submit/route.ts

Hiện tại fetch profile từ DB, cần thêm logic:

Sau khi lấy profile, gọi getUserTier(profile) với profile object (thay vì chỉ email)
Nếu subscription_status === 'active' && subscription_end_date > now → treat as Pro dù email không phải @ptnk
Verification
Đăng ký SePay, liên kết tài khoản SHB, lấy SEPAY_WEBHOOK_API_KEY
Dùng ngrok (local) hoặc deploy lên Vercel để có URL public cho webhook
Cấu hình webhook trong SePay: URL = https://ielts4life.com/api/webhooks/sepay, Auth = API Key
Chuyển khoản thử với nội dung chứa order code → kiểm tra DB payment_transactions và profiles
Kiểm tra subscription page hiển thị đúng ngày hết hạn
Kiểm tra essay submit nhận đúng quota Pro
Lưu ý quan trọng
Idempotency bắt buộc: SePay có thể retry webhook 7 lần. Phải check sepay_transaction_id unique trước khi update.
Nội dung chuyển khoản: User PHẢI ghi đúng order code. Cần hiển thị nổi bật + copy button trong modal.
Không dùng polling: Chỉ dùng webhook push từ SePay, không cần cron job check SePay API.
Response timeout: SePay timeout sau 8s. Webhook handler phải nhẹ — chỉ verify + update DB, không làm gì nặng.