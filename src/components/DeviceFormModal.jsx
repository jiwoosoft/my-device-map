import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-toastify';

const DeviceFormModal = ({ device, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [installedAt, setInstalledAt] = useState('');
  const [note, setNote] = useState('');

  const isEditing = !!device;

  useEffect(() => {
    if (isEditing) {
      setName(device.name);
      setInstalledAt(device.installed_at);
      setNote(device.note);
    } else {
      // '추가' 모드일 때 폼을 초기화합니다.
      setName('');
      setInstalledAt('');
      setNote('');
    }
  }, [device, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !installedAt) {
      toast.warn('장비명과 설치일을 입력해주세요.');
      return;
    }
    onSave({ name, installed_at: installedAt, note });
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex justify-center items-center z-[1000] pointer-events-none">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md pointer-events-auto modal-mobile">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {isEditing ? '장비 정보 수정' : '새 장비 등록'}
        </h2>
        {/* 수정 모드일 때만 안내 문구 표시 */}
        {isEditing && (
          <div className="flex items-center p-3 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg dark:bg-gray-700 dark:text-blue-300" role="alert">
            <svg className="w-5 h-5 inline mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
            <span className="font-medium">마커를 드래그하여 위치를 변경할 수 있습니다.</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            {/* 다크모드 글자색 추가 */}
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">장비명</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 modal-input-mobile"
              required
            />
          </div>
          <div className="mb-4">
            {/* 다크모드 글자색 추가 */}
            <label htmlFor="installedAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">설치일</label>
            <input
              type="date"
              id="installedAt"
              value={installedAt}
              onChange={(e) => setInstalledAt(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 modal-input-mobile"
              required
            />
          </div>
          <div className="mb-6">
            {/* 다크모드 글자색 추가 */}
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300">비고</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="3"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 modal-input-mobile"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default DeviceFormModal;