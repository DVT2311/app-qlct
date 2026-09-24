# Sổ Đôi — Đặc tả kỹ thuật (MVP)

Phiên bản 1.0 · 24/09/2026

## 1. Tổng quan

**Sản phẩm**: app quản lý tài chính cá nhân, bổ sung lớp tính năng cho cặp đôi chưa kết hôn.

**Người dùng giai đoạn đầu**: một cặp đôi (chủ dự án và người yêu). Sau này có thể mở cho cộng đồng, nên kiến trúc phải hỗ trợ nhiều người dùng và nhiều không gian chung ngay từ đầu.

**Nguyên tắc sản phẩm**

- Mỗi người dùng được app một mình như app chi tiêu cá nhân đầy đủ. Tính năng cặp đôi là lớp bổ sung.
- Hai người vẫn có tài chính riêng. Phần riêng mặc định là riêng tư; phần chung cả hai cùng thấy và cùng sửa.
- Số liệu hai phía phải luôn khớp nhau đến từng đồng.
- Nhập giao dịch phải nhanh (mục tiêu dưới 10 giây).

**Nền tảng**: app mobile Android + iOS (Expo), web dashboard (Next.js), backend Supabase.

**Phân phối giai đoạn đầu**: Android qua APK hoặc Google Play internal testing; iOS qua TestFlight. Chưa lên store công khai.

## 2. Khái niệm

| Khái niệm | Mô tả |
|---|---|
| Người dùng (`profile`) | Một tài khoản đăng nhập. |
| Không gian chung (`space`) | Nhóm tài chính chung, MVP giới hạn 2 thành viên ngang quyền. Một người dùng MVP chỉ thuộc tối đa 1 không gian đang hoạt động. |
| Ví (`wallet`) | Nơi chứa tiền: tiền mặt, tài khoản ngân hàng, thẻ tín dụng, ví điện tử, quỹ chung. Thuộc về **một người** hoặc **một không gian**. |
| Giao dịch (`transaction`) | Một sự kiện tiền đi/đến ví. Có thể là riêng (`space_id` null) hoặc chung. |
| Phân bổ (`allocation`) | Mỗi người thực sự chịu bao nhiêu của một giao dịch. |
| Số dư nợ | Ai đang nợ ai bao nhiêu trong không gian chung. |
| Tài sản (`asset`) | Vàng, sổ tiết kiệm, ngoại tệ, khác. Có danh sách chủ sở hữu kèm tỷ lệ. |
| Mục tiêu (`goal`) | Mục tiêu tiết kiệm chung (quỹ cưới, mua nhà…). |

Ba góc nhìn trong app:

| Góc nhìn | Nội dung | Ai thấy |
|---|---|---|
| Cá nhân | Ví, chi tiêu, ngân sách, tài sản riêng + phần của tôi trong khoản chung | Chỉ tôi |
| Chung | Ví chung, chi tiêu chung, quỹ chung, tài sản chung, số dư nợ, mục tiêu | Cả hai |
| Tổng hợp | Tài sản ròng và thu chi toàn phần của tôi | Chỉ tôi |

## 3. Phạm vi MVP

**Trong MVP**

- Đăng ký/đăng nhập email (magic link hoặc mật khẩu) và Google; Sign in with Apple (bắt buộc trên iOS khi có đăng nhập mạng xã hội).
- Khóa app bằng PIN/sinh trắc học (expo-local-authentication).
- Ví riêng, danh mục, giao dịch thu/chi/chuyển tiền, ngân sách tháng theo danh mục, báo cáo cơ bản.
- Ghép đôi bằng mã mời; không gian chung; ví chung/quỹ chung.
- Chi tiêu chung với 4 kiểu chia; số dư nợ; ghi nhận thanh toán; chốt sổ.
- Tài sản: vàng, sổ tiết kiệm, ngoại tệ; tỷ lệ sở hữu; nguồn gốc; lịch sử chuyển quyền sở hữu.
- Giá vàng/tỷ giá: nhập tay + kiến trúc provider để gắn nguồn tự động sau.
- Mục tiêu chung, góp vào mục tiêu, gợi ý số tiền cần góp mỗi tháng.
- Mức chia sẻ tài sản riêng: ẩn / chỉ tổng / đầy đủ.
- Rời không gian chung (chốt sổ cuối, lưu trữ chỉ đọc).
- Web dashboard: ba góc nhìn, biểu đồ, bảng giao dịch có lọc.
- Xóa tài khoản và xuất dữ liệu (CSV).

