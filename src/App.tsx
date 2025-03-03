import { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

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
  })),
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
    // 여기서는 간단히 주문 목록을 초기화하고 토스트 메시지만 표시
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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 상단 바 */}
      <div className="bg-slate-800 text-white p-4 flex justify-center">
        <div className="flex space-x-8">
          <button className="px-6 py-2 bg-slate-700 rounded-md">주문</button>
          <button className="px-6 py-2">현황</button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽 메뉴 영역 */}
        <div className="w-3/4 flex flex-col">
          {/* 카테고리 탭 */}
          <div className="flex overflow-x-auto bg-white border-b">
            {categories.map((category, index) => (
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
                {index === 0 && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"></div>}
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
                    ? 'bg-[#FFFBE6] text-amber-800 border border-amber-300' 
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
                  onClick={removeItem}
                >
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