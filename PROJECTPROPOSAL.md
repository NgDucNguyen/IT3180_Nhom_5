# **PROJECT PROPOSAL**

# Electronics Trading & Exchange Marketplace

**Học phần:** Nhập môn Công nghệ phần mềm  
**Nhóm thực hiện:** 5  
**Hình thức:** Web Application  
**Mô hình:** C2C Marketplace \- Multi-seller Platform

# **1.PROJECT OVERVIEW**

### **Ý tưởng**

Xây dựng một nền tảng thương mại điện tử cho phép nhiều người dùng đăng tin, mua bán và trao đổi các thiết bị điện tử mới hoặc đã qua sử dụng.

**Nhóm sản phẩm:**

* Điện thoại, máy tính bảng.  
* Laptop, máy tính và linh kiện.  
* Tai nghe, đồng hồ thông minh.  
* Thiết bị ngoại vi và phụ kiện điện tử.

**Đặc điểm hệ thống:**

* Người dùng có thể đồng thời là người mua và người bán.  
* Mỗi người bán tự quản lý các sản phẩm và tin đăng của mình.  
* Hỗ trợ hai hình thức giao dịch: **mua bán** và **trao đổi sản phẩm**.  
* Quản trị viên quản lý hoạt động của nền tảng.

**Mục đích:** Tạo ra một môi trường tập trung, có cấu trúc để người dùng đăng bán, tìm kiếm, giao dịch và quản lý các thiết bị điện tử.

# **2\. PROBLEM STATEMENT**

### **Bối cảnh**

Người có nhu cầu mua bán thiết bị điện tử đã qua sử dụng thường tìm kiếm hoặc đăng tin trên mạng xã hội, hội nhóm và các nền tảng rao vặt.

Việc mua bán trực tiếp giữa các cá nhân có thể phát sinh một số khó khăn.

### **Các vấn đề cần giải quyết**

**1\. Thông tin sản phẩm thiếu tính nhất quán**

* Tin đăng có thể thiếu thông số kỹ thuật, tình trạng sử dụng hoặc thông tin bảo hành.  
* Người mua khó so sánh sản phẩm theo các tiêu chí thống nhất.

**2\. Khó quản lý tin đăng và giao dịch**

* Người bán phải tự theo dõi sản phẩm còn bán, đang giao dịch hoặc đã bán.  
* Người mua khó quản lý các yêu cầu mua hàng đã gửi.

**3\. Trao đổi thiết bị chưa có quy trình rõ ràng**

* Người dùng có thể muốn đổi thiết bị đang sở hữu lấy một thiết bị khác.  
* Việc đề xuất, chấp nhận, từ chối và theo dõi các giao dịch trao đổi thường phải tự thỏa thuận.

**4\. Cần cơ chế quản lý nội dung**

* Tin đăng sai danh mục, trùng lặp hoặc có dấu hiệu vi phạm cần được kiểm tra và xử lý.

### **Giải pháp đề xuất**

Xây dựng một hệ thống tập trung, chuẩn hóa thông tin tin đăng và hỗ trợ quản lý quy trình mua bán, trao đổi thiết bị giữa người dùng.

# **3\. OBJECTIVES & SCOPE**

### **Mục tiêu**

**Mục tiêu nghiệp vụ**

* Cho phép người dùng đăng tin bán thiết bị điện tử mới và cũ.  
* Hỗ trợ tìm kiếm, lọc và xem thông tin sản phẩm.  
* Hỗ trợ gửi yêu cầu mua hàng hoặc đề nghị trao đổi sản phẩm.  
* Cho phép người bán quản lý tin đăng và xử lý các yêu cầu giao dịch.  
* Cung cấp công cụ quản trị tài khoản, tin đăng và báo cáo vi phạm.

**Mục tiêu kỹ thuật**

* Xây dựng ứng dụng web với giao diện người dùng và hệ thống backend.  
* Thiết kế cơ sở dữ liệu quan hệ và các API phục vụ nghiệp vụ.  
* Đảm bảo xác thực, phân quyền và tính nhất quán dữ liệu.  
* Xây dựng test case và kiểm thử các chức năng, quy tắc nghiệp vụ.

### **Phạm vi triển khai (In Scope)**

* Quản lý tài khoản và đăng nhập.  
* CRUD tin đăng và thông tin sản phẩm.  
* Phân loại thiết bị theo danh mục, thương hiệu, tình trạng.  
* Tìm kiếm và lọc tin đăng.  
* Quản lý yêu cầu mua hàng.  
* Quản lý đề nghị trao đổi sản phẩm.  
* Quản lý trạng thái giao dịch.  
* Quản trị và kiểm duyệt tin đăng.

### **Ngoài phạm vi (Out of Scope)**

* Tích hợp thanh toán trực tuyến thực tế.  
* Tích hợp API của các đơn vị vận chuyển.  
* AI gợi ý sản phẩm hoặc chatbot.  
* Định giá thiết bị tự động.  
* Đấu giá trực tuyến.  
* Hệ thống ký gửi, giữ tiền trung gian và giải quyết tranh chấp tài chính.

Trong phiên bản đầu, việc thanh toán, vận chuyển hoặc gặp mặt trao đổi do hai bên tự thỏa thuận ngoài hệ thống. Website hỗ trợ ghi nhận và theo dõi trạng thái giao dịch.

# **4\. ĐỐI TƯỢNG SỬ DỤNG VÀ CHỨC NĂNG**

### **1\. Guest \- Khách chưa đăng nhập**