**Ngoài MVP (không làm lúc này)**: OCR hóa đơn, đọc thông báo ngân hàng, kết nối Open API ngân hàng, chứng khoán/crypto, module kế hoạch đám cưới, không gian nhiều hơn 2 người, đa ngôn ngữ, thông báo đẩy nâng cao, thanh toán/thu phí.

## 4. Quy tắc kế toán (bắt buộc tuân thủ)

### 4.1 Loại giao dịch

| `type` | Ý nghĩa | Ảnh hưởng số dư ví | Tính vào chi tiêu/thu nhập | Tạo nợ |
|---|---|---|---|---|
| `expense` | Khoản chi | Ví trả: −amount | Theo `allocations` | Có, nếu chung và trả từ ví cá nhân |
| `income` | Khoản thu | Ví nhận: +amount | Theo `allocations` | Không |
| `transfer` | Chuyển giữa hai ví của cùng một chủ | −/+ | Không | Không |
| `contribution` | Góp từ ví cá nhân vào ví quỹ chung | Ví nguồn −, quỹ + | Không | Không (tăng phần sở hữu quỹ) |
| `settlement` | Người A trả nợ cho người B | Ví A −, ví B + (nếu có ghi ví) | Không | Giảm nợ |

### 4.2 Phân bổ (allocations)

- Mọi `expense` và `income` có ít nhất một dòng phân bổ. Tổng phân bổ **bằng đúng** `amount` (ràng buộc kiểm tra ở `core` và bằng trigger DB).
- Giao dịch riêng: một dòng phân bổ 100% cho chủ giao dịch.
- Giao dịch chung: một dòng cho mỗi thành viên theo kiểu chia.

Kiểu chia (`split_mode`):

| Mã | Mô tả | Cách tính |
|---|---|---|
| `even` | Chia đều | amount / số thành viên |
| `ratio` | Theo tỷ lệ | theo `split_ratio_bps` của từng người (mặc định lấy từ cài đặt không gian) |
| `custom` | Số tiền cụ thể | người dùng nhập, tổng phải bằng amount |
| `payer_all` | Một người bao | 100% cho người trả, không tạo nợ |

**Làm tròn**: chia ra số lẻ thì phần dư (tính bằng đồng) cộng vào **người trả**. Ví dụ 1.000.001 ₫ chia đều, người trả A: A = 500.001, B = 500.000. Hàm phải tất định.

### 4.3 Báo cáo chi tiêu

- Chi tiêu cá nhân của U trong kỳ = Σ phân bổ cho U của các `expense` trong kỳ (cả riêng lẫn chung, kể cả chi từ quỹ chung).
- Chi tiêu chung của không gian = Σ `amount` các `expense` có `space_id` = không gian đó.
- `transfer`, `contribution`, `settlement` **không bao giờ** xuất hiện trong báo cáo chi tiêu/thu nhập.

### 4.4 Số dư nợ giữa hai người

Với không gian có thành viên A, B, định nghĩa `balance(A→B)` = số tiền B đang nợ A:

- `expense` chung trả từ ví cá nhân của A: `+ allocation(B)`.
- `expense` chung trả từ ví cá nhân của B: `− allocation(A)`.
- `settlement` B trả A số tiền x: `− x`; A trả B: `+ x`.
- `expense` trả từ **ví quỹ chung**: không ảnh hưởng nợ.
- `payer_all`: không ảnh hưởng nợ.

Kết quả dương: B nợ A; âm: A nợ B. Hiển thị theo góc nhìn người xem ("Lan đang nợ bạn…", "Bạn đang nợ Lan…").

**Chốt sổ**: không gian có ngày chốt sổ hằng tháng (mặc định ngày cuối tháng). Khi chốt, tạo bản ghi `settlement_periods` lưu số dư tại thời điểm đó; không tự động chuyển tiền.

### 4.5 Quỹ chung

- Ví `shared_fund` thuộc không gian.
- Phần của U trong quỹ = Σ `contribution` của U − Σ phân bổ cho U của các `expense` trả từ quỹ.
- Tỷ lệ sở hữu quỹ hiển thị = phần của U / số dư quỹ.

### 4.6 Tài sản và định giá

