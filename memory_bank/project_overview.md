# Project Overview - Vocabulary Quiz

## Tên và Mục đích của Dự án
- **Tên**: Vocabulary Quiz
- **Mục đích**: Hỗ trợ người dùng học và ôn tập từ vựng tiếng Anh liên quan đến các chủ đề khác nhau, hiện tại tập trung vào từ vựng về gia đình.

## Kiến trúc và Cấu trúc Dự án
- Ứng dụng web đơn giản sử dụng HTML, CSS, và JavaScript.
- **Cấu trúc file**:
  - `index.html`: Giao diện chính của ứng dụng.
  - `styles.css`: Định dạng giao diện.
  - `vocabulary_quiz.js`: Chứa logic chính của ứng dụng, bao gồm việc tải dữ liệu từ vựng, quản lý câu hỏi, và kiểm tra câu trả lời.
  - `vocabulary/family_vocabulary.json`: File dữ liệu chứa danh sách từ vựng tiếng Anh và tiếng Việt.
  - `topics.js`: Có thể chứa thông tin về các chủ đề từ vựng khác (chưa kiểm tra nội dung).

## Các Tính năng Chính
- Tải dữ liệu từ vựng từ file JSON và hiển thị ngẫu nhiên từ tiếng Anh hoặc tiếng Việt để người dùng dịch.
- Kiểm tra câu trả lời của người dùng và cung cấp phản hồi (đúng/sai).
- Theo dõi tiến độ học tập với các từ đã hoàn thành và các từ trả lời sai để ôn tập lại.
- Phát âm từ tiếng Anh bằng cách sử dụng API Speech Synthesis.

## Công nghệ Sử dụng
- HTML/CSS/JavaScript cho giao diện và logic phía client.
- Fetch API để tải dữ liệu từ file JSON.
- Speech Synthesis API để phát âm từ vựng tiếng Anh.

## Hướng Dẫn Sử Dụng
- Mở file `index.html` trong trình duyệt để chạy ứng dụng.
- Người dùng sẽ thấy một từ (tiếng Anh hoặc tiếng Việt) và cần nhập từ tương ứng bằng ngôn ngữ còn lại.
- Nhấn Enter hoặc nút "Continue" để kiểm tra câu trả lời và chuyển sang từ tiếp theo.

---

**Lưu ý**: Tài liệu này được tạo ra để cung cấp cái nhìn tổng quan về dự án. Mỗi khi có yêu cầu hoặc thay đổi liên quan đến dự án, hãy tham khảo tài liệu này để hiểu rõ bối cảnh và kiến trúc của ứng dụng trước khi tiến hành.
