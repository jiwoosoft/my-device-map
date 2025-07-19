import { useState, useEffect } from 'react';

/**
 * localStorage와 상태를 동기화하는 커스텀 훅
 * @param {string} key localStorage에 저장될 키
 * @param {*} initialValue 초기값
 * @returns {[*, function]} [저장된 값, 값을 업데이트하는 함수]
 */
function useLocalStorage(key, initialValue) {
  // 1. localStorage에서 값을 읽어오거나 초기값을 사용해 state를 초기화합니다.
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // 에러 발생 시 초기값을 사용합니다.
      console.error(error);
      return initialValue;
    }
  });

  // 2. storedValue가 변경될 때마다 localStorage에 값을 저장합니다.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage; 