- Mỗi tài sản có danh sách `asset_ownerships` (user, `share_bps`), tổng = 10000 tại mọi thời điểm.
- Giá trị vàng = gram × giá mỗi gram. Dùng **giá mua vào** (giá cửa hàng mua lại) làm giá định giá, lấy báo giá mới nhất cùng loại vàng. Lãi/lỗ = giá trị hiện tại − giá mua.
- Sổ tiết kiệm: giá trị = tiền gốc; lãi dự kiến khi đáo hạn = gốc × lãi suất × số ngày kỳ hạn / 365 (lãi đơn, chỉ hiển thị). Lãi suất lưu bằng basis point/năm.
- Ngoại tệ: số lượng (đơn vị nhỏ nhất) × tỷ giá mua vào mới nhất.
- Tài sản khác: giá trị nhập tay.
- Thay đổi quyền sở hữu (ví dụ gộp tài sản riêng vào chung) tạo `asset_events` loại `ownership_changed`, đóng dòng sở hữu cũ (`valid_to`) và mở dòng mới. Với tài sản chung, cần **cả hai thành viên xác nhận** trước khi có hiệu lực (trạng thái `pending` → `confirmed`).

### 4.7 Tài sản ròng

Tài sản ròng cá nhân của U =
Σ số dư ví cá nhân (thẻ tín dụng là số âm)
+ phần của U trong quỹ chung
+ Σ (giá trị tài sản × share_bps của U / 10000)
+ khoản người kia đang nợ U − khoản U đang nợ người kia.

Tài sản ròng chung của không gian = Σ giá trị tài sản có ít nhất một chủ sở hữu thuộc không gian và có từ 2 chủ trở lên + số dư quỹ chung.

Snapshot: Edge Function chạy 00:30 hằng ngày (giờ Việt Nam) lưu `networth_snapshots` cho mỗi người dùng.

## 5. Quyền riêng tư và phân quyền

- Dữ liệu riêng (ví, giao dịch `space_id` null, tài sản chỉ có một chủ sở hữu là U) chỉ U đọc/ghi.
- Dữ liệu chung: mọi thành viên đang hoạt động của không gian đọc/ghi.
- Người kia **không** đọc được giao dịch riêng của mình. Giao dịch chung trả từ ví cá nhân: người kia thấy giao dịch và tên ví hiển thị ("Ví của Minh") nhưng không thấy số dư ví đó.
- Mức chia sẻ tài sản riêng (`space_members.asset_share_level`): `hidden` | `total` | `full`. Người kia chỉ đọc qua RPC `get_partner_asset_summary(space_id)` (security definer) trả về dữ liệu đúng mức chia sẻ. Khi đổi mức, tạo thông báo cho người kia.
- RLS viết bằng hàm helper `is_space_member(space_id)`; test RLS bằng pgTAP hoặc test tích hợp.

## 6. Mô hình dữ liệu (Postgres)

Mọi bảng có `id uuid primary key` (trừ bảng nối), `created_at timestamptz default now()`, `updated_at timestamptz`, `deleted_at timestamptz null`. Tiền: `bigint`. Tỷ lệ: `int` basis point.

