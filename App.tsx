import { useState } from 'react';
import { Minus, Plus, Trash2, BarChart2, Calendar, Info, ChevronUp, ChevronDown } from 'lucide-react';

// 메뉴 카테고리 정의
const categories = ['카테고리1', '카테고리2', '카테고리3', '카테고리4', '카테고리5', '카테고리6'];

// 메뉴 아이템 정의
const menuItems = [
  // 카테고리1 - 셰이크류
  ...Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `바나나 셰이크 ${i + 1}`,
    price: 7700,
    category: '카테고리1'
  })),
  
  // 카테고리2 - 커피류
  ...Array.from({ length: 100 }, (_, i) => ({
    id: i + 101,
    name: `아메리카노 ${i + 1}`,
    price: 4500,
    category: '카테고리2'
  })),
  
  // 카테고리3 - 디저트류
  ...Array.from({ length: 100 }, (_, i) => ({
    id: i + 201,
    name: `초코 케이크 ${i + 1}`,
    price: 6500,
    category: '카테고리3'
  })),
  
  // 카테고리4 - 차류
  ...Array.from({ length: 100 }, (_, i) => ({
    id: i + 301,
    name: `녹차 ${i + 1}`,
    price: 4500,
    category: '카테고리4'
  })),
  
  // 카테고리5 - 에이드류
  ...Array.from({ length: 100 }, (_, i) => ({
    id: i + 401,
    name: `레몬에이드 ${i + 1}`,
    price: 5500,
    category: '카테고리5'
  })),
  
  // 카테고리6 - 베이커리류
  ...Array.from({ length: 100 }, (_, i) => ({
    id: i + 501,
    name: `크로와상 ${i + 1}`,
    price: 3500,
    category: '카테고리6'
  }))
];

// 매출 데이터 샘플
const salesData = [
  { month: 'Jan', value: 750 },
  { month: 'Feb', value: 700 },
  { month: 'Mar', value: 950 },
  { month: 'Apr', value: 920 },
  { month: 'May', value: 780 },
  { month: 'Jun', value: 400 },
  { month: 'Jul', value: 780 },
  { month: 'Aug', value: 900 },
  { month: 'Sep', value: 850 },
  { month: 'Oct', value: 780 },
  { month: 'Nov', value: 880 },
  { month: 'Dec', value: 550 }
];

// 상위 판매자 데이터
const topSellers = [
  { id: 1, name: 'Emily Johnson', sales: 242 },
  { id: 2, name: 'Michael Smith', sales: 234 },
  { id: 3, name: 'Sophia Williams', sales: 222 },
  { id: 4, name: 'James Brown', sales: 122 },
  { id: 5, name: 'Olivia Davis', sales: 111 },
  { id: 6, name: 'William Anderson', sales: 100 },
  { id: 7, name: 'Ava Lee', sales: 98 }
];

