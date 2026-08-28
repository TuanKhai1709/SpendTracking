import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import backIcon from '../../assets/back.png';
import comp1 from '../../assets/guide_component_1.png';
import comp2 from '../../assets/guide_component_2.png';
import comp3 from '../../assets/guide_component_3.png';
import comp4 from '../../assets/guide_component_4.png';
import comp5 from '../../assets/guide_component_5.png';
import comp6 from '../../assets/guide_component_6.png';
import comp7 from '../../assets/guide_component_7.png';
import comp8 from '../../assets/guide_component_8.png';

export default function UserGuide() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const isVi = lang === 'vi';

  return (
    <div className="page guide-page">
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <img src={backIcon} alt="back" width={24} height={24} />
        </button>
        <h1 className="page-title">
          {isVi ? 'Sơ lược & Hướng dẫn sử dụng' : 'Overview & User Guide'}
        </h1>
      </div>

      {/* ── SECTION 1: GIỚI THIỆU ── */}
      <div className="guide-big-title guide-big-title--purple">
        {isVi ? 'GIỚI THIỆU' : 'OVERVIEW'}
      </div>

      <div className="guide-intro-block">
        {isVi ? (
          <>
            <p>— Chào mừng bạn đến với <strong>Spend Tracking</strong> – giải pháp đơn giản, trực quan và hiệu quả giúp bạn làm chủ dòng tiền cá nhân mỗi ngày!</p>
            <p>— Bạn có bao giờ tự hỏi: <em>Vì sao tháng nào mình cũng làm việc chăm chỉ, tăng ca làm thêm giờ, nhưng cứ đến cuối tháng là tài khoản lại về số 0 mà không hiểu tiền đã "bay" đi đâu mất?</em> Hay làm sao để vừa có thể thoải mái tận hưởng cuộc sống, vừa tích lũy được một khoản tiết kiệm cho riêng mình mà không phải chịu áp lực?</p>
            <p>— Vì thế, mình tin rằng việc quản lý tài chính không nên là một công việc phức tạp hay gây căng thẳng. Với Spend Tracking, bạn có thể dễ dàng theo dõi từng đồng chi tiêu, "nhận diện" những khoản chi vô hình đang bào mòn ví tiền của bạn, từ đó xây dựng thói quen tiết kiệm và thiết lập hạn mức thông minh chỉ sau vài thao tác chạm.</p>
          </>
        ) : (
          <>
            <p>— Welcome to <strong>Spend Tracking</strong> – a simple, intuitive and effective solution to help you take control of your personal cash flow every day!</p>
            <p>— Have you ever wondered: <em>Why do I work hard every month yet always end up with an empty account by month-end, with no idea where the money went?</em> Or how to enjoy life freely while still building personal savings without the stress?</p>
            <p>— That's why managing finances shouldn't be complicated or stressful. With Spend Tracking, you can easily track every expense, "identify" invisible costs draining your wallet, and build smart saving habits in just a few taps.</p>
          </>
        )}
      </div>

      {/* Screen 1: Dashboard */}
      <div className="guide-screen-item">
        <div className="guide-screen-label">
          {isVi ? 'Trang Home (Giao diện chính):' : 'Home Screen (Main Interface):'}
        </div>
        <div className="guide-screen-body">
          <div className="guide-screen-text">
            <p><span className="guide-num">1</span> {isVi
              ? 'Đây là trang luôn hiển thị một biểu đồ để so sánh Chi tiêu và Thu nhập trực quan nhất.'
              : 'This screen always shows a chart to visually compare your Expenses and Income.'}</p>
            <p><span className="guide-num">2</span> {isVi
              ? 'Phần "Hiện tại" hiển thị các chỉ số của tháng: Đầu tư định kì – Tổng chi tiêu – Tổng thu nhập – Số dư. Những chỉ số này giúp bạn quản lý chi tiêu tốt hơn!'
              : 'The "Current" tab shows monthly indicators: Recurring investments – Total expenses – Total income – Balance.'}</p>
            <p><span className="guide-num">3</span> {isVi
              ? 'Tiếp đến là phần hạn mức, cực kì quan trọng — luôn hiển thị ở trang chủ để bạn tiện theo dõi.'
              : 'The budget section is extremely important and always shown on the home screen for easy monitoring.'}</p>
          </div>
          <div className="guide-screen-img">
            <img src={comp1} alt="Dashboard" className="guide-img" />
          </div>
        </div>
      </div>

      {/* Screen 2: Expenses */}
      <div className="guide-screen-item">
        <div className="guide-screen-label">
          {isVi ? 'Chi tiêu – Ghi nhận khoản chi:' : 'Expenses – Record Spending:'}
        </div>
        <div className="guide-screen-body">
          <div className="guide-screen-text">
            {isVi ? (
              <>
                <p><span className="guide-num">1</span> Màn hình <strong>Chi tiêu</strong> cho phép lọc giao dịch theo <em>Năm, Tháng, Ngày</em> và <em>Danh mục</em>.</p>
                <p><span className="guide-num">2</span> Nhấn nút <strong>+</strong> (góc dưới phải) để thêm khoản chi mới: tiêu đề, danh mục, số tiền, ngày.</p>
                <p><span className="guide-num">3</span> Nhấn vào bất kỳ giao dịch nào để <strong>chỉnh sửa</strong> hoặc <strong>xóa</strong>.</p>
              </>
            ) : (
              <>
                <p><span className="guide-num">1</span> Filter transactions by <em>Year, Month, Day</em> and <em>Category</em>.</p>
                <p><span className="guide-num">2</span> Tap <strong>+</strong> to add a new expense: title, category, amount, date.</p>
                <p><span className="guide-num">3</span> Tap any transaction to <strong>edit</strong> or <strong>delete</strong> it.</p>
              </>
            )}
          </div>
          <div className="guide-screen-img">
            <img src={comp2} alt="Expenses" className="guide-img" />
          </div>
        </div>
      </div>

      {/* Screen 3: Income */}
      <div className="guide-screen-item">
        <div className="guide-screen-label">
          {isVi ? 'Thu nhập – Ghi nhận khoản thu:' : 'Income – Record Earnings:'}
        </div>
        <div className="guide-screen-body">
          <div className="guide-screen-text">
            {isVi ? (
              <>
                <p><span className="guide-num">1</span> Màn hình <strong>Thu nhập</strong> hoạt động tương tự Chi tiêu, ghi lại mọi nguồn thu: Lương, Thưởng, Đầu tư, Tiền tip...</p>
                <p><span className="guide-num">2</span> Bộ lọc <em>Năm / Tháng / Ngày / Danh mục</em> giúp xem thu nhập từng giai đoạn, đối chiếu với chi tiêu để tính <strong>Số dư thực tế</strong>.</p>
                <p><span className="guide-num">3</span> Ghi nhận đầy đủ thu nhập giúp báo cáo phản ánh đúng thực trạng và lên kế hoạch tiết kiệm chính xác hơn.</p>
              </>
            ) : (
              <>
                <p><span className="guide-num">1</span> Works like Expenses — record all income: Salary, Bonus, Investment, Tips...</p>
                <p><span className="guide-num">2</span> Filters let you view income per period and compare with expenses for your <strong>actual balance</strong>.</p>
                <p><span className="guide-num">3</span> Complete income records give a solid basis for accurate saving plans.</p>
              </>
            )}
          </div>
          <div className="guide-screen-img">
            <img src={comp3} alt="Income" className="guide-img" />
          </div>
        </div>
      </div>

      {/* Screen 4: Settings */}
      <div className="guide-screen-item">
        <div className="guide-screen-label">
          {isVi ? 'Cài đặt – Trung tâm điều khiển:' : 'Settings – Control Center:'}
        </div>
        <div className="guide-screen-body">
          <div className="guide-screen-text">
            {isVi ? (
              <>
                <p><span className="guide-num">1</span> Màn hình <strong>Cài đặt</strong> tổng hợp các tính năng quản lý và tuỳ chỉnh:</p>
                <ul className="guide-feat-list">
                  <li><strong>Tài khoản</strong> — xem & chỉnh sửa hồ sơ.</li>
                  <li><strong>Báo cáo</strong> — báo cáo tài chính chi tiết.</li>
                  <li><strong>Quản lý danh mục</strong> — thêm/sửa/xóa danh mục.</li>
                  <li><strong>Đặt hạn mức</strong> — ngân sách theo danh mục.</li>
                  <li><strong>Chi phí định kì</strong> — tự động thêm hàng tháng.</li>
                  <li><strong>Ngôn ngữ</strong> — Tiếng Việt / English.</li>
                  <li><strong>Chế độ tối</strong> — bật/tắt giao diện tối.</li>
                </ul>
              </>
            ) : (
              <>
                <p><span className="guide-num">1</span> <strong>Settings</strong> is the control center with all features:</p>
                <ul className="guide-feat-list">
                  <li><strong>Account</strong> — view & edit profile.</li>
                  <li><strong>Report</strong> — detailed financial reports.</li>
                  <li><strong>Categories</strong> — add/edit/delete categories.</li>
                  <li><strong>Set Budget</strong> — per-category limits.</li>
                  <li><strong>Recurring</strong> — auto monthly expenses.</li>
                  <li><strong>Language</strong> — Vietnamese / English.</li>
                  <li><strong>Dark Mode</strong> — toggle dark theme.</li>
                </ul>
              </>
            )}
          </div>
          <div className="guide-screen-img">
            <img src={comp4} alt="Settings" className="guide-img" />
          </div>
        </div>
      </div>

      {/* ── SECTION 2: HƯỚNG DẪN SỬ DỤNG ── */}
      <div className="guide-big-title guide-big-title--green">
        {isVi ? 'HƯỚNG DẪN SỬ DỤNG' : 'HOW TO USE'}
      </div>

      {/* Feature 1: Report */}
      <div className="guide-howto-item">
        <div className="guide-howto-label">
          {isVi ? 'Xem Báo cáo hàng tháng' : 'View Monthly Report'}
        </div>
        <div className="guide-howto-body">
          <div className="guide-howto-img">
            <img src={comp5} alt="Report" className="guide-img" />
          </div>
          <div className="guide-howto-text">
            {isVi ? (
              <>
                <p><span className="guide-num">1</span> Báo cáo giúp bạn hiểu rõ tiền được chi vào đâu. Lợi ích:</p>
                <ul className="guide-feat-list">
                  <li>Biết khoản chi nào <strong>không có lợi</strong>, xác định chi tiêu theo <em>"cảm xúc"</em>.</li>
                  <li>Kịp thời <strong>điều chỉnh chi tiêu</strong> những tháng kế tiếp, tránh <em>"làm hoài mà không thấy tiền đâu"</em>.</li>
                </ul>
                <p><span className="guide-num">2</span> <strong>Bonus:</strong> Xem báo cáo <strong>theo năm</strong> — con số cả năm có thể lớn hơn bạn tưởng. Dựa đó ước lượng <strong>"Ngân sách dự phòng"</strong> 4–6 tháng.</p>
              </>
            ) : (
              <>
                <p><span className="guide-num">1</span> Reports show where your money goes. Benefits:</p>
                <ul className="guide-feat-list">
                  <li>Spot <strong>unnecessary</strong> and <em>"impulse"</em> spending.</li>
                  <li>Timely <strong>adjust spending</strong> for next months.</li>
                </ul>
                <p><span className="guide-num">2</span> <strong>Bonus:</strong> View <strong>yearly report</strong> — the annual total may surprise you. Use it to estimate a 4–6 month <strong>"Emergency Fund"</strong>.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feature 2: Categories */}
      <div className="guide-howto-item">
        <div className="guide-howto-label">
          {isVi ? 'Quản lý Danh mục' : 'Category Management'}
        </div>
        <div className="guide-howto-body">
          <div className="guide-howto-img">
            <img src={comp6} alt="Categories" className="guide-img" />
          </div>
          <div className="guide-howto-text">
            {isVi ? (
              <>
                <p><span className="guide-num">1</span> Biết vì sao ví cứ <em>"cạn kiệt"</em> cuối tháng mà không rõ lý do? Những khoản chi <em>"lặt vặt"</em> hàng ngày đang âm thầm bào mòn tài khoản bạn!</p>
                <p><span className="guide-num">2</span> <strong>Quản lý Danh mục</strong> giúp bạn:</p>
                <ul className="guide-feat-list">
                  <li><em>"Gọi tên"</em> chính xác từng khoản thu - chi theo thói quen thực tế.</li>
                  <li>Mỗi giao dịch có <strong>nhãn danh mục</strong> → Báo cáo rõ ràng, biết tiền đi đâu.</li>
                </ul>
              </>
            ) : (
              <>
                <p><span className="guide-num">1</span> Wonder why your wallet is always <em>empty</em> at month-end? Small daily expenses quietly drain your account!</p>
                <p><span className="guide-num">2</span> <strong>Category Management</strong>:</p>
                <ul className="guide-feat-list">
                  <li>Precisely <em>"name"</em> every income and expense.</li>
                  <li>Every transaction gets a <strong>category label</strong> → clearer reports.</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feature 3: Budget */}
      <div className="guide-howto-item">
        <div className="guide-howto-label">
          {isVi ? 'Đặt Hạn mức chi tiêu' : 'Set Spending Limits'}
        </div>
        <div className="guide-howto-body">
          <div className="guide-howto-img">
            <img src={comp7} alt="Budget" className="guide-img" />
          </div>
          <div className="guide-howto-text">
            {isVi ? (
              <>
                <p><span className="guide-num">1</span> Biết tiền đi đâu thôi chưa đủ — bạn cần <strong>kiểm soát</strong> nó. <strong>Đặt hạn mức</strong> gán ngân sách tối đa cho từng danh mục trong khoảng thời gian cụ thể.</p>
                <p><span className="guide-num">2</span> Lợi ích thực tế:</p>
                <ul className="guide-feat-list">
                  <li>Ứng dụng <strong>cảnh báo</strong> khi chi vượt hạn mức để kịp điều chỉnh.</li>
                  <li>Buộc suy nghĩ trước khi chi → hình thành <em>thói quen chi tiêu có ý thức</em>.</li>
                  <li>Đặt hạn mức <strong>thực tế</strong> (không quá thấp) để dễ duy trì.</li>
                </ul>
              </>
            ) : (
              <>
                <p><span className="guide-num">1</span> Knowing where money goes isn't enough — you need to <strong>control</strong> it. Assign a max budget per category within a time period.</p>
                <p><span className="guide-num">2</span> Benefits:</p>
                <ul className="guide-feat-list">
                  <li>App <strong>warns</strong> you when an expense exceeds the limit.</li>
                  <li>Forces thinking before spending → builds <em>mindful habits</em>.</li>
                  <li>Set <strong>realistic</strong> limits for sustainable progress.</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feature 4: Recurring */}
      <div className="guide-howto-item">
        <div className="guide-howto-label">
          {isVi ? 'Tự động thêm Chi phí cố định' : 'Auto-add Recurring Expenses'}
        </div>
        <div className="guide-howto-body">
          <div className="guide-howto-img">
            <img src={comp8} alt="Recurring" className="guide-img" />
          </div>
          <div className="guide-howto-text">
            {isVi ? (
              <>
                <p><span className="guide-num">1</span> Bạn có bao giờ bị <em>"ngắt"</em> dịch vụ vì quên đóng Wifi, điện thoại, tiền nhà... hay bận đến quên hạn nộp tiền?</p>
                <p><span className="guide-num">2</span> Tính năng này <strong>thêm tự động</strong> và <strong>nhắc nhở</strong> bạn đúng hạn. Tránh gián đoạn dịch vụ và giữ uy tín.</p>
                <p><span className="guide-num">3</span> Còn giúp nhận biết khoản nào <strong>thực sự cần thiết</strong> (ví dụ: đăng ký Netflix nhưng ít dùng — cần nhận diện để thay đổi).</p>
                <p><span className="guide-num">4</span> <strong>Mẹo:</strong> Đặt sớm hơn 1–2 ngày so với hạn thực tế để nhắc nhở kịp thời.</p>
              </>
            ) : (
              <>
                <p><span className="guide-num">1</span> Ever been <em>cut off</em> from WiFi, phone or rent due to forgotten payments?</p>
                <p><span className="guide-num">2</span> This feature <strong>auto-adds</strong> and <strong>reminds</strong> you on time. No more service interruptions.</p>
                <p><span className="guide-num">3</span> Helps identify which subscriptions are <strong>truly necessary</strong>.</p>
                <p><span className="guide-num">4</span> <strong>Tip:</strong> Set the date 1–2 days before the actual deadline as an early reminder.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="guide-footer">
        <p>{isVi ? '🎯 Chúc bạn quản lý tài chính hiệu quả với SpendTracking!' : '🎯 Happy tracking with SpendTracking!'}</p>
      </div>
    </div>
  );
}