```sql
profiles (id uuid pk references auth.users, display_name text, avatar_color text, currency text default 'VND')

spaces (id, name text, status text check (status in ('active','archived')),
        default_split_mode text default 'even',
        settle_day int default 0,            -- 0 = cuối tháng
        created_by uuid references profiles)

space_members (space_id uuid, user_id uuid, default_ratio_bps int default 5000,
               asset_share_level text default 'total' check (in ('hidden','total','full')),
               joined_at timestamptz, left_at timestamptz null,
               primary key (space_id, user_id))

space_invites (id, space_id, code text unique, created_by, expires_at, used_by null, used_at null)

wallets (id, owner_user_id uuid null, space_id uuid null,
         check ((owner_user_id is null) <> (space_id is null)),
         name text, kind text check (in ('cash','bank','credit_card','ewallet','shared_fund')),
         currency text default 'VND', opening_balance bigint default 0, archived bool default false)

categories (id, owner_user_id null, space_id null, is_system bool,
            name text, kind text check (in ('expense','income')), icon text, color text, parent_id null)

transactions (id uuid pk,                       -- sinh phía client
              type text check (in ('expense','income','transfer','contribution','settlement')),
              amount bigint check (amount > 0), currency text default 'VND',
              wallet_id uuid null,               -- ví nguồn (expense/transfer/contribution/settlement) hoặc ví nhận (income)
              to_wallet_id uuid null,            -- transfer/contribution/settlement
              space_id uuid null,                -- null = giao dịch riêng
              paid_by uuid references profiles,  -- người trả (settlement: người trả nợ)
              paid_to uuid null,                 -- settlement: người nhận
              category_id uuid null, note text,
              split_mode text null, occurred_on date, created_by uuid)

transaction_allocations (transaction_id uuid, user_id uuid, amount bigint,
                         primary key (transaction_id, user_id))
-- trigger: tổng allocation = transactions.amount với type expense/income

budgets (id, owner_user_id null, space_id null, category_id null, month date, amount bigint)

settlement_periods (id, space_id, period_end date, balance_bps_json jsonb, created_at)

assets (id, kind text check (in ('gold','savings','fx','other')), name text,
        -- vàng
        gold_type text null check (in ('sjc_bar','ring_9999','jewelry')), grams numeric(12,4) null,
        -- tiết kiệm
        bank_name text null, principal bigint null, rate_bps int null, term_months int null,
        opened_on date null, matures_on date null,
        -- ngoại tệ
        fx_currency text null, fx_amount_minor bigint null,
        -- chung
        purchase_price bigint null, purchased_on date null, manual_value bigint null,
        origin text check (in ('self','gift','inheritance','wedding_gift','other')), origin_note text,
        space_id uuid null)                    -- set khi tài sản có từ 2 chủ trở lên

asset_ownerships (id, asset_id, user_id, share_bps int, valid_from timestamptz, valid_to timestamptz null)

asset_events (id, asset_id, kind text check (in ('created','ownership_changed','value_updated','sold')),
              payload jsonb, status text default 'confirmed' check (in ('pending','confirmed','rejected')),
              confirmations uuid[] default '{}', created_by)

goals (id, space_id, name, target_amount bigint, deadline date, status text default 'active')
goal_links (goal_id, asset_id null, wallet_id null)     -- tài sản/ví tính vào tiến độ
goal_contributions (id, goal_id, user_id, amount bigint, transaction_id null, occurred_on date)

price_quotes (id, instrument text,        -- 'gold_sjc_bar' | 'gold_ring_9999' | 'gold_jewelry' | 'USD' | ...
              unit text,                  -- 'gram' cho vàng, 'unit' cho ngoại tệ
              buy_price bigint, sell_price bigint, source text, quoted_at timestamptz)

networth_snapshots (user_id, on_date date, wallets bigint, fund_share bigint, assets_share bigint,
                    receivable bigint, payable bigint, net bigint, primary key (user_id, on_date))
```

Tiến độ mục tiêu = Σ giá trị tài sản/ví liên kết (`goal_links`) + Σ `goal_contributions` không gắn với tài sản liên kết. Phần góp của từng người = theo tỷ lệ sở hữu của tài sản liên kết + contributions của người đó.

## 7. Nguồn giá

- Interface trong `packages/core`:

```ts
interface PriceProvider {
  id: string;
  fetchQuotes(): Promise<Array<{ instrument: string; unit: 'gram' | 'unit'; buyPrice: number; sellPrice: number; quotedAt: string }>>;
}
```

- MVP: `ManualProvider` (người dùng nhập giá trong app, có thể nhập theo chỉ, hệ thống quy về gram) và một provider tỷ giá từ nguồn công khai của ngân hàng.
- Giá vàng tự động: **chưa thu thập dữ liệu từ website khi chưa kiểm tra điều khoản sử dụng** của nguồn. Để sẵn chỗ gắn provider có hợp đồng.
- Edge Function `fetch-prices` chạy mỗi 2 giờ trong giờ hành chính; lỗi thì giữ giá cũ và hiển thị thời điểm cập nhật cuối.

## 8. Màn hình và thiết kế

Demo tham chiếu (canvas thiết kế): https://claude.ai/artifact/Ck2kMjy1tFmkXJ1gCtKHuJ

### 8.1 Design tokens