* Xem danh sách và thông tin thiết bị.  
* Tìm kiếm, lọc sản phẩm.  
* Đăng ký và đăng nhập.

### **2\. Registered User \- Người dùng đã đăng nhập**

Một tài khoản có thể thực hiện cả vai trò người mua và người bán.

**Với vai trò người mua:**

* Tìm kiếm và xem chi tiết sản phẩm.  
* Gửi yêu cầu mua sản phẩm.  
* Theo dõi trạng thái yêu cầu mua.  
* Xem lịch sử giao dịch.

**Với vai trò người bán:**

* Tạo, chỉnh sửa, ẩn tin đăng sản phẩm.  
* Cập nhật giá bán, tình trạng sản phẩm.  
* Xem và xử lý yêu cầu mua hàng.  
* Cập nhật trạng thái giao dịch.

**Với vai trò người trao đổi:**

* Đánh dấu tin đăng có chấp nhận trao đổi.  
* Chọn sản phẩm của mình để đề nghị đổi lấy sản phẩm của người khác.  
* Chấp nhận hoặc từ chối đề nghị trao đổi.  
* Xác nhận hoàn thành trao đổi.

### **3\. Administrator \- Quản trị viên**

* Quản lý tài khoản người dùng.  
* Kiểm duyệt tin đăng.  
* Quản lý danh mục, thương hiệu thiết bị.  
* Xem và xử lý báo cáo vi phạm.  
* Theo dõi hoạt động của nền tảng.

### **Các thực thể dữ liệu chính**

User, Listing, Category, Brand, PurchaseRequest, ExchangeOffer, Transaction, Report.

# **5\. QUY TRÌNH NGHIỆP VỤ** 

# Hệ thống có ba quy trình chính.

### **Workflow 1 — Đăng bán sản phẩm**

Người bán đăng nhập  
→ Tạo tin đăng và nhập thông tin thiết bị  
→ Tải hình ảnh, chọn tình trạng mới/cũ  
→ Gửi tin đăng  
→ Admin kiểm duyệt  
→ Tin đăng được công khai nếu hợp lệ.

Thông tin của một tin đăng bao gồm: tên thiết bị, danh mục, thương hiệu, giá bán, mô tả, tình trạng, hình ảnh và phương thức giao dịch được chấp nhận.

### **Workflow 2 — Mua bán thiết bị**

Người mua tìm kiếm sản phẩm  
→ Xem chi tiết tin đăng  
→ Gửi yêu cầu mua  
→ Người bán xác nhận hoặc từ chối  
→ Hai bên thỏa thuận thanh toán và bàn giao  
→ Người mua xác nhận đã nhận hàng  
→ Giao dịch hoàn tất.

Hệ thống cần ngăn chặn việc xác nhận nhiều giao dịch đồng thời cho cùng một thiết bị.

### **Workflow 3 — Trao đổi thiết bị**

Người dùng A đăng bán thiết bị X, cho phép trao đổi  
→ Người dùng B chọn thiết bị Y của mình  
→ B gửi đề nghị trao đổi Y lấy X  
→ A xem thông tin và chấp nhận/từ chối  
→ Nếu đồng ý, hai thiết bị chuyển sang trạng thái đang giao dịch  
→ Hai bên thực hiện trao đổi  
→ Cả hai xác nhận hoàn thành  
→ Hệ thống cập nhật trạng thái hai tin đăng.

**Quy tắc cơ bản:**

* Một người không được tự gửi đề nghị trao đổi với chính mình.  
* Chỉ các tin đăng hợp lệ, còn khả dụng mới được giao dịch.  
* Một sản phẩm không thể tham gia hai giao dịch đã xác nhận cùng lúc.  
* Khi đề nghị bị từ chối, sản phẩm vẫn có thể tiếp tục được đăng bán.  
* Xác nhận, từ chối yêu cầu.  
* Quản lý và cập nhật trạng thái giao dịch.  
* Lịch sử giao dịch.

### **Sản phẩm bàn giao**

1. Website hoạt động với các chức năng cốt lõi.  
2. Mã nguồn và cơ sở dữ liệu.  
3. Tài liệu đặc tả yêu cầu phần mềm (SRS).  
4. Các sơ đồ thiết kế hệ thống.  
5. Bộ test case và báo cáo kết quả kiểm thử.  
6. Kịch bản demo các luồng mua bán, trao đổi, quản trị.

### **Rủi ro và phương án xử lý**

* **Phạm vi quá lớn:** Ưu tiên chức năng cốt lõi, không tích hợp thanh toán và vận chuyển thực tế.  
* **Logic giao dịch phức tạp:** Thiết kế trạng thái giao dịch và quy tắc chuyển trạng thái trước khi lập trình.  
* **Rủi ro dữ liệu không nhất quán:** Kiểm soát giao dịch trong database và bổ sung test case ngoại lệ.  
* **Thiếu thời gian:** Hoàn thiện chức năng mua bán trước; giới hạn trao đổi ở hình thức đề nghị và xác nhận cơ bản.

### **Kết luận**

Đề tài hướng đến việc xây dựng một nền tảng hỗ trợ mua bán và trao đổi thiết bị điện tử với quy trình rõ ràng và các chức năng có thể kiểm chứng.

Thông qua dự án, nhóm có thể áp dụng các kiến thức về phân tích yêu cầu, thiết kế, phát triển và kiểm thử phần mềm, phù hợp với mục tiêu của học phần Nhập môn Công nghệ phần mềm.