function App() {
  // 상태 관리
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderItems, setOrderItems] = useState<Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>>([]);
  const [discount, setDiscount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountAmount, setDiscountAmount] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenses, setExpenses] = useState<Array<{
    id: number;
    description: string;
    amount: number;
  }>>([]);
  const [activeView, setActiveView] = useState<'order' | 'dashboard'>('order');
  const [dashboardTab, setDashboardTab] = useState<'매출현황' | '매출달력'>('매출현황');
  const [salesFilter, setSalesFilter] = useState<'어제' | '오늘' | '이번 주' | '이번 달'>('오늘');
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // 달력 관련 상태
  const [calendarView, setCalendarView] = useState<'Month' | 'Year'>('Month');
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarDateFilter, setCalendarDateFilter] = useState<'어제' | '오늘' | '이번 주' | '이번 달'>('오늘');
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);
  
  // 주문 내역 저장소
  const [completedOrders, setCompletedOrders] = useState<Array<{
    id: number;
    items: Array<{
      id: number;
      name: string;
      price: number;
      quantity: number;
    }>;
    totalAmount: number;
    discount: number;
    finalAmount: number;
    paymentMethod: string;
    timestamp: Date;
  }>>([]);

  // 페이지당 아이템 수 - 24개로 변경
  const itemsPerPage = 24;

  // 현재 카테고리의 메뉴 아이템 필터링
  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  // 현재 페이지의 메뉴 아이템
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // 페이지 변경 함수
  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 토스트 메시지 표시 함수
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    
    // 3초 후 토스트 메시지 숨기기
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // 메뉴 아이템 주문 추가 함수
  const addToOrder = (item: typeof menuItems[0]) => {
    setOrderItems(prev => {
      const existingItem = prev.find(orderItem => orderItem.id === item.id);
      
      if (existingItem) {
        return prev.map(orderItem => 
          orderItem.id === item.id 
            ? { ...orderItem, quantity: orderItem.quantity + 1 } 
            : orderItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  // 주문 아이템 수량 변경 함수
  const updateQuantity = (id: number, change: number) => {
    setOrderItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  // 주문 아이템 삭제 함수
  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setExpenseToDelete(null);
    setShowDeleteConfirmation(true);
  };

  // 지출 항목 삭제 함수
  const handleExpenseDeleteClick = (id: number) => {
    setExpenseToDelete(id);
    setItemToDelete(null);
    setShowDeleteConfirmation(true);
  };

  // 주문 아이템 또는 지출 항목 삭제 확인
  const removeItem = () => {
    if (itemToDelete !== null) {
      setOrderItems(prev => {
        const updatedItems = prev.filter(item => item.id !== itemToDelete);
        
        // 만약 모든 상품이 삭제되었다면 할인도 함께 삭제
        if (updatedItems.length === 0) {
          setDiscount(0);
        }
        
        return updatedItems;
      });
      
      setShowDeleteConfirmation(false);
      setItemToDelete(null);
      
      // 토스트 메시지 표시
      showToastMessage("상품이 삭제 되었습니다");
    } else if (expenseToDelete !== null) {
      setExpenses(prev => prev.filter(expense => expense.id !== expenseToDelete));
      setShowDeleteConfirmation(false);
      setExpenseToDelete(null);
      
      // 토스트 메시지 표시
      showToastMessage("지출 항목이 삭제 되었습니다");
    }
  };

  // 삭제 취소
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
    setExpenseToDelete(null);
  };

  // 할인 모달 열기
  const openDiscountModal = () => {
    setDiscountAmount('');
    setShowDiscountModal(true);
  };

  // 할인 모달 닫기
  const closeDiscountModal = () => {
    setShowDiscountModal(false);
  };

  // 할인 적용 함수
  const applyDiscount = () => {
    const amount = parseInt(discountAmount);
    if (!isNaN(amount) && amount > 0) {
      setDiscount(amount);
      setShowDiscountModal(false);
      
      // 토스트 메시지 표시
      showToastMessage("할인이 적용 되었습니다");
    }
  };

  // 숫자 입력 처리 - 할인
  const handleDiscountNumpadInput = (value: string) => {
    if (value === 'backspace') {
      setDiscountAmount(prev => prev.slice(0, -1));
    } else if (value === 'clear') {
      setDiscountAmount('');
    } else {
      setDiscountAmount(prev => prev + value);
    }
  };

  // 숫자 입력 처리 - 지출
  const handleExpenseNumpadInput = (value: string) => {
    if (value === 'backspace') {
      setExpenseAmount(prev => prev.slice(0, -1));
    } else if (value === 'clear') {
      setExpenseAmount('');
    } else {
      setExpenseAmount(prev => prev + value);
    }
  };

  // 지출 모달 열기
  const openExpenseModal = () => {
    setExpenseAmount('');
    setExpenseDescription('');
    setShowExpenseModal(true);
  };

  // 지출 모달 닫기
  const closeExpenseModal = () => {
    setShowExpenseModal(false);
  };

  // 지출 등록 함수
  const registerExpense = () => {
    const amount = parseInt(expenseAmount);
    if (!isNaN(amount) && amount > 0 && expenseDescription.trim() !== '') {
      const newExpense = {
        id: Date.now(),
        description: expenseDescription,
        amount: amount
      };
      
      setExpenses(prev => [...prev, newExpense]);
      setShowExpenseModal(false);
      
      // 토스트 메시지 표시
      showToastMessage("기타 지출이 등록되었습니다");
    }
  };

  // 주문 처리 함수
  const processOrder = (paymentMethod: string) => {
    // 주문 처리 로직
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = Math.max(0, subtotal - discount);
    
    // 주문 내역 저장
    const newOrder = {
      id: Date.now(),
      items: [...orderItems],
      totalAmount: subtotal,
      discount: discount,
      finalAmount: total,
      paymentMethod: paymentMethod,
      timestamp: new Date()
    };
    
    setCompletedOrders(prev => [...prev, newOrder]);
    
    // 주문 목록 초기화
    setOrderItems([]);
    setDiscount(0);
    
    // 토스트 메시지 표시
    showToastMessage("주문이 처리 되었습니다");
  };

  // 주문 총액 계산
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const total = Math.max(0, subtotal - discount);

  // 주문 내역이 비어있는지 확인
  const isOrderEmpty = orderItems.length === 0;

  // 현재 날짜 및 시간 포맷팅
  const currentDateTime = new Date().toLocaleString('ko-KR', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // 매출 데이터 최대값 계산 (차트 스케일링용)
  const maxSalesValue = Math.max(...salesData.map(item => item.value));

  // 현재 날짜 가져오기
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  
  // 날짜 비교 함수 (같은 날짜인지 확인)
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  
  // 날짜가 같은 주에 있는지 확인
  const isSameWeek = (date1: Date, date2: Date) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDayOfWeek = new Date(date2.getTime() - date2.getDay() * oneDay);
    const lastDayOfWeek = new Date(firstDayOfWeek.getTime() + 6 * oneDay);
    
    return date1 >= firstDayOfWeek && date1 <= lastDayOfWeek;
  };
  
  // 날짜가 같은 달에 있는지 확인
  const isSameMonth = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    );
  };
  
  // 어제 날짜 계산
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // 매출 데이터 필터링 함수
  const getFilteredSalesData = () => {
    // 필터에 따라 주문 데이터 필터링
    let filteredOrders = [];
    let comparisonOrdersList = [];
    
    switch (salesFilter) {
      case '어제':
        filteredOrders = completedOrders.filter(order => 
          isSameDay(order.timestamp, yesterday)
        );
        
        // 이틀 전 데이터 (비교용)
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        comparisonOrdersList = completedOrders.filter(order => 
          isSameDay(order.timestamp, twoDaysAgo)
        );
        break;
        
      case '오늘':
        filteredOrders = completedOrders.filter(order => 
          isSameDay(order.timestamp, today)
        );
        
        // 어제 데이터 (비교용)
        comparisonOrdersList = completedOrders.filter(order => 
          isSameDay(order.timestamp, yesterday)
        );
        break;
        
      case '이번 주':
        filteredOrders = completedOrders.filter(order => 
          isSameWeek(order.timestamp, today)
        );
        
        // 지난 주 데이터 (비교용)
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        comparisonOrdersList = completedOrders.filter(order => 
          isSameWeek(order.timestamp, lastWeekStart)
        );
        break;
        
      case '이번 달':
        filteredOrders = completedOrders.filter(order => 
          isSameMonth(order.timestamp, today)
        );
        
        // 지난 달 데이터 (비교용)
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        comparisonOrdersList = completedOrders.filter(order => 
          isSameMonth(order.timestamp, lastMonth)
        );
        break;
        
      default:
        filteredOrders = completedOrders.filter(order => 
          isSameDay(order.timestamp, today)
        );
        comparisonOrdersList = completedOrders.filter(order => 
          isSameDay(order.timestamp, yesterday)
        );
    }
    
    // 매출 계산
    const sales = filteredOrders.reduce((sum, order) => sum + order.finalAmount, 0);
    const comparisonSales = comparisonOrdersList.reduce((sum, order) => sum + order.finalAmount, 0);
    const salesDiff = sales - comparisonSales;
    
    // 주문 건수
    const orders = filteredOrders.length;
    const comparisonOrdersCount = comparisonOrdersList.length;
    const ordersDiff = orders - comparisonOrdersCount;
    
    // 재고 소진율 (실제로는 판매된 상품 수량을 기준으로 계산해야 함)
    // 여기서는 간단히 주문 건수 대비 판매된 상품 수량으로 계산
    const totalItems = filteredOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    
    const comparisonTotalItems = comparisonOrdersList.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    
    // 재고 소진율 계산 (예시: 전체 메뉴 아이템 중 판매된 비율)
    // 실제로는 초기 재고량 대비 판매량으로 계산해야 함
    const totalMenuItems = menuItems.length;
    const inventory = totalItems > 0 ? Math.min(Math.round((totalItems / totalMenuItems) * 100), 100) : 0;
    const comparisonInventory = comparisonTotalItems > 0 ? 
      Math.min(Math.round((comparisonTotalItems / totalMenuItems) * 100), 100) : 0;
    const inventoryDiff = inventory - comparisonInventory;
    
    return {
      sales,
      inventory,
      orders,
      comparison: { 
        sales: salesDiff, 
        inventory: inventoryDiff, 
        orders: ordersDiff 
      }
    };
  };

  // 필터링된 데이터 가져오기
  const filteredData = getFilteredSalesData();
  
  // 데이터가 있는지 확인
  const hasData = completedOrders.length > 0;
  
  // 달력 관련 함수 및 데이터
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 연도 범위 생성 (현재 연도 기준 ±5년)
  const yearRange = Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i);
  
  // 연도 선택기 토글
  const toggleYearSelector = () => {
    setShowYearSelector(!showYearSelector);
    setShowMonthSelector(false);
  };
  
  // 월 선택기 토글
  const toggleMonthSelector = () => {
    setShowMonthSelector(!showMonthSelector);
    setShowYearSelector(false);
  };
  
  // 연도 선택 처리
  const handleYearSelect = (year: number) => {
    setCalendarYear(year);
    setShowYearSelector(false);
  };
  
  // 월 선택 처리
  const handleMonthSelect = (month: number) => {
    setCalendarMonth(month);
    setShowMonthSelector(false);
  };
  
  // 달력 주 계산
  const getCalendarWeeks = () => {
    const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1);
    const lastDayOfMonth = new Date(calendarYear, calendarMonth + 1, 0);
    
    // 첫 주의 시작일 (이전 달의 날짜 포함)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // 마지막 주의 종료일 (다음 달의 날짜 포함)
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const weeks = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const week = [];
      
      for (let i = 0; i < 7; i++) {
        week.push({
          date: new Date(currentDate),
          day: currentDate.getDate(),
          isCurrentMonth: currentDate.getMonth() === calendarMonth,
          isToday: isSameDay(currentDate, today)
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(week);
    }
    
    return weeks;
  };
  
  const calendarWeeks = getCalendarWeeks();
  
  // 날짜 클릭 처리
  const handleDateClick = (date: Date) => {
    setSelectedCalendarDate(date);
    setShowDayDetails(true);
  };
  
  // 날짜 상세 정보 닫기
  const closeDayDetails = () => {
    setShowDayDetails(false);
  };
  
  // 특정 날짜의 매출 데이터 가져오기
  const getDaySalesData = (date: Date) => {
    const dayOrders = completedOrders.filter(order => isSameDay(order.timestamp, date));
    const sales = dayOrders.reduce((sum, order) => sum + order.finalAmount, 0);
    
    return {
      date,
      sales,
      orderCount: dayOrders.length,
      orders: dayOrders
    };
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 상단 바 */}
      <div className="bg-slate-800 text-white p-4 flex justify-center">
        <div className="flex space-x-8">
          <button 
            className={`px-6 py-2 ${activeView === 'order' ? 'bg-slate-700 rounded-md' : ''}`}
            onClick={() => setActiveView('order')}
          >
            주문
          </button>
          <button 
            className={`px-6 py-2 ${activeView === 'dashboard' ? 'bg-slate-700 rounded-md' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            현황
          </button>
        </div>
      </div>

      {activeView === 'order' ? (
        /* 주문 화면 */
        <div className="flex flex-1 overflow-hidden">
          {/* 왼쪽 메뉴 영역 */}
          <div className="w-3/4 flex flex-col">
            {/* 카테고리 탭 */}
            <div className="flex overflow-x-auto bg-white border-b">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-6 py-4 whitespace-nowrap font-medium ${
                    activeCategory === category 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => {
                    setActiveCategory(category);
                    setCurrentPage(1);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* 메뉴 그리드 - 24개 아이템을 보여주기 위해 그리드 조정 */}
            <div className="grid grid-cols-6 gap-2 p-4 overflow-y-auto flex-1">
              {currentItems.map(item => (
                <button
                  key={item.id}
                  className="bg-white rounded-lg shadow p-2 flex flex-col items-center justify-center h-28 hover:bg-gray-50 transition-colors"
                  onClick={() => addToOrder(item)}
                >
                  <span className="font-medium text-sm mb-1 text-center">{item.name}</span>
                  <span className="text-gray-600 text-sm">{item.price.toLocaleString()}원</span>
                </button>
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="bg-white p-4 border-t flex justify-between items-center">
              <div className="flex space-x-2">
                <button 
                  className={`px-4 py-2 rounded-md ${
                    !isOrderEmpty 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={!isOrderEmpty ? openDiscountModal : undefined}
                  disabled={isOrderEmpty}
                >
                  할인 적용
                </button>
                <button 
                  className={`px-4 py-2 rounded-md ${
                    isOrderEmpty 
                      ? 'bg-[#FFFBE6] text-[#FF8F1F] border border-[#EEEEEE]' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={isOrderEmpty ? openExpenseModal : undefined}
                  disabled={!isOrderEmpty}
                >
                  기타 지출
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  className="w-8 h-8 flex items-center justify-center border rounded-md"
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                <span className="px-2">{currentPage}</span>
                <button
                  className="w-8 h-8 flex items-center justify-center border rounded-md"
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽 주문 영역 */}
          <div className="w-1/4 bg-white border-l flex flex-col">
            {/* 주문 목록 헤더 - 시간과 금액 표시 */}
            <div className="p-3 border-b flex justify-between items-center bg-gray-50">
              <span>{currentDateTime}</span>
              <span className="font-bold">{subtotal.toLocaleString()}원</span>
            </div>

            {/* 주문 아이템 목록 */}
            <div className="flex-1 overflow-y-auto">
              {isOrderEmpty ? (
                <>
                  {/* 지출 항목 표시 */}
                  {expenses.length > 0 ? (
                    expenses.map(expense => (
                      <div key={expense.id} className="p-3 border-b bg-blue-50">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <span className="font-medium">{expense.description}</span>
                          </div>
                          <button 
                            className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-md"
                            onClick={() => handleExpenseDeleteClick(expense.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex justify-end">
                          <span className="text-right">(-) {expense.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-center">주문서가 비어있습니다</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {orderItems.map(item => (
                    <div key={item.id} className="p-3 border-b bg-blue-50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <button 
                            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-l-md"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center bg-white border-t border-b border-gray-300">
                            {item.quantity}
                          </span>
                          <button 
                            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-r-md"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button 
                          className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-md"
                          onClick={() => handleDeleteClick(item.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.name}×{item.quantity}</span>
                        <span className="text-right">{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* 할인 정보 - 빨간색으로 표시 */}
                  {discount > 0 && (
                    <div className="p-3 border-b">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-red-500">할인</span>
                        <span className="text-red-500">(-) {discount.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 결제 버튼 영역 */}
            <div className="border-t p-3">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button 
                  className="bg-blue-100 text-blue-700 py-2 rounded-md text-sm"
                  onClick={() => processOrder('현금')}
                  disabled={isOrderEmpty}
                >
                  현금
                </button>
                <button 
                  className="bg-blue-100 text-blue-700 py-2 rounded-md text-sm"
                  onClick={() => processOrder('계좌이체')}
                  disabled={isOrderEmpty}
                >
                  계좌이체
                </button>
                <button 
                  className="bg-blue-100 text-blue-700 py-2 rounded-md text-sm"
                  onClick={() => processOrder('외상')}
                  disabled={isOrderEmpty}
                >
                  외상
                </button>
              </div>
              
              {/* 총액 */}
              <button 
                className="w-full bg-blue-600 text-white py-3 rounded-md font-medium"
                onClick={() => processOrder('카드')}
                disabled={isOrderEmpty}
              >
                {isOrderEmpty && expenses.length > 0 
                  ? `(-) ${totalExpenses.toLocaleString()}원 지출 등록` 
                  : `${total.toLocaleString()}원 카드 주문`}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 대시보드 화면 */
        <div className="flex flex-1 overflow-hidden">
          {/* 왼쪽 사이드바 */}
          <div className="w-64 bg-white border-r flex flex-col">
            <div className="p-4 flex items-center">
              <BarChart2 className="text-blue-500 mr-2" size={20} />
              <span className="font-medium text-lg">현황</span>
            </div>
            
            {/* 대시보드 메뉴 */}
            <div className="flex-1">
              <div className="border-b">
                <button 
                  className={`w-full text-left p-4 ${dashboardTab === '매출현황' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                  onClick={() => setDashboardTab('매출현황')}
                >
                  매출현황
                </button>
                <button 
                  className={`w-full text-left p-4 ${dashboardTab === '매출달력' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                  onClick={() => setDashboardTab('매출달력')}
                >
                  매출달력
                </button>
              </div>
              
              {/* 카테고리 목록 */}
              <div className="p-4 border-b">
                <div className="flex items-center mb-3">
                  <span className="text-gray-500 text-sm">상품 관리</span>
                </div>
                <button className="w-full text-left py-2 text-gray-700">
                  상품
                </button>
              </div>
              
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <span className="text-gray-500 text-sm">카테고리</span>
                </div>
                {categories.map(category => (
                  <button 
                    key={category}
                    className="w-full text-left py-2 text-gray-700"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* 오른쪽 콘텐츠 영역 */}
          <div className="flex-1 overflow-y-auto">
            {/* 상단 경로 표시 */}
            <div className="bg-white p-4 border-b">
              <div className="flex items-center text-sm text-gray-500">
                <span>현황</span>
                <span className="mx-2">/</span>
                <span className="text-gray-700">{dashboardTab}</span>
              </div>
            </div>
            
            {/* 대시보드 콘텐츠 */}
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-6">{dashboardTab}</h1>
              
              {dashboardTab === '매출현황' && (
                <>
                  {/* 필터 버튼 */}
                  <div className="flex mb-6 space-x-2">
                    {(['어제', '오늘', '이번 주', '이번 달'] as const).map((filter) => (
                      <button
                        key={filter}
                        className={`px-4 py-2 rounded-md ${
                          salesFilter === filter 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-700 border'
                        }`}
                        onClick={() => setSalesFilter(filter)}
                      >
                        {filter}
                      </button>
                    ))}
                    
                    {/* 날짜 선택 */}
                    <div className="ml-auto">
                      <input
                        type="date"
                        className="px-4 py-2 border rounded-md"
                        value={selectedDate || formattedToday}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={formattedToday}
                        min={new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()).toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  {hasData ? (
                    <>
                      {/* 통계 카드 */}
                      <div className="grid grid-cols-3 gap-6 mb-8">
                        {/* 매출 카드 */}
                        <div className="bg-white rounded-lg shadow p-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500">매출</span>
                            <Info size={18} className="text-gray-400" />
                          </div>
                          <div className="text-3xl font-bold mb-2">
                            {filteredData.sales.toLocaleString()}원
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500 mr-2">이전 기간 대비</span>
                            <div className={`flex items-center ${filteredData.comparison.sales >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                              {filteredData.comparison.sales >= 0 ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                              <span>{Math.abs(filteredData.comparison.sales).toLocaleString()}원</span>
                            </div>
                          </div>
                          <div className="text-gray-500 text-sm mt-4">
                            손익: {Math.round(filteredData.sales * 0.3).toLocaleString()}원
                          </div>
                        </div>
                        
                        {/* 재고 소진율 카드 */}
                        <div className="bg-white rounded-lg shadow p-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500">재고 소진율</span>
                            <Info size={18} className="text-gray-400" />
                          </div>
                          <div className="text-3xl font-bold mb-2">
                            {filteredData.inventory}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                            <div 
                              className="bg-blue-500 h-2.5 rounded-full" 
                              style={{ width: `${filteredData.inventory}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500 mr-2">이전 기간 대비</span>
                            <div className={`flex items-center ${filteredData.comparison.inventory >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                              {filteredData.comparison.inventory >= 0 ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                              <span>{Math.abs(filteredData.comparison.inventory)}%</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* 주문건 카드 */}
                        <div className="bg-white rounded-lg shadow p-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500">주문건</span>
                            <Info size={18} className="text-gray-400" />
                          </div>
                          <div className="text-3xl font-bold mb-2">
                            {filteredData.orders}건
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500 mr-2">이전 기간 대비</span>
                            <div className={`flex items-center ${filteredData.comparison.orders >= 0 ? 'text-green-500' : 'text-blue-500'}`}>
                              {filteredData.comparison.orders >= 0 ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                              <span>{Math.abs(filteredData.comparison.orders)}건</span>
                            </div>
                          </div>
                          {filteredData.orders > 0 && (
                            <div className="text-gray-500 text-sm mt-4">
                              평균 주문액: {Math.round(filteredData.sales / filteredData.orders).toLocaleString()}원
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-lg shadow p-10 text-center mb-8">
                      <div className="text-gray-400 text-lg mb-2">데이터가 없습니다</div>
                      <p className="text-gray-500">주문을 처리하면 매출 현황이 여기에 표시됩니다.</p>
                    </div>
                  )}
                  
                  {/* 연간 매출 차트 */}
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">연간 매출</h2>
                    
                    {hasData ? (
                      <div className="relative h-80">
                        {/* Y축 레이블 */} <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-gray-500 text-sm">
                          <span>1200</span>
                          <span>900</span>
                          <span>600</span>
                          <span>300</span>
                          <span>0</span>
                        </div>
                        
                        {/* 차트 영역 */}
                        <div className="ml-10 h-full flex items-end">
                          <div className="flex-1 flex items-end justify-between h-64">
                            {salesData.map((item, index) => (
                              <div key={index} className="flex flex-col items-center">
                                <div 
                                  className="w-12 bg-blue-500 rounded-sm" 
                                  style={{ 
                                    height: `${(item.value / 1200) * 100}%`,
                                    minHeight: '4px'
                                  }}
                                ></div>
                                <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <p className="text-gray-400">데이터가 없습니다</p>
                      </div>
                    )}
                  </div>
                  
                  {/* 상품 주문건수 순위 */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">상품 주문건수 순위</h2>
                    
                    <div className="overflow-hidden">
                      <div className="flex justify-between text-gray-500 text-sm mb-2 px-4">
                        <span>상품 주문건수 순위</span>
                        <span>주문건수</span>
                      </div>
                      
                      {hasData && topSellers.length > 0 ? (
                        <div className="space-y-4">
                          {topSellers.map((seller, index) => (
                            <div key={seller.id} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                                  index < 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {index + 1}
                                </div>
                                <span>{seller.name}</span>
                              </div>
                              <span className="font-medium">{seller.sales}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          데이터가 없습니다
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {dashboardTab === '매출달력' && (
                <div className="bg-white rounded-lg shadow p-6">
                  {/* 필터 버튼 */}
                  <div className="flex mb-6 space-x-2">
                    {(['어제', '오늘', '이번 주', '이번 달'] as const).map((filter) => (
                      <button
                        key={filter}
                        className={`px-4 py-2 rounded-md ${
                          calendarDateFilter === filter 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-700 border'
                        }`}
                        onClick={() => setCalendarDateFilter(filter)}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                  
                  {/* 달력 헤더 - 년월 선택 및 뷰 선택 */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <button 
                        className="p-1 rounded-full hover:bg-gray-100"
                        onClick={() => {
                          if (calendarView === 'Month') {
                            if (calendarMonth === 0) {
                              setCalendarYear(calendarYear - 1);
                              setCalendarMonth(11);
                            } else {
                              setCalendarMonth(calendarMonth - 1);
                            }
                          } else {
                            setCalendarYear(calendarYear - 1);
                          }
                        }}
                      >
                        &lt;
                      </button>
                      
                      {/* 연도 선택 */}
                      <div className="relative mx-2">
                        <button 
                          className="px-2 py-1 font-medium hover:bg-gray-100 rounded"
                          onClick={toggleYearSelector}
                        >
                          {calendarYear}
                        </button>
                        
                        {showYearSelector && (
                          <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-10 w-48 max-h-60 overflow-y-auto">
                            <div className="grid grid-cols-3 gap-1 p-2">
                              {yearRange.map(year => (
                                <button
                                  key={year}
                                  className={`p-2 text-center rounded ${
                                    year === calendarYear ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                                  }`}
                                  onClick={() => handleYearSelect(year)}
                                >
                                  {year}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {calendarView === 'Month' && (
                        <>
                          {/* 월 선택 */}
                          <div className="relative mx-2">
                            <button 
                              className="px-2 py-1 font-medium hover:bg-gray-100 rounded"
                              onClick={toggleMonthSelector}
                            >
                              {monthNames[calendarMonth]}
                            </button>
                            
                            {showMonthSelector && (
                              <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-10 w-48">
                                <div className="grid grid-cols-3 gap-1 p-2">
                                  {monthNames.map((month, index) => (
                                    <button
                                      key={month}
                                      className={`p-2 text-center rounded ${
                                        index === calendarMonth ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                                      }`}
                                      onClick={() => handleMonthSelect(index)}
                                    >
                                      {month}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      
                      <button 
                        className="p-1 rounded-full hover:bg-gray-100"
                        onClick={() => {
                          if (calendarView === 'Month') {
                            if (calendarMonth === 11) {
                              setCalendarYear(calendarYear + 1);
                              setCalendarMonth(0);
                            } else {
                              setCalendarMonth(calendarMonth + 1);
                            }
                          } else {
                            setCalendarYear(calendarYear + 1);
                          }
                        }}
                      >
                        &gt;
                      </button>
                    </div>
                    
                    {/* 달력 뷰 선택 */}
                    <div className="flex rounded-md overflow-hidden">
                      <button 
                        className={`px-4 py-2 ${calendarView === 'Month' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border'}`}
                        onClick={() => setCalendarView('Month')}
                      >
                        Month
                      </button>
                      <button 
                        className={`px-4 py-2 ${calendarView === 'Year' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border'}`}
                        onClick={() => setCalendarView('Year')}
                      >
                        Year
                      </button>
                    </div>
                  </div>
                  
                  {calendarView === 'Month' ? (
                    /* 월별 달력 */
                    <div className="border rounded-lg overflow-hidden">
                      {/* 요일 헤더 */}
                      <div className="grid grid-cols-7 bg-gray-50 border-b">
                        {weekdayNames.map(day => (
                          <div key={day} className="p-2 text-center font-medium text-gray-500">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {/* 날짜 그리드 */}
                      <div className="divide-y">
                        {calendarWeeks.map((week, weekIndex) => (
                          <div key={weekIndex} className="grid grid-cols-7 divide-x">
                            {week.map((day, dayIndex) => {
                              // 해당 날짜의 주문 데이터 가져오기
                              const dayData = getDaySalesData(day.date);
                              const hasSales = dayData.orderCount > 0;
                              
                              return (
                                <div 
                                  key={dayIndex} 
                                  className={`min-h-[80px] p-2 ${
                                    day.isCurrentMonth 
                                      ? day.isToday 
                                        ? 'bg-blue-50' 
                                        : 'bg-white' 
                                      : 'bg-gray-50 text-gray-400'
                                  } ${
                                    selectedCalendarDate && isSameDay(day.date, selectedCalendarDate)
                                      ? 'ring-2 ring-blue-500 ring-inset'
                                      : ''
                                  } hover:bg-blue-50 cursor-pointer`}
                                  onClick={() => handleDateClick(day.date)}
                                >
                                  <div className="flex justify-between items-start">
                                    <span className={`inline-block w-6 h-6 text-center ${
                                      day.isToday ? 'bg-blue-500 text-white rounded-full' : ''
                                    }`}>
                                      {day.day}
                                    </span>
                                    
                                    {hasSales && (
                                      <span className="text-xs font-medium text-blue-600">
                                        {dayData.orderCount}건
                                      </span>
                                    )}
                                  </div>
                                  
                                  {hasSales && (
                                    <div className="mt-1 text-xs text-gray-700 font-medium">
                                      {dayData.sales.toLocaleString()}원
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* 연도별 달력 */
                    <div className="grid grid-cols-4 gap-4">
                      {monthNames.map((month, index) => {
                        // 해당 월의 첫날과 마지막 날
                        const firstDay = new Date(calendarYear, index, 1);
                        const lastDay = new Date(calendarYear, index + 1, 0);
                        
                        // 해당 월의 주문 데이터 계산
                        const monthOrders = completedOrders.filter(order => 
                          order.timestamp >= firstDay && order.timestamp <= lastDay
                        );
                        
                        const monthSales = monthOrders.reduce((sum, order) => sum + order.finalAmount, 0);
                        const orderCount = monthOrders.length;
                        
                        const isCurrentMonth = 
                          today.getFullYear() === calendarYear && 
                          today.getMonth() === index;
                        
                        return (
                          <div 
                            key={month} 
                            className={`border rounded-lg p-4 ${
                              isCurrentMonth ? 'bg-blue-50 border-blue-200' : 'bg-white'
                            } hover:bg-blue-50 cursor-pointer`}
                            onClick={() => {
                              setCalendarMonth(index);
                              setCalendarView('Month');
                            }}
                          >
                            <div className="font-medium mb-2">{month}</div>
                            
                            {orderCount > 0 ? (
                              <>
                                <div className="text-sm text-gray-500">
                                  {orderCount}건의 주문
                                </div>
                                <div className="text-sm font-medium mt-1">
                                  {monthSales.toLocaleString()}원
                                </div>
                              </>
                            ) : (
                              <div className="text-sm text-gray-400">
                                데이터 없음
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* 날짜 상세 정보 모달 */}
                  {showDayDetails && selectedCalendarDate && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                              {selectedCalendarDate.toLocaleDateString('ko-KR', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                weekday: 'long'
                              })}
                            </h2>
                            <button 
                              className="p-2 rounded-full hover:bg-gray-100"
                              onClick={closeDayDetails}
                            >
                              ✕
                            </button>
                          </div>
                          
                          {(() => {
                            const dayData = getDaySalesData(selectedCalendarDate);
                            
                            if (dayData.orderCount === 0) {
                              return (
                                <div className="text-center py-8 text-gray-500">
                                  해당 날짜에 주문 내역이 없습니다.
                                </div>
                              );
                            }
                            
                            return (
                              <>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-500 mb-1">총 매출</div>
                                    <div className="text-xl font-bold">{dayData.sales.toLocaleString()}원</div>
                                  </div>
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-500 mb-1">주문 건수</div>
                                    <div className="text-xl font-bold">{dayData.orderCount}건</div>
                                  </div>
                                </div>
                                
                                <h3 className="font-medium text-lg mb-3">주문 내역</h3>
                                <div className="overflow-y-auto max-h-96">
                                  {dayData.orders.map(order => (
                                    <div key={order.id} className="border rounded-lg p-4 mb-3">
                                      <div className="flex justify-between items-center mb-2">
                                        <div className="font-medium">
                                          {order.timestamp.toLocaleTimeString('ko-KR', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                          })}
                                        </div>
                                        <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          {order.paymentMethod}
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-1 mb-3">
                                        {order.items.map(item => (
                                          <div key={item.id} className="flex justify-between text-sm">
                                            <span>{item.name} × {item.quantity}</span>
                                            <span>{(item.price * item.quantity).toLocaleString()}원</span>
                                          </div>
                                        ))}
                                      </div>
                                      
                                      {order.discount > 0 && (
                                        <div className="flex justify-between text-sm text-red-500 border-t pt-2">
                                          <span>할인</span>
                                          <span>-{order.discount.toLocaleString()}원</span>
                                        </div>
                                      )}
                                      
                                      <div className="flex justify-between font-medium border-t pt-2 mt-2">
                                        <span>합계</span>
                                        <span>{order.finalAmount.toLocaleString()}원</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-center mb-4">
                {itemToDelete !== null ? "해당 상품을 삭제할까요?" : "해당 지출 항목을 삭제할까요?"}
              </h2>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  onClick={removeItem} >
                  {itemToDelete !== null ? "상품 삭제" : "지출 항목 삭제"}
                </button>
                <button
                  className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  onClick={cancelDelete}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 할인 입력 모달 */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-center mb-4">할인 금액을 입력해 주세요</h2>
              
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full p-3 border rounded-md text-right"
                  value={discountAmount ? `${parseInt(discountAmount || '0').toLocaleString()} 원` : '0 원'}
                  readOnly
                />
              </div>
              
              {/* 숫자 키패드 */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                  <button
                    key={num}
                    className="p-3 text-lg font-medium rounded-md bg-gray-100 text-gray-800"
                    onClick={() => handleDiscountNumpadInput(num.toString())}
                  >
                    {num}
                  </button>
                ))}
                <button
                  className="p-3 text-lg font-medium rounded-md bg-gray-200 text-gray-800"
                  onClick={() => handleDiscountNumpadInput('backspace')}
                >
                  ←
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  className={`w-full py-3 rounded-lg font-medium ${
                    discountAmount && parseInt(discountAmount) > 0
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={applyDiscount}
                  disabled={!discountAmount || parseInt(discountAmount) <= 0}
                >
                  할인 적용
                </button>
                <button
                  className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  onClick={closeDiscountModal}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 지출 입력 모달 */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-center mb-4">기타 지출을 입력해 주세요</h2>
              
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full p-3 border rounded-md"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="(필수) 지출 내용을 입력해 주세요"
                />
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full p-3 border rounded-md text-right"
                  value={expenseAmount ? `${parseInt(expenseAmount || '0').toLocaleString()} 원` : '0 원'}
                  readOnly
                />
              </div>
              
              {/* 숫자 키패드 */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                  <button
                    key={num}
                    className="p-3 text-lg font-medium rounded-md bg-gray-100 text-gray-800"
                    onClick={() => handleExpenseNumpadInput(num.toString())}
                  >
                    {num}
                  </button>
                ))}
                <button
                  className="p-3 text-lg font-medium rounded-md bg-gray-200 text-gray-800"
                  onClick={() => handleExpenseNumpadInput('backspace')}
                >
                  ←
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  className={`w-full py-3 rounded-lg font-medium ${
                    expenseAmount && parseInt(expenseAmount) > 0 && expenseDescription.trim() !== ''
                      ? 'bg-blue-400 text-white hover:bg-blue-500'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={registerExpense}
                  disabled={!expenseAmount || parseInt(expenseAmount) <= 0 || expenseDescription.trim() === ''}
                >
                  지출 등록
                </button>
                <button
                  className="w-full py-3 text-blue-500 font-medium hover:text-blue-600 transition-colors"
                  onClick={closeExpenseModal}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Message */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;