| Token | Giá trị | Dùng cho |
|---|---|---|
| `bg` | `#F6F2EA` | Nền |
| `surface` | `#FFFFFF` | Thẻ |
| `border` | `#E4DDD0` | Viền thẻ |
| `divider` | `#EFEAE0` | Đường kẻ trong thẻ |
| `ink` | `#1B1A17` | Chữ chính, nút chính, thẻ số dư |
| `muted` | `#5E594F` | Chữ phụ |
| `personA` | `#1F5F8B` | Thành viên thứ nhất (người đang xem luôn là màu này) |
| `personB` | `#B4502A` | Thành viên còn lại |
| `shared` | `#2F6A4A` | Mọi thứ "chung" |
| `sharedSoft` / `sharedInk` | `#E8F1EB` / `#24533A` | Nhãn "Chung" |
| `personASoft` / `personAInk` | `#E6EEF4` / `#174A6C` | Nhãn "Riêng" |
| `gold` | `#8A6412` | Vàng |

Font: **Be Vietnam Pro** (400/500/600/700) cho toàn bộ giao diện và số; **Lora** 700 cho tiêu đề màn hình. Số dùng `tabular-nums`. Bo góc thẻ 16–18px; vùng chạm tối thiểu 44px. Icon: nét (stroke) 1.8px, không dùng emoji.

### 8.2 Mobile (tab bar: Trang chủ · Chung · [+] · Tài sản · Mục tiêu)

1. **Trang chủ**: lời chào, avatar hai người; segmented control Cá nhân / Chung / Tổng hợp.
   - Cá nhân: chi tiêu tháng (phần của tôi) + thanh ngân sách + dòng "Gồm X ₫ là phần của bạn trong chi tiêu chung"; danh sách ví riêng; giao dịch gần đây (giao dịch chung hiển thị nhãn Chung, số tiền mình trả và phần của mình).
   - Chung: thẻ số dư nợ (nền `ink`), chi tiêu chung tháng + ngân sách chung, thanh "ai đã trả"; mục tiêu chung tóm tắt.
   - Tổng hợp: tài sản ròng và 4 thành phần (riêng, phần trong chung, phải thu, nợ thẻ); thu / chi / để dành tháng này.
2. **Thêm giao dịch** (nút +): số tiền lớn, nội dung, danh mục (chip), toggle **Chi riêng / Chi chung**. Khi chung: chọn người trả, chọn kiểu chia (4 kiểu). Khối "Ghi nhận vào sổ" cập nhật trực tiếp: trả từ ví nào, chi tiêu của từng người, kết quả nợ ("Lan sẽ nợ bạn 500.000 ₫"). Nút Lưu cố định dưới cùng.
3. **Chi tiêu chung**: thẻ số dư nợ + nút "Nhắc" và "Ghi nhận thanh toán"; tỷ lệ chia mặc định; danh sách giao dịch chung theo tháng, mỗi dòng có avatar người trả, tổng tiền, kiểu chia, và chênh lệch nợ (+ màu personA / − màu personB).
4. **Tài sản**: tài sản ròng + thanh riêng/chung; lọc Tất cả/Riêng/Chung; nhóm Vàng, Tiết kiệm, Tiền & quỹ; thẻ tài sản có nhãn Riêng/Chung, thanh tỷ lệ sở hữu, nguồn gốc, lãi/lỗ hoặc lãi dự kiến; thẻ "Tài sản riêng của [người kia]" theo mức chia sẻ.
5. **Mục tiêu chung**: mỗi mục tiêu có %, số hiện có / mục tiêu, thanh góp chồng theo người, gợi ý góp mỗi tháng, tài sản liên kết, nút Góp thêm; nút tạo mục tiêu mới.
6. Các màn phụ: đăng nhập, ghép đôi (tạo/nhập mã mời), quản lý ví, danh mục, ngân sách, chi tiết tài sản + lịch sử sự kiện, cài đặt (mức chia sẻ, tỷ lệ chia mặc định, ngày chốt sổ, khóa app, xuất dữ liệu, rời không gian, xóa tài khoản).

Gợi ý góp mỗi tháng = (mục tiêu − hiện có) / số tháng còn lại đến hạn (làm tròn lên hàng nghìn).

### 8.3 Web dashboard

Sidebar: Tổng quan, Giao dịch, Chi tiêu chung, Tài sản, Mục tiêu, Báo cáo. Header: segmented Cá nhân/Chung/Tổng hợp + chọn tháng.

Trang Tổng quan: 4 thẻ chỉ số (tài sản ròng, chi tiêu tháng, số dư nợ, mục tiêu chính); biểu đồ cột chồng 6 tháng (chi riêng vs phần chi chung); donut theo danh mục; bảng giao dịch gần đây (ngày, nội dung, danh mục, người trả, loại, phần của bạn); cơ cấu tài sản dạng thanh chồng.

