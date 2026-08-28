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
      <div className="guide-section-header">
        <span className="guide-section-badge guide-badge--intro">
          {isVi ? '📱 Giới thiệu' : '📱 Overview'}
        </span>
        <p className="guide-section-desc">
          {isVi
            ? 'SpendTracking gồm 4 màn hình chính, mỗi màn hình phục vụ một mục đích riêng để giúp bạn quản lý tài chính toàn diện.'
            : 'SpendTracking has 4 main screens, each serving a specific purpose to help you manage your finances comprehensively.'}
        </p>
      </div>

      {/* Dashboard */}
      <div className="guide-item">
        <div className="guide-item__label">
          {isVi ? 'Trang chủ — Tổng quan tài chính' : 'Home — Financial Overview'}
        </div>
        <div className="guide-item__body">
          <div className="guide-item__img-wrap">
            <img src={comp1} alt="Dashboard" className="guide-item__img" />
          </div>
          <div className="guide-item__text">
            {isVi ? (
              <>
                <p>Màn hình chính hiển thị <strong>biểu đồ Thu nhập & Chi tiêu</strong> theo 7 ngày, 14 ngày hoặc tháng này, giúp bạn nắm nhanh xu hướng tài chính của mình.</p>
                <p>Bên dưới biểu đồ là 4 thẻ tóm tắt:</p>
                <ul>
                  <li><strong>Đầu tư định kì</strong> — tổng các khoản đầu tư tự động.</li>
                  <li><strong>Tổng chi tiêu</strong> — tổng tiền đã chi trong kỳ.</li>
                  <li><strong>Tổng thu nhập</strong> — tổng tiền đã nhận trong kỳ.</li>
                  <li><strong>Số dư</strong> — chênh lệch thu nhập và chi tiêu.</li>
                </ul>
                <p>Cuối trang là lời nhắc <em>"Đặt hạn mức ngay."</em> — gợi ý bạn thiết lập ngân sách để kiểm soát chi tiêu tốt hơn.</p>
              </>
            ) : (
              <>
                <p>The home screen shows an <strong>Income & Expense chart</strong> for 7 days, 14 days, or this month, giving you a quick overview of your financial trends.</p>
                <p>Below the chart are 4 summary cards:</p>
                <ul>
                  <li><strong>Recurring investments</strong> — total automatic investments.</li>
                  <li><strong>Total expenses</strong> — total money spent in the period.</li>
                  <li><strong>Total income</strong> — total money received in the period.</li>
                  <li><strong>Balance</strong> — the difference between income and expenses.</li>
                </ul>
                <p>At the bottom is the reminder <em>"Set a limit now."</em> — suggesting you set a budget for better spending control.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chi tiêu */}
      <div className="guide-item guide-item--alt">
        <div className="guide-item__label">
          {isVi ? 'Chi tiêu — Ghi nhận khoản chi' : 'Expenses — Record Spending'}
        </div>
        <div className="guide-item__body">
          <div className="guide-item__img-wrap">
            <img src={comp2} alt="Expenses" className="guide-item__img" />
          </div>
          <div className="guide-item__text">
            {isVi ? (
              <>
                <p>Màn hình <strong>Chi tiêu</strong> cho phép bạn lọc giao dịch theo <em>Năm, Tháng, Ngày</em> và <em>Danh mục</em>, giúp dễ dàng tra cứu lại từng khoản chi.</p>
                <p>Nhấn nút <strong>+</strong> (góc dưới phải) để thêm khoản chi mới. Mỗi giao dịch gồm:</p>
                <ul>
                  <li>Tiêu đề mô tả.</li>
                  <li>Danh mục (Ăn uống, Đi lại, Mua sắm...).</li>
                  <li>Số tiền và Ngày giao dịch.</li>
                </ul>
                <p>Bạn có thể nhấn vào bất kỳ giao dịch nào để <strong>chỉnh sửa</strong> hoặc <strong>xóa</strong> khi cần.</p>
              </>
            ) : (
              <>
                <p>The <strong>Expenses</strong> screen lets you filter transactions by <em>Year, Month, Day</em> and <em>Category</em>, making it easy to look up any expense.</p>
                <p>Tap the <strong>+</strong> button (bottom right) to add a new expense. Each transaction includes:</p>
                <ul>
                  <li>A descriptive title.</li>
                  <li>Category (Food, Transport, Shopping...).</li>
                  <li>Amount and Transaction date.</li>
                </ul>
                <p>Tap any transaction to <strong>edit</strong> or <strong>delete</strong> it.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Thu nhập */}
      <div className="guide-item">
        <div className="guide-item__label">
          {isVi ? 'Thu nhập — Ghi nhận khoản thu' : 'Income — Record Earnings'}
        </div>
        <div className="guide-item__body">
          <div className="guide-item__img-wrap">
            <img src={comp3} alt="Income" className="guide-item__img" />
          </div>
          <div className="guide-item__text">
            {isVi ? (
              <>
                <p>Màn hình <strong>Thu nhập</strong> hoạt động tương tự Chi tiêu, cho phép bạn ghi lại mọi nguồn thu: Lương, Thưởng, Đầu tư, Tiền tip...</p>
                <p>Bộ lọc <em>Năm / Tháng / Ngày / Danh mục</em> giúp bạn dễ dàng xem thu nhập từng giai đoạn, đối chiếu với chi tiêu để tính ra <strong>Số dư thực tế</strong>.</p>
                <p>Việc ghi nhận đầy đủ thu nhập giúp báo cáo phản ánh đúng thực trạng tài chính, từ đó bạn mới có cơ sở để lên kế hoạch tiết kiệm chính xác.</p>
              </>
            ) : (
              <>
                <p>The <strong>Income</strong> screen works similarly to Expenses, letting you record all income sources: Salary, Bonus, Investment, Tips...</p>
                <p>The <em>Year / Month / Day / Category</em> filters let you view income for any period and compare it with expenses to calculate your <strong>actual balance</strong>.</p>
                <p>Fully recording your income ensures reports accurately reflect your financial situation, giving you a solid basis for saving plans.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cài đặt */}
      <div className="guide-item guide-item--alt">
        <div className="guide-item__label">
          {isVi ? 'Cài đặt — Tuỳ chỉnh ứng dụng' : 'Settings — Customize the App'}
        </div>
        <div className="guide-item__body">
          <div className="guide-item__img-wrap">
            <img src={comp4} alt="Settings" className="guide-item__img" />
          </div>
          <div className="guide-item__text">
            {isVi ? (
              <>
                <p>Màn hình <strong>Cài đặt</strong> là trung tâm điều khiển của ứng dụng, tổng hợp các tính năng quản lý và tuỳ chỉnh:</p>
                <ul>
                  <li><strong>Tài khoản</strong> — xem & chỉnh sửa hồ sơ cá nhân.</li>
                  <li><strong>Báo cáo</strong> — xem báo cáo tài chính chi tiết.</li>
                  <li><strong>Quản lý danh mục</strong> — thêm/sửa/xóa danh mục.</li>
                  <li><strong>Đặt hạn mức</strong> — thiết lập ngân sách theo danh mục.</li>
                  <li><strong>Chi phí định kì</strong> — tự động thêm chi phí hàng tháng.</li>
                  <li><strong>Ngôn ngữ</strong> — chuyển đổi Tiếng Việt / English.</li>
                  <li><strong>Chế độ tối</strong> — bật/tắt giao diện tối.</li>
                </ul>
              </>
            ) : (
              <>
                <p>The <strong>Settings</strong> screen is the app's control center, consolidating all management and customization features:</p>
                <ul>
                  <li><strong>Account</strong> — view & edit your profile.</li>
                  <li><strong>Report</strong> — view detailed financial reports.</li>
                  <li><strong>Category Management</strong> — add/edit/delete categories.</li>
                  <li><strong>Set Budget</strong> — set budgets per category.</li>
                  <li><strong>Recurring Expenses</strong> — auto-add monthly costs.</li>
                  <li><strong>Language</strong> — switch between Vietnamese / English.</li>
                  <li><strong>Dark Mode</strong> — toggle dark interface.</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── SECTION 2: HƯỚNG DẪN SỬ DỤNG ── */}
      <div className="guide-section-header guide-section-header--second">
        <span className="guide-section-badge guide-badge--how">
          {isVi ? '📖 Hướng dẫn sử dụng' : '📖 How to Use'}
        </span>
        <p className="guide-section-desc">
          {isVi
            ? 'Tận dụng tối đa các tính năng chuyên sâu để kiểm soát tài chính một cách thông minh hơn.'
            : 'Make the most of advanced features to manage your finances more intelligently.'}
        </p>
      </div>

      {/* Báo cáo */}
      <div className="guide-item">
        <div className="guide-item__label guide-item__label--green">
          {isVi ? 'Xem Báo cáo hàng tháng' : 'View Monthly Report'}
        </div>
        <div className="guide-item__body">
          <div className="guide-item__img-wrap">
            <img src={comp5} alt="Report" className="guide-item__img" />
          </div>
          <div className="guide-item__text">
            {isVi ? (
              <>
                <p><span className="guide-num">1</span> Báo cáo sẽ giúp bạn hiểu rõ tiền của bạn được chi vào những mục đích gì. Việc này có lợi như thế nào?</p>
                <ul>
                  <li>Giúp bạn biết được những khoản chi nào <strong>không có lợi</strong>, xác định được các khoản chi tiêu theo <em>"cảm xúc"</em>.</li>
                  <li>Giúp bạn kịp thời <strong>điều chỉnh lại chi tiêu</strong> trong những tháng kế tiếp, để tránh việc <em>"làm hoài mà không thấy tiền đâu"</em>.</li>
                </ul>
                <p><span className="guide-num">2</span> <strong>Bonus:</strong></p>
                <ul>
                  <li>Ngoài ra, Báo cáo còn có thể được xem <strong>theo năm</strong> — việc này vô cùng quan trọng vì bạn sẽ không thể tưởng tượng con số bạn chi tiêu trong một năm có thể lớn hơn nhiều so với suy nghĩ của bạn.</li>
                  <li>Và dựa trên chi tiêu hàng tháng, bạn có thể ước lượng cần bao nhiêu để lập <strong>"Ngân sách dự phòng"</strong> trong khoảng 4–6 tháng.</li>
                </ul>
              </>
            ) : (
              <>
                <p><span className="guide-num">1</span> The Report helps you understand where your money goes. Why does this matter?</p>
                <ul>
                  <li>It shows you which expenses are <strong>unnecessary</strong> and identifies spending driven by <em>"impulse"</em>.</li>
                  <li>It helps you <strong>adjust spending</strong> in coming months to avoid the feeling of <em>"working all the time but money disappears"</em>.</li>
                </ul>
                <p><span className="guide-num">2</span> <strong>Bonus:</strong></p>
                <ul>
                  <li>You can also view the Report <strong>by year</strong> — this is extremely important since the annual total can be far larger than you imagine.</li>
                  <li>Based on monthly spending, you can estimate how much you need for an <strong>"Emergency Fund"</strong> covering 4–6 months.</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quản lý danh mục */}
      <div className="guide-item guide-item--alt">
        <div className="guide-item__label guide-item__label--green">
          {isVi ? 'Quản lý Danh mục' : 'Category Management'}
        </div>
        <div className="guide-item__body">
          <div className="guide-item__img-wrap">
            <img src={comp6} alt="Categories" className="guide-item__img" />
          </div>
          <div className="guide-item__text">
            {isVi ? (
              <>
                <p><span className="guide-num">1</span> Bạn có biết vì sao ví tiền của mình cứ đến cuối tháng là lại <em>"cạn kiệt"</em> mà bạn hoàn toàn không biết lý do tiền đi đâu mất? Đó là vì những khoản chi <em>"lặt vặt"</em> hàng ngày—từ ly cà phê sáng, bữa ăn vặt, đến vài lần sale nhỏ—đã âm thầm <em>"bào mòn"</em> tài khoản mà bạn không hề hay biết!</p>
                <p><span className="guide-num">2</span> Tính năng <strong>Quản lý Danh mục</strong> giúp bạn giải quyết triệt để vấn đề này:</p>
                <ul>
                  <li><em>"Gọi tên"</em> chính xác các khoản thu - chi. Giúp bạn tự do thêm, sửa hoặc xóa danh mục phù hợp với thói quen chi tiêu thực tế của mình.</li>
                  <li>Khi mọi khoản chi đều có <strong>nhãn danh mục</strong>, Báo cáo sẽ vẽ ra bức tranh tài chính rõ nét, giúp bạn biết chính xác tiền đi đâu.</li>
                </ul>
              </>
            ) : (
              <>
                <p><span className="guide-num">1</span> Do you know why your wallet is always <em>"empty"</em> at month's end with no idea where the money went? It's because small daily expenses—morning coffee, snacks, small sales—quietly <em>"erode"</em> your account without you realizing it!</p>
                <p><span className="guide-num">2</span> <strong>Category Management</strong> solves this completely:</p>
                <ul>
                  <li>Precisely <em>"name"</em> every income and expense. Freely add, edit, or delete categories to match your real spending habits.</li>
                  <li>When every transaction has a <strong>category label</strong>, the Report paints a clear financial picture so you know exactly where money goes.</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Đặt hạn mức */}
      <div className="guide-item">
        <div className="guide-item__label guide-item__label--green">
          {isVi ? 'Đặt Hạn mức chi tiêu' : 'Set Spending Limits'}
        </div>
        <div className="guide-item__body">
          <div className="guide-item__img-wrap">
            <img src={comp7} alt="Budget" className="guide-item__img" />
          </div>
          <div className="guide-item__text">
            {isVi ? (
              <>
                <p><span className="guide-num">1</span> Biết tiền đi đâu thôi là chưa đủ — bạn cần phải <strong>kiểm soát</strong> nó. <strong>Đặt hạn mức</strong> cho phép bạn gán ngân sách tối đa cho từng danh mục chi tiêu trong một khoảng thời gian cụ thể.</p>
                <p><span className="guide-num">2</span> Lợi ích thực tế:</p>
                <ul>
                  <li>Khi ghi nhận một khoản chi vượt hạn mức, ứng dụng sẽ <strong>cảnh báo</strong> ngay để bạn kịp điều chỉnh.</li>
                  <li>Buộc bạn phải suy nghĩ trước khi chi — đây chính là bước đệm để hình thành <em>thói quen chi tiêu có ý thức</em>.</li>
                  <li>Đặt hạn mức <strong>thực tế</strong> (không quá thấp) để dễ duy trì và tạo cảm giác đạt được mục tiêu.</li>
                </ul>
              </>
            ) : (
              <>
                <p><span className="guide-num">1</span> Knowing where money goes isn't enough — you need to <strong>control</strong> it. <strong>Set Budget</strong> lets you assign a maximum budget per spending category within a specific time period.</p>
                <p><span className="guide-num">2</span> Practical benefits:</p>
                <ul>
                  <li>When you log an expense that exceeds the limit, the app <strong>warns</strong> you immediately so you can adjust.</li>
                  <li>It forces you to think before spending — this is the key step toward building <em>mindful spending habits</em>.</li>
                  <li>Set <strong>realistic</strong> limits (not too low) to maintain them easily and feel the satisfaction of hitting your goals.</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chi phí định kì */}
      <div className="guide-item guide-item--alt">
        <div className="guide-item__label guide-item__label--green">
          {isVi ? 'Tự động thêm Chi phí cố định' : 'Auto-add Recurring Expenses'}
        </div>
        <div className="guide-item__body">
          <div className="guide-item__img-wrap">
            <img src={comp8} alt="Recurring" className="guide-item__img" />
          </div>
          <div className="guide-item__text">
            {isVi ? (
              <>
                <p><span className="guide-num">1</span> Bạn có bao giờ đang dùng dịch vụ thì bỗng dưng bị <em>"ngắt"</em> vì quên đóng các khoản cố định như Tiền Wifi, Gói cước điện thoại, Tiền nhà... hay tệ hơn là bận đến mức quên hạn nộp tiền?</p>
                <p><span className="guide-num">2</span> Tính năng này không chỉ <strong>thêm tự động</strong> mà còn <strong>nhắc nhở</strong> bạn chi tiêu đúng hạn. Tránh việc gián đoạn dịch vụ và giữ uy tín với các bên cho thuê hay cung cấp dịch vụ.</p>
                <p><span className="guide-num">3</span> Ngoài ra, còn giúp bạn nhận biết khoản nào <strong>thực sự cần thiết</strong>. Ví dụ: đang đăng ký Netflix để học nhưng thực tế chỉ xem vài lần một tháng — điều này cần được nhận diện để kịp thời thay đổi.</p>
                <p><span className="guide-num">4</span> <strong>Mẹo:</strong> Thiết lập sớm hơn hạn thực tế 1–2 ngày. Ví dụ: nếu phải đóng tiền mạng ngày 20, hãy đặt là ngày 18 hoặc 19 — khi khoản chi được thêm vào sẽ nhắc bạn cần đóng sớm.</p>
              </>
            ) : (
              <>
                <p><span className="guide-num">1</span> Have you ever been <em>cut off</em> from a service because you forgot to pay recurring fees like WiFi, phone plans, or rent? Or been too busy and missed the payment deadline?</p>
                <p><span className="guide-num">2</span> This feature not only <strong>adds expenses automatically</strong> but also <strong>reminds</strong> you to pay on time. Avoid service interruptions and maintain trust with landlords and service providers.</p>
                <p><span className="guide-num">3</span> It also helps you identify which subscriptions are <strong>truly necessary</strong>. For example: signing up for Netflix "to study" but only watching a few times a month — this should be identified and changed.</p>
                <p><span className="guide-num">4</span> <strong>Tip:</strong> Set the date 1–2 days before the actual deadline. For example: if you need to pay on the 20th, set it to the 18th or 19th — when the expense is added, it reminds you to pay early.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="guide-footer">
        <p>{isVi ? '🎯 Chúc bạn quản lý tài chính hiệu quả với SpendTracking!' : '🎯 Happy tracking with SpendTracking!'}</p>
      </div>
    </div>
  );
}