Trang Giao dịch: bảng có lọc theo kỳ, ví, danh mục, riêng/chung, người trả; tìm kiếm; xuất CSV.

## 9. Dữ liệu mẫu và test golden

`supabase/seed.sql` tạo hai người dùng **Minh** và **Lan**, một không gian chung, và dữ liệu tháng 9/2026 sau. Các test trong `packages/core` dùng cùng bộ dữ liệu.

**Giao dịch chung** (tỷ lệ mặc định 50/50, tiền nhà 60/40):

| Ngày | Nội dung | Số tiền | Người trả | Chia | Minh chịu | Lan chịu | Ảnh hưởng balance(Minh→Lan) |
|---|---|---|---|---|---|---|---|
| 05/09 | Tiền nhà tháng 9 | 7.000.000 | Minh | 60/40 | 4.200.000 | 2.800.000 | +2.800.000 |
| 18/09 | Lan chuyển trả (settlement) | 1.450.000 | Lan | — | — | — | −1.450.000 |
| 20/09 | Vé xem phim | 350.000 | Lan | 50/50 | 175.000 | 175.000 | −175.000 |
| 22/09 | Tiền điện tháng 9 | 850.000 | Lan | 50/50 | 425.000 | 425.000 | −425.000 |
| 24/09 | Ăn tối kỷ niệm | 1.000.000 | Minh | 50/50 | 500.000 | 500.000 | +500.000 |

Kỳ vọng:

- `balance(Minh→Lan)` = **1.250.000** (Lan nợ Minh).
- Tổng chi tiêu chung tháng 9 = **9.200.000**; Minh đã trả 8.000.000, Lan đã trả 1.200.000.
- Phần chi chung của Minh = **5.300.000**. Chi tiêu cá nhân tháng 9 của Minh (gồm chi riêng 3.120.000) = **8.420.000**; ngân sách 12.000.000.

**Tài sản** (giá trị mẫu):

| Tài sản | Giá trị | Sở hữu |
|---|---|---|
| Vietcombank (ví) | 24.500.000 | Minh |
| Tiền mặt (ví) | 1.200.000 | Minh |
| Thẻ tín dụng TPBank (ví) | −3.100.000 | Minh |
| Sổ tiết kiệm Techcombank 12 tháng, 5,0%/năm | 150.000.000 | Minh 100% |
| Vàng miếng SJC 2 chỉ (7,5 g), giá mua 26.400.000 | 29.300.000 | Minh 100% |
| Nhẫn trơn 9999 3 chỉ (11,25 g), quà gia đình | 41.700.000 | Minh 50% / Lan 50% |
| Sổ tiết kiệm mua nhà | 120.000.000 | Minh 60% / Lan 40% |
| Quỹ chung (Minh góp 11.160.000, Lan 7.440.000) | 18.600.000 | theo góp |

Kỳ vọng cho Minh:

- Tài sản riêng (ví dương + tài sản 100%) = 24.500.000 + 1.200.000 + 150.000.000 + 29.300.000 = **205.000.000**.
- Phần trong tài sản chung = 20.850.000 + 72.000.000 + 11.160.000 = **104.010.000**.
- Tài sản ròng = 205.000.000 + 104.010.000 + 1.250.000 − 3.100.000 = **307.160.000**.
- Tài sản chung của không gian = 41.700.000 + 120.000.000 + 18.600.000 = **180.300.000**.
- Lãi vàng SJC = 29.300.000 − 26.400.000 = **2.900.000**; lãi dự kiến sổ Techcombank = **7.500.000**.

**Mục tiêu**: Quỹ cưới 250.000.000, hạn 12/2027, liên kết Quỹ chung + Nhẫn trơn → hiện có **60.300.000** (24%), Minh 32.010.000, Lan 28.290.000. Quỹ mua nhà 600.000.000, hạn 12/2029, liên kết sổ mua nhà → **120.000.000** (20%).

**Test làm tròn**: 1.000.001 chia `even`, người trả Minh → Minh 500.001, Lan 500.000. 100.000 chia `ratio` 3333/6667 → tổng đúng 100.000, phần dư về người trả.

## 10. Lộ trình cho Claude Code (milestone)

Mỗi milestone: code + test + cập nhật seed nếu cần. Không bắt đầu milestone sau khi tiêu chí trước chưa đạt.

**M0 — Khởi tạo** (≈1 tuần)
Monorepo pnpm/Turborepo, ESLint/Prettier, TypeScript strict, Expo app trống, Next.js app trống, `packages/core` với Vitest, `packages/tokens`, Supabase local, CI chạy lint + typecheck + test.
*Nghiệm thu*: `pnpm dev` chạy cả hai app; CI xanh.

**M1 — Logic lõi** (≈1–2 tuần)
Trong `packages/core`: money (định dạng, cộng trừ, chia có làm tròn), split (4 kiểu), allocations, balance, fund share, định giá vàng/tiết kiệm/ngoại tệ, tài sản ròng, tiến độ mục tiêu, gợi ý góp tháng.
*Nghiệm thu*: toàn bộ test golden mục 9 đạt; độ phủ `core` ≥ 90%.

**M2 — Schema, RLS, xác thực** (≈1–2 tuần)
Migrations mục 6, trigger kiểm tra tổng allocation, RLS mục 5, RPC `get_partner_asset_summary`, seed Minh & Lan, đăng nhập email/Google/Apple trên mobile và web.
*Nghiệm thu*: test RLS chứng minh Lan không đọc được giao dịch riêng và ví riêng của Minh; seed chạy được.

**M3 — Chi tiêu cá nhân trên mobile** (≈2–3 tuần)
Ví, danh mục, thêm/sửa/xóa giao dịch, chuyển tiền, ngân sách, Trang chủ góc nhìn Cá nhân, hàng đợi thao tác khi mất mạng (TanStack Query persist + mutation queue), khóa app.
*Nghiệm thu*: nhập giao dịch khi tắt mạng, bật lại thì đồng bộ không trùng.

**M4 — Tài sản cá nhân** (≈1–2 tuần)
Tài sản vàng/tiết kiệm/ngoại tệ, nhập giá tay, provider tỷ giá, màn Tài sản, góc nhìn Tổng hợp.
*Nghiệm thu*: số liệu tài sản riêng của Minh khớp mục 9.

**M5 — Lớp cặp đôi** (≈3–4 tuần)
Mã mời và ghép đôi, ví quỹ chung, contribution, thêm giao dịch chung với 4 kiểu chia, màn Chi tiêu chung, settlement, chốt sổ, tài sản chung + tỷ lệ sở hữu + xác nhận hai bên, mức chia sẻ, mục tiêu chung, rời không gian.
*Nghiệm thu*: trên hai thiết bị đăng nhập Minh và Lan, nhập đúng dữ liệu mục 9 thì cả hai thấy số dư 1.250.000 theo đúng chiều và mọi con số khớp.

**M6 — Web dashboard** (≈2–3 tuần)
Layout, ba góc nhìn, trang Tổng quan, trang Giao dịch có lọc và xuất CSV, trang Tài sản, trang Mục tiêu.
*Nghiệm thu*: số liệu web trùng mobile với cùng tài khoản.

**M7 — Hoàn thiện & phát hành nội bộ** (≈2 tuần)
Snapshot tài sản ròng hằng ngày, xóa tài khoản, xuất dữ liệu, xử lý lỗi, Sentry, build EAS cho Android (APK/internal testing) và iOS (TestFlight), deploy web lên Vercel.
*Nghiệm thu*: hai người cài được app thật và dùng liên tục 2 tuần.

## 11. Yêu cầu phi chức năng

- Bảo mật: HTTPS; token trong SecureStore; không log số tiền hoặc nội dung giao dịch lên dịch vụ giám sát; RLS mọi bảng.
- Hiệu năng: mở app tới trang chủ < 2 giây với 5.000 giao dịch; dashboard web < 2 giây.
- Truy cập: vùng chạm ≥ 44px, tương phản chữ ≥ 4.5:1, nhãn cho nút chỉ có icon, không phân biệt thông tin chỉ bằng màu (kèm dấu +/− hoặc chữ).
- Múi giờ: lưu `timestamptz`, hiển thị và tính kỳ theo `Asia/Ho_Chi_Minh`.

## 12. Câu hỏi còn mở

- Hai người đã sống chung chưa (ảnh hưởng danh mục mặc định và ngân sách chung)?
- Nguồn giá vàng tự động sẽ dùng nhà cung cấp nào?
- Tên chính thức của app (hiện dùng tạm "Sổ Đôi